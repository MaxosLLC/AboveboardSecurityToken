pragma solidity ^0.4.18;

import "../zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "./contracts/ITransferManager.sol";
import "../interfaces/WhiteList.sol";
import "./AboveboardSettingsStorage.sol";

contract AboveboardTransferManager is ITransferManager {

  event ReplaceStorage(address oldStorage, address newStorage);

  MintableToken public deployedToken;

  AboveboardSettingsStorage public settingsStorage;

  /**
   * @dev Validate contract address
   * Credit: https://github.com/Dexaran/ERC223-token-standard/blob/Recommended/ERC223_Token.sol#L107-L114
   *
   * @param _addr The address of a smart contract
   */
  modifier withContract(address _addr) {
    uint length;
    assembly { length := extcodesize(_addr) }
    require(length > 0);
    _;
  }

  /**
   * @notice Constructor
   *
   * @param _securityToken The address of the `SecurityToken`
   * @param _polyAddress The address of the `PolymathToken`
   *
   */
  constructor (address _securityToken, address _polyAddress, address _storage) public IModule(_securityToken, _polyAddress) {
    require(_storage != address(0));
    settingsStorage = AboveboardSettingsStorage(_storage);
    deployedToken = MintableToken(_securityToken);
  }

  function getPermissions() public view returns(bytes32[]) {
    bytes32[] memory allPermissions = new bytes32[](0);
    return allPermissions;
  }

  function getInitFunction() public returns(bytes4) {
    return bytes4(0);
  }

  /*
   * @notice This method gets called during an ST20 "transfer".
   *         The implementation *SHOULD* check whether or not a transfer can be approved.
   *
   * @dev    This method *MAY* call back to the token contract specified by `_token` for
   *         more information needed to enforce trade approval.
   *
   * @param  _from The address of the sender account
   * @param  _to The address of the receiver account
   * @param  _amount The quantity of the token to trade
   * @param  _isTransfer n/a
   *
   * @return Result The polymath reason code: "VALID" or "FORCE_VALID" means success.
   */
  function verifyTransfer(address _from, address _to, uint256 /*_amount*/, bool /*_isTransfer*/) public returns (Result) {
    address owner = deployedToken.owner();
    bool isCompany = _from == owner || _to == owner;

    // trading is locked, can transfer to or from company account
    if (settingsStorage.locked() && !isCompany) {
      return Result.INVALID;
    }

    // if newShareholdersAllowed is not enabled, the transfer will only succeed if the buyer already has tokens or tranfers to or from company account
    if (!settingsStorage.newShareholdersAllowed() && deployedToken.balanceOf(_to) == 0 && !isCompany) {
      return Result.INVALID;
    }

    bool t;
    string memory wlTo;
    (t,wlTo) = settingsStorage.isWhiteListed(_to);
    if (!t && !isCompany) {
      return Result.INVALID;
    }

    // receiver is under Regulation D, Non-US investors can trade at any time
    // only company account can send to US investors first year, US investors cannot sell these shares in the first year, except to the company account
    if (keccak256(wlTo) == keccak256("RegD")
      && block.timestamp < settingsStorage.initialOfferEndDate()
      && !isCompany) {
      return Result.INVALID;
    }

    return Result.VALID;
  }

  /**
   * @dev Replace the current SettingsStorage
   *
   * @param _storage The address of the `SettingsStorage`
   *
   */
  function replaceStorage(address _storage) withContract(_storage) public {
    address owner = deployedToken.owner();
    require(msg.sender == owner);

    address oldStorage = settingsStorage;
    settingsStorage = AboveboardSettingsStorage(_storage);
    ReplaceStorage(oldStorage, _storage);
  }
}

pragma solidity ^0.4.18;

import "./zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "./interfaces/WhiteList.sol";
import "./interfaces/IRegulatorService.sol";
import "./SettingsStorage.sol";

/// @notice Standard interface for `RegulatorService`s
contract RegulatorService is IRegulatorService, Ownable {

  SettingsStorage public settingsStorage;

  // @dev Check success code
  uint8 constant private CHECK_SUCCESS = 0;

  // @dev Check error reason: Token is locked
  uint8 constant private CHECK_ELOCKED = 1;

  // @dev Check error reason: New shareholders are not allowed
  uint8 constant private CHECK_ERALLOW = 2;

  // @dev Check error reason: Sender is not allowed to send the token
  uint8 constant private CHECK_ESEND = 3;

  // @dev Check error reason: Receiver is not allowed to receive the token
  uint8 constant private CHECK_ERECV = 4;

  // @dev Check error reason: Transfer before initial offering end date
  uint8 constant private CHECK_ERREGD = 5;

  // @dev Check error reason: Sender is not officer
  uint8 constant private CHECK_EROFF = 6;

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
   * @param _storage The address of the `SettingsStorage`
   */
  constructor (address _storage) public {
    require(_storage != address(0));
    settingsStorage = SettingsStorage(_storage);
  }

  /*
   * @notice This method *MUST* be called by `RegulatedToken`s during `transfer()` and `transferFrom()`.
   *         The implementation *SHOULD* check whether or not a transfer can be approved.
   *
   * @dev    This method *MAY* call back to the token contract specified by `_token` for
   *         more information needed to enforce trade approval.
   *
   * @param  _from The address of the sender account
   * @param  _to The address of the receiver account
   * @param  _amount The quantity of the token to trade
   *
   * @return uint8 The reason code: 0 means success.  Non-zero values are left to the implementation
   *               to assign meaning.
   */
  function check(address _token, address _from, address _to, uint256 _amount) public returns (uint8) {
    // trading is locked, can transfer to or from company account
    if (settingsStorage.locked()) {
      return CHECK_ELOCKED;
    }

    // if newShareholdersAllowed is not enabled, the transfer will only succeed if the buyer already has tokens or tranfers to or from company account
    if (!settingsStorage.newShareholdersAllowed() && MintableToken(_token).balanceOf(_to) == 0) {
      return CHECK_ERALLOW;
    }

    bool f;
    string memory wlFrom;
    (f, wlFrom) = settingsStorage.isWhiteListed(_from);

    bool t;
    string memory wlTo;
    (t, wlTo) = settingsStorage.isWhiteListed(_to);

    if (!t) {
      return CHECK_ERECV;
    }

    // receiver is under Regulation D, Non-US investors can trade at any time
    // only company account can send to US investors first year, US investors cannot sell these shares in the first year, except to the company account
    // transfer rule for US Reg D / S / 144a. This will have a special case for addresses that are on the QIB whitelist
    if (keccak256(wlTo) == keccak256("RegD")
      && block.timestamp < settingsStorage.initialOfferEndDate()
      && keccak256(wlFrom) != keccak256("qib")) {
      return CHECK_ERREGD;
    }

    return CHECK_SUCCESS;
  }

  // the sender is the multisig wallet, or the _from is the company account and the sender is the issuer
  function checkArbitrage(address _sender, address _token, address _from, address _to, uint256 _amount) public returns (uint8) {
    bool isOfficer = settingsStorage.officers(_sender);
    address tokenOwner = MintableToken(_token).owner();

    if (_from != tokenOwner && !isOfficer && _sender != tokenOwner) {

      if (_from != tokenOwner) {
        return CHECK_ERECV;
      }

      return CHECK_EROFF;
    }

    return CHECK_SUCCESS;
  }

  /**
   * @dev Replace the current SettingsStorage
   *
   * @param _storage The address of the `SettingsStorage`
   *
   */
  function replaceStorage(address _storage) onlyOwner withContract(_storage) public {
    address oldStorage = settingsStorage;
    settingsStorage = SettingsStorage(_storage);
    ReplaceStorage(oldStorage, _storage);
  }
}

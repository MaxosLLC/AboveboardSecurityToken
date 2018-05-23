pragma solidity ^0.4.18;

import "./zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "./zeppelin-solidity/contracts/token/ERC20/BasicToken.sol";
import "./interfaces/WhiteList.sol";
import "./interfaces/IRegulatorService.sol";
import "./SettingsStorage.sol";

/// @notice Standard interface for `RegulatorService`s
contract AboveboardRegDSWhitelistRegulatorService is IRegulatorService, Ownable {

  SettingsStorage settingsStorage;

  // @dev Check success code
  uint8 constant private CHECK_SUCCESS = 0;

  // @dev Check error reason: Token is locked
  uint8 constant private CHECK_ELOCKED = 1;

  // @dev Check error reason: Token can not trade partial amounts
  uint8 constant private CHECK_EDIVIS = 2;

  // @dev Check error reason: Sender is not allowed to send the token
  uint8 constant private CHECK_ESEND = 3;

  // @dev Check error reason: Receiver is not allowed to receive the token
  uint8 constant private CHECK_ERECV = 4;

  // @dev Check error reason: Transfer before initial offering end date
  uint8 constant private CHECK_ERREGD = 5;

  // @dev Check error reason: New shareholders are not allowed
  uint8 constant private CHECK_ERALLOW = 6;

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
   * @param _storage The address of the `SettingsStorage`
   *
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
   * @param  _token The address of the token to be transfered
   * @param  _from The address of the sender account
   * @param  _to The address of the receiver account
   * @param  _amount The quantity of the token to trade
   *
   * @return uint8 The reason code: 0 means success.  Non-zero values are left to the implementation
   *               to assign meaning.
   */
  function check(address _token, address _from, address _to, uint256 _amount) public returns (uint8) {
    if (settingsStorage.getLocked(_token)) {
      return CHECK_ELOCKED;
    }

    // if newShareholdersAllowed is not enabled, the transfer will only succeed if the buyer already has tokens
    if (!settingsStorage.newShareholdersAllowed(_token) && BasicToken(_token).balanceOf(_to) == 0) {
      return CHECK_ERALLOW;
    }

    bool f;
    address wlFrom;
    (f, wlFrom) = settingsStorage.isWhiteListed(_from);
    if (!f) {
      return CHECK_ESEND;
    }

    bool t;
    address wlTo;
    (t,wlTo) = settingsStorage.isWhiteListed(_to);
    if (!t) {
      return CHECK_ERECV;
    }

    // sender or receiver is under Regulation D, Non-US investors can trade at any time
    if ((wlFrom == settingsStorage.getRegDWhitelist(_token) || wlTo == settingsStorage.getRegDWhitelist(_token))
      && block.timestamp < settingsStorage.getInititalOfferEndDate(_token)
      && _from != settingsStorage.getIssuerAddress(_token)            // only issuer can send to US investors first year
      && _to != settingsStorage.getIssuerAddress(_token)) {           // US investors cannot sell these shares in the first year, except to the issuer
      return CHECK_ERREGD;
    }

    if (!settingsStorage.getPartialTransfers(_token) && _amount % _wholeToken(_token) != 0) {
      return CHECK_EDIVIS;
    }

    return CHECK_SUCCESS;
  }

  /**
   * @notice Retrieves the whole token value from a token that this `RegulatorService` manages
   *
   * @param  _token The token address of the managed token
   *
   * @return The uint256 value that represents a single whole token
   */
  function _wholeToken(address _token) view private returns (uint256) {
    return uint256(10)**DetailedERC20(_token).decimals();
  }

  /**
   * @notice Get Settings Storage address
   *
   * @return Settings Storage address
   */
  function getStorageAddress() view public returns (address) {
    return settingsStorage;
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

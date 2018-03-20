pragma solidity ^0.4.18;

import 'contracts/interfaces/WhiteList.sol';

/// @notice Standard interface for `RegulatorService`s

interface IRegulatorService {

  /// @dev Event raised when a token's locked setting is set
  event LogLockSet(address indexed token, bool locked);

  /// @dev Event raised when a token's partial transfer setting is set
  event LogPartialTransferSet(address indexed token, bool enabled);

  /**
   * @notice Triggered when an initial offering end date is set
   *
   * @param  token Address of the token
   * @param  _date Initial offering end date
   */
  event InititalOfferEndDateSet(address token, uint256 _date);

  /**
   * @notice Triggered when whitelist is added to the array
   *
   * @param  whitelist Address of the whitelist
   */
  event WhitelistAdded(address whitelist);

  /**
   * @notice Triggered when a whitelist is deleted from the array
   *
   * @param  whitelist Address of the whitelist which is added
   */
  event WhitelistRemoved(address whitelist);

  /**
   * @notice Triggered when a Regulation D whitelist is set
   *
   * @param  token Address of the token
   * @param  whitelist Address of the Regulation D whitelist
   */
   event RegulationDWhitelistSet(address token, address whitelist);

  /**
   * @notice Triggered when an issuer is set
   *
   * @param  token Address of the token
   * @param  _issuer Address of an issuer
   */
  event IssuerSet(address token, address _issuer);

  /**
   * @notice Triggered when an issuer is removed
   *
   * @param  token Address of the token
   */
  event IssuerRemoved(address token);

  /**
   * @notice Triggered when a messaging address is set
   *
   * @param  _address Address of a messaging service
   */
  event MessagingAddressSet(address _address);

  /**
   * @notice Triggered when a messaging address is removed
   */
  event MessagingAddressRemoved();

  /**
   * @dev Add a new whitelist
   *
   * @param  _whitelist The actual whitelist which is added to the array
   */
  function addWhitelist(WhiteList _whitelist) public;

  /**
   * @dev Remove a whitelist from the array
   *
   * @param  _whitelist The actual whitelist which is deleted from the array
   */
  function removeWhitelist(WhiteList _whitelist) public;

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
  function check(address _token, address _from, address _to, uint256 _amount) public returns (uint8);
  
}

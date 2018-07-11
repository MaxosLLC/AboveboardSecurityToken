pragma solidity ^0.4.18;

import "../IssuanceWhiteList.sol";

/// @notice Standard interface for `RegulatorService`s

interface ISettingsStorage {

  /// @dev Event raised when a token's locked setting is set
  event LogLockSet(bool locked);

  /// @dev Event raised when a token's partial transfer setting is set
  event LogPartialTransferSet(bool enabled);

  /**
   * @notice Triggered when an initial offering end date is set
   *
   * @param  _date Initial offering end date
   */
  event InititalOfferEndDateSet(uint256 _date);

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
   * @param  whitelist Address of the Regulation D whitelist
   */
  event RegulationDWhitelistSet(address whitelist);

  /**
   * @notice Triggered when an issuer is set
   *
   * @param  _issuer Address of an issuer
   */
  event IssuerSet(address _issuer);

  /**
   * @notice Triggered when a messaging address is set
   *
   * @param  _address Address of a messaging service
   */
  event MessagingAddressSet(string _address);

  /**
   * @notice Triggered when a new shareholders allowed/disallowed
   *
   * @param  allow True for allowing new shareholders
   */
  event NewShareholdersAllowance(bool allow);

  /**
   * @dev Add a new whitelist
   *
   * @param  _whitelist The actual whitelist which is added to the array
   */
  function addWhitelist(IssuanceWhiteList _whitelist) public;

  /**
   * @dev Remove a whitelist from the array
   *
   * @param  _whitelist The actual whitelist which is deleted from the array
   */
  function removeWhitelist(IssuanceWhiteList _whitelist) public;
}

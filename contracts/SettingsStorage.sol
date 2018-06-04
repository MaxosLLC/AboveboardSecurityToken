pragma solidity ^0.4.18;

import "./zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./interfaces/WhiteList.sol";
import "./interfaces/ISettingsStorage.sol";

contract SettingsStorage is ISettingsStorage, Ownable {

  struct Settings {

    /**
     * @dev Toggle for locking/unlocking trades at a token level.
     *      The default behavior of the zero memory state for locking will be unlocked.
     */
    bool locked;

    /**
     * @dev Toggle for allowing/disallowing fractional token trades at a token level.
     *      The default state when this contract is created `false` (or no partial
     *      transfers allowed).
     */
    bool partialTransfers;

    /// @dev Toggle for allowing/disallowing new shareholders
    bool newShareholdersAllowed;

    /// @dev Address of Regulation D Whitelist
    address regDWhitelist;

    /// @dev Issuer of the token
    address issuer;

    /// @dev Initial offering end date
    uint256 initialOfferEndDate;

    /// @dev Messaging address
    string messagingAddress;
  }

  /// @dev Array of whitelists
  WhiteList[] whitelists;

  /// @notice Permissions that allow/disallow token trades on a per token level
  mapping(address => Settings) settings;

  /**
   * @notice Locks the ability to trade a token
   *
   * @dev    This method can only be called by this contract's owner
   *
   * @param  _token The address of the token to lock
   */
  function setLocked(address _token, bool _locked) onlyOwner public {
    settings[_token].locked = _locked;
    LogLockSet(_token, _locked);
  }

  function getLocked(address _token) view public returns(bool) {
    return settings[_token].locked;
  }

  /**
   * @notice Allows the ability to trade a fraction of a token
   *
   * @dev    This method can only be called by this contract's owner
   *
   * @param  _token The address of the token to allow partial transfers
   */
  function setPartialTransfers(address _token, bool _enabled) onlyOwner public {
    settings[_token].partialTransfers = _enabled;
    LogPartialTransferSet(_token, _enabled);
  }

  function getPartialTransfers(address _token) view public returns(bool) {
    return settings[_token].partialTransfers;
  }

  function addWhitelist(WhiteList _whitelist) onlyOwner public {

    //check that we don't pass an empty list
    require(_whitelist != address(0));
    bool contains = false;

    //Loop through array to see if the whitelist is present
    for (uint256 i = 0; i < whitelists.length; i++) {
      if (whitelists[i] == _whitelist) {

        //if it is, change the value of contains and stop
        contains = true;
        break;
      }
    }

    //if not, push it into the array
    if (!contains) {
      whitelists.push(_whitelist);
      WhitelistAdded(_whitelist);
    }
  }

  /**
   * @notice Set Regulation D whitelist
   *
   * @param  _token Address of the token
   * @param  _whitelist Regulation D whitelist address
   */
  function setRegDWhitelist(address _token, address _whitelist) onlyOwner public {
    settings[_token].regDWhitelist = _whitelist;
    RegulationDWhitelistSet(_token, _whitelist);
  }

  function getRegDWhitelist(address _token) view public returns(address) {
    return settings[_token].regDWhitelist;
  }

  function removeWhitelist(WhiteList _whitelist) onlyOwner public {

    //check that we don't pass an empty list
    require(_whitelist != address(0));

    //Loop through array to see if the whitelist is present
    for (uint256 i = 0; i < whitelists.length; i++) {

      //if we find it, we remove it from the list
      if (whitelists[i] == _whitelist) {
        remove(i);
        WhitelistRemoved(_whitelist);
        return;
      }
    }
  }

  function remove(uint256 index) private {
    //check that the index doesn't exceed the list length
    if (index >= whitelists.length)
      return;

    //move each list with one position on the left
    for (uint256 i = index; i < whitelists.length-1; i++) {
        whitelists[i] = whitelists[i+1];
    }

    //delete the last whitelist and decrease the array length
    delete whitelists[whitelists.length-1];
    whitelists.length--;
  }

  /**
   * @notice Get whitelists
   *
   * @return WhiteList[] Array of whitelists
   */
  function getWhitelists() view public returns (WhiteList[]) {
    return whitelists;
  }

  /**
   * @notice Check if address is indeed in one of the whitelists
   *
   * @param _address Buyer to be added to whitelist
   *
   * @return True if buyer is added to whitelist, otherwise false
   */
  function isWhiteListed(address _address) view public returns (bool, address) {
    for (uint256 i = 0; i < whitelists.length; i++) {
      if (whitelists[i].verify(_address))
        return (true, whitelists[i]);
    }
    return (false, address(0));
  }

  /**
   * @notice Set initial offering end date
   *
   * @param  _token The address of the token
   * @param  _date Initial offering end date
   */
  function setInititalOfferEndDate(address _token, uint256 _date) onlyOwner public {
    settings[_token].initialOfferEndDate = _date;
    InititalOfferEndDateSet(_token, _date);
  }

  function getInititalOfferEndDate(address _token) view public returns(uint256) {
    return settings[_token].initialOfferEndDate;
  }

  /**
   * @notice Set issuer of token
   *
   * @param  _token The address of the token
   * @param  _issuer Issuer to be set
   */
  function setIssuer(address _token, address _issuer) onlyOwner public {
    require(_issuer != address(0));
    settings[_token].issuer = _issuer;
    IssuerSet(_token, _issuer);
  }

  /**
   * @notice Remove issuer of token
   *
   * @param  _token The address of the token
   */
  function removeIssuer(address _token) onlyOwner public {
    settings[_token].issuer = address(0);
    IssuerRemoved(_token);
  }

  /**
   * @notice Get issuer's address
   *
   * @param  _token The address of the token
   */
  function getIssuerAddress(address _token) view public returns (address) {
    return settings[_token].issuer;
  }

  /**
   * @notice Get messaging address
   *
   * @param  _token The address of the token
   */
  function getMessagingAddress(address _token) view public returns (string) {
    return settings[_token].messagingAddress;
  }

  /**
   * @notice Set messaging address
   *
   * @param  _token The address of the token
   * @param  _address Messaging address to be set
   */
  function setMessagingAddress(address _token, string _address) onlyOwner public {
    settings[_token].messagingAddress = _address;
    MessagingAddressSet(_address);
  }

  /**
   * @notice Allow/disallow new shareholders
   *
   * @param  _token The address of the token
   * @param  allow Allow/disallow new shareholders
   */
  function allowNewShareholders(address _token, bool allow) onlyOwner public {
    settings[_token].newShareholdersAllowed = allow;
    NewShareholdersAllowance(_token, allow);
  }

  function newShareholdersAllowed(address _token) view public returns(bool) {
    return settings[_token].newShareholdersAllowed;
  }
}

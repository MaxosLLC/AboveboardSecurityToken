pragma solidity ^0.4.18;

import "./zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./IssuanceWhiteList.sol";
import "./interfaces/ISettingsStorage.sol";

contract SettingsStorage is ISettingsStorage, Ownable {

  struct Settings {

    /**
     * @dev Toggle for locking/unlocking trades at a token level.
     *      The default behavior of the zero memory state for locking will be unlocked.
     */
    bool locked;

    /// @dev Toggle for allowing/disallowing new shareholders
    bool newShareholdersAllowed;

    /// @dev Issuer of the token
    address issuer;

    /// @dev Initial offering end date
    uint256 initialOfferEndDate;

    /// @dev Messaging address
    string messagingAddress;
  }

  /// @dev Array of whitelists
  IssuanceWhiteList[] whitelists;

  /// @notice Permissions that allow/disallow token trades on a per token level
  mapping(address => Settings) settings;

  /**
   * @notice Locks the ability to trade a token
   *
   * @dev    This method can only be called by this contract's owner
   *
   * @param  _token The address of the token to lock
   */
  function setLocked(address _token, bool _locked) public {

    require(msg.sender == settings[_token].issuer);

    settings[_token].locked = _locked;
    LogLockSet(_token, _locked);
  }

  function getLocked(address _token) view public returns(bool) {
    return settings[_token].locked;
  }

  function addWhitelist(IssuanceWhiteList _whitelist) onlyOwner public {

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

  function removeWhitelist(IssuanceWhiteList _whitelist) onlyOwner public {

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
  function getWhitelists() view public returns (IssuanceWhiteList[]) {
    return whitelists;
  }

  /**
   * @notice Check if address is indeed in one of the whitelists
   *
   * @param _address Buyer to be added to whitelist
   *
   * @return True if buyer is added to whitelist, otherwise false
   */
  function isWhiteListed(address _address) view public returns (bool, string) {
    for (uint256 i = 0; i < whitelists.length; i++) {
      if (whitelists[i].verify(_address))
        return (true, whitelists[i].whitelistType());
    }
    return (false, "");
  }

  /**
   * @notice Set initial offering end date
   *
   * @param  _token The address of the token
   * @param  _date Initial offering end date
   */
  function setInititalOfferEndDate(address _token, uint256 _date) public {

    require(msg.sender == settings[_token].issuer);

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
  function setIssuer(address _token, address _issuer) public {
    require((msg.sender == settings[_token].issuer && settings[_token].issuer != address(0)) ||
            (msg.sender == owner && settings[_token].issuer == address(0)));
    settings[_token].issuer = _issuer;
    IssuerSet(_token, _issuer);
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
  function setMessagingAddress(address _token, string _address) public {

    require(msg.sender == owner || msg.sender == settings[_token].issuer);

    settings[_token].messagingAddress = _address;
    MessagingAddressSet(_address);
  }

  /**
   * @notice Allow/disallow new shareholders
   *
   * @param  _token The address of the token
   * @param  allow Allow/disallow new shareholders
   */
  function allowNewShareholders(address _token, bool allow) public {

    require(msg.sender == settings[_token].issuer);

    settings[_token].newShareholdersAllowed = allow;
    NewShareholdersAllowance(_token, allow);
  }

  function newShareholdersAllowed(address _token) view public returns(bool) {
    return settings[_token].newShareholdersAllowed;
  }
}

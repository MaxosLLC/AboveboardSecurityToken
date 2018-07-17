pragma solidity ^0.4.18;

import "./zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./IssuanceWhiteList.sol";
import "./interfaces/ISettingsStorage.sol";

contract SettingsStorage is ISettingsStorage, Ownable {

  /**
    * @dev Toggle for locking/unlocking trades at a token level.
    *      The default behavior of the zero memory state for locking will be unlocked.
    */
  bool public locked;

  /// @dev Toggle for allowing/disallowing new shareholders
  bool public newShareholdersAllowed;

  /// @dev Issuer of the token
  address public issuer;

  /// @dev Initial offering end date
  uint256 public initialOfferEndDate;

  /// @dev Messaging address
  string public messagingAddress;

  /// @dev Array of whitelists
  IssuanceWhiteList[] whitelists;

  mapping(string => bool) issuerPermissions;

  function setIssuerPermission(string permission, bool setting) public {

    require (msg.sender == owner);

    issuerPermissions[permission] = setting;
  }

  /**
   * @notice Locks the ability to trade a token
   *
   * @dev    This method can only be called by this contract's issuer
   *
   * @param  _locked True for lock the token
   */
  function setLocked(bool _locked) public {

    require(issuerPermissions["locked"] && msg.sender == issuer || msg.sender == owner);

    locked = _locked;
    LogLockSet(_locked);
  }

  /**
   * @notice Get whitelists
   *
   * @return IssuanceWhiteList[] Array of whitelists
   */
  function getWhitelists() view public returns (IssuanceWhiteList[]) {
    return whitelists;
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
   * @param  _date Initial offering end date
   */
  function setInititalOfferEndDate(uint256 _date) public {

    require(issuerPermissions["locked"] && msg.sender == issuer || msg.sender == owner);

    initialOfferEndDate = _date;
    InititalOfferEndDateSet(_date);
  }

  /**
   * @notice Set issuer of token
   *
   * @param  _issuer Issuer to be set
   */
  function setIssuer(address _issuer) public {

    require((msg.sender == issuer && issuer != address(0)) ||
            (msg.sender == owner && issuer == address(0)));

    issuer = _issuer;
    IssuerSet(_issuer);
  }

  /**
   * @notice Set messaging address
   *
   * @param  _address Messaging address to be set
   */
  function setMessagingAddress(string _address) public {

    require(issuerPermissions["locked"] && msg.sender == issuer || msg.sender == owner);

    messagingAddress = _address;
    MessagingAddressSet(_address);
  }

  /**
   * @notice Allow/disallow new shareholders
   *
   * @param  allow Allow/disallow new shareholders
   */
  function allowNewShareholders(bool allow) public {

    require(issuerPermissions["locked"] && msg.sender == issuer || msg.sender == owner);

    newShareholdersAllowed = allow;
    NewShareholdersAllowance(allow);
  }
}

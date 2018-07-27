pragma solidity ^0.4.18;

import "./IssuanceWhiteList.sol";
import "./interfaces/ISettingsStorage.sol";

contract SettingsStorage is ISettingsStorage {

  /**
    * @dev Toggle for locking/unlocking trades at a token level.
    *      The default behavior of the zero memory state for locking will be unlocked.
    */
  bool public locked;

  /// @dev Toggle for allowing/disallowing new shareholders
  bool public newShareholdersAllowed;

  /// @dev Issuers of the token
  mapping(address => bool) public officers;

  /// @dev Initial offering end date
  uint256 public initialOfferEndDate;

  /// @dev Messaging address
  string public messagingAddress;

  /// @dev Owner of the Regulated Token
  address public tokenOwner;

  /// @dev Array of whitelists
  IssuanceWhiteList[] whitelists;

  mapping(string => bool) issuerPermissions;

  /**
   * @notice Constructor
   */
  constructor () public {
    tokenOwner = msg.sender;
  }

  function setTokenOwner(address _owner) public {
    require(_owner != address(0));
    require(officers[msg.sender] || msg.sender == tokenOwner);

    tokenOwner = _owner;
  }

  function setIssuerPermission(string permission, bool setting) public {
    require (msg.sender == tokenOwner);

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
    require(issuerPermissions["setLocked"] && officers[msg.sender] || msg.sender == tokenOwner);

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

  function addWhitelist(IssuanceWhiteList _whitelist) public {
    //check that we don't pass an empty list
    require(_whitelist != address(0));
    require(issuerPermissions["addWhitelist"] && officers[msg.sender] || msg.sender == tokenOwner);

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

  function removeWhitelist(IssuanceWhiteList _whitelist) public {
    //check that we don't pass an empty list
    require(_whitelist != address(0));
    require(issuerPermissions["removeWhitelist"] && officers[msg.sender] || msg.sender == tokenOwner);

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
    require(issuerPermissions["setInititalOfferEndDate"] && officers[msg.sender] || msg.sender == tokenOwner);

    initialOfferEndDate = _date;
    InititalOfferEndDateSet(_date);
  }

  /**
   * @notice Set officer of token
   *
   * @param  _officer Officer to be set
   */
  function addOfficer(address _officer) public {
    require((officers[msg.sender] && _officer != address(0)) ||
            msg.sender == tokenOwner);

    officers[_officer] = true;
    OfficerAdded(_officer);
  }

  /**
   * @notice Remove officer of token
   *
   * @param  _officer Officer to be removed
   */
  function removeOfficer(address _officer) public {
    require((officers[msg.sender] && _officer != address(0)) ||
            msg.sender == tokenOwner);

    officers[_officer] = true;
    OfficerRemoved(_officer);
  }

  /**
   * @notice Set messaging address
   *
   * @param  _address Messaging address to be set
   */
  function setMessagingAddress(string _address) public {
    require(issuerPermissions["setMessagingAddress"] && officers[msg.sender] || msg.sender == tokenOwner);

    messagingAddress = _address;
    MessagingAddressSet(_address);
  }

  /**
   * @notice Allow/disallow new shareholders
   *
   * @param  allow Allow/disallow new shareholders
   */
  function allowNewShareholders(bool allow) public {
    require(issuerPermissions["allowNewShareholders"] && officers[msg.sender] || msg.sender == tokenOwner);

    newShareholdersAllowed = allow;
    NewShareholdersAllowance(allow);
  }
}

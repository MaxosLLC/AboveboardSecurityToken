pragma solidity ^0.4.18;

import 'contracts/zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'contracts/zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol';
import 'contracts/interfaces/WhiteList.sol';
import 'contracts/interfaces/IRegulatorService.sol';

/// @notice Standard interface for `RegulatorService`s
contract RegulatorService is IRegulatorService, Ownable {

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
  }

  /// @dev Issuer of the token
  address private issuer;

  /// @dev Messaging address
  address private messagingAddress;

  /// @dev Initial offering end date
  uint256 private initialOfferEndDate;

  /// @dev Array of whitelists
  WhiteList[] whitelists;

  /// @notice Permissions that allow/disallow token trades on a per token level
  mapping(address => Settings) private settings;

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
    WhitelistRemoved(whitelists[whitelists.length-1]);

    delete whitelists[whitelists.length-1];

    whitelists.length--;
  }

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
    if (settings[_token].locked) {
      return CHECK_ELOCKED;
    }

    if (!isWhiteListed(_from)) {
      return CHECK_ESEND;
    }

    if (!isWhiteListed(_to)) {
      return CHECK_ERECV;
    }

    if (!settings[_token].partialTransfers && _amount % _wholeToken(_token) != 0) {
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
   * @notice Check if address is indeed in one of the whitelists
   *
   * @param _address Buyer to be added to whitelist
   *
   * @return True if buyer is added to whitelist, otherwise false
   */
  function isWhiteListed(address _address) private returns (bool) {
    for (uint256 i = 0; i < whitelists.length; i++) {
      if (whitelists[i].verify(_address))
        return true;
    }
    return false;
  }

  /**
   * @notice Set initial offering end date
   *
   * @param  _date Initial offering end date
   */
  function setInititalOfferEndDate(uint256 _date) onlyOwner public {
    initialOfferEndDate = _date;
    InititalOfferEndDateSet(_date);
  }

  /**
   * @notice Set issuer of token
   *
   * @param  _issuer Issuer to be set
   */
  function setIssuer(address _issuer) onlyOwner public {
    require(_issuer != address(0));
    issuer = _issuer;
    IssuerSet(issuer);
  }

  /**
   * @notice Remove issuer of token
   */
  function removeIssuer() onlyOwner public {
    issuer = address(0);
    IssuerRemoved();
  }

  /**
   * @notice Get issuer's address
   */
  function getIssuerAddress() constant public returns (address) {
    return issuer;
  }

  /**
   * @notice Get messaging address
   */
  function getMessagingAddress() constant public returns (address) {
    return messagingAddress;
  }

  /**
   * @notice Set messaging address
   *
   * @param  _address Messaging address to be set
   */
  function setMessagingAddress(address _address) onlyOwner public {
    require(_address != address(0));
    messagingAddress = _address;
    MessagingAddressSet(_address);
  }

  /**
   * @notice Remove messaging address
   */
  function removeMessagingAddress() onlyOwner public {
    messagingAddress = address(0);
    MessagingAddressRemoved();
  }

}

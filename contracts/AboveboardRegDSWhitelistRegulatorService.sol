pragma solidity ^0.4.18;

import "./zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "./zeppelin-solidity/contracts/token/ERC20/BasicToken.sol";
import "./interfaces/WhiteList.sol";
import "./RegulatorService.sol";

/// @notice Standard interface for `RegulatorService`s
contract AboveboardRegDSWhitelistRegulatorService is RegulatorService {

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

  /**
   * @notice Get whitelists
   *
   * @return WhiteList[] Array of whitelists
   */
  function getWhitelists() constant public returns (WhiteList[]) {
    return whitelists;
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
   * @notice Set initial offering end date
   *
   * @param  _token The address of the token
   * @param  _date Initial offering end date
   */
  function setInititalOfferEndDate(address _token, uint256 _date) onlyOwner public {
    settings[_token].initialOfferEndDate = _date;
    InititalOfferEndDateSet(_token, _date);
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
  function getIssuerAddress(address _token) constant public returns (address) {
    return settings[_token].issuer;
  }

  /**
   * @notice Get messaging address
   */
  function getMessagingAddress() constant public returns (string) {
    return messagingAddress;
  }

  /**
   * @notice Set messaging address
   *
   * @param  _address Messaging address to be set
   */
  function setMessagingAddress(string _address) onlyOwner public {
    messagingAddress = _address;
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
}

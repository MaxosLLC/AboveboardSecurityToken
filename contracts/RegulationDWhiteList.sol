pragma solidity ^0.4.15;

import 'contracts/zeppelin-solidity/contracts/lifecycle/Pausable.sol';
import 'contracts/interfaces/IIssuanceWhiteList.sol';

/**
 * @title RegulationDWhiteList
 * @dev Regulation D WhiteList
 */
contract RegulationDWhiteList is WhiteList, Pausable {

  /// @dev Event raised when release date is set for buyer
  event ReleaseDateSet(address _buyer, uint256 _releaseDate);

  mapping(address => uint256) members; // member => release date

  /// @dev Verifies that a member is already added
  /// @param _buyer Address of a member that we check to see if it's in the whitelist
  function verify(address _buyer) whenNotPaused public constant returns (bool) {
    return !paused && members[_buyer] > 0 && members[_buyer] < now;
  }

  /// @dev Set release date for buyer
  /// @param _buyer Address of a member that is added to the whitelist
  /// @param _releaseDate Date when buyer can start trading
  function setReleaseDate(address _buyer, uint256 _releaseDate) public returns (bool) {
    members[_buyer] = _releaseDate;
    ReleaseDateSet(_buyer, _releaseDate);
  }

  /// @dev Adds a member in the member mapping
  /// @param _buyer Address of a member that is added to the whitelist
  function add(address _buyer) public returns (bool) {
    members[_buyer] = 0;
    MemberAdded(_buyer);
  }

  /// @dev Deletes a member from the member mapping
  /// @param _buyer Address of a member that is deleted from the whitelist
  function remove(address _buyer) public returns (bool) {
    members[_buyer] = 0;
    MemberRemoved(_buyer);
  }
}

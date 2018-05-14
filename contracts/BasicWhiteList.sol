pragma solidity ^0.4.18;

import "./interfaces/WhiteList.sol";

/**
 * @title BasicWhiteList
 * @dev Basic implementation of a WhiteList
 */
contract BasicWhiteList is WhiteList {

  mapping(address => bool) members;
  
  function verify(address _buyer) public constant returns (bool) {
    return members[_buyer];
  }

  function add(address _buyer) public returns (bool) {
    members[_buyer] = true;
    MemberAdded(_buyer);
  }

  function addBuyers(address[] _buyers) public returns (bool) {
    for (uint256 i = 0; i < _buyers.length; i++) {
      members[_buyers[i]] = true;
      MemberAdded(_buyers[i]);
    }
  }

  function remove(address _buyer) public returns (bool) {
    members[_buyer] = false;
    MemberRemoved(_buyer);
  }

}

pragma solidity ^0.4.15;

import 'contracts/interfaces/WhiteList.sol';

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

  function remove(address _buyer) public returns (bool) {
    members[_buyer] = false;
    MemberRemoved(_buyer);
  }

}

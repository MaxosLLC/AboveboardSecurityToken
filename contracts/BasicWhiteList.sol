pragma solidity ^0.4.18;

import "./interfaces/WhiteList.sol";

/**
 * @title BasicWhiteList
 * @dev Basic implementation of a WhiteList
 */
contract BasicWhiteList is WhiteList {

  mapping(address => bool) members;
  address[] membersAddress;
  mapping(address => uint256) membersIndex;

  function verify(address _buyer) view public returns (bool) {
    return members[_buyer];
  }

  function add(address _buyer) public returns (bool) {

    if (!members[_buyer]) {
      uint256 id = membersAddress.length;
      membersIndex[_buyer] = id;
      membersAddress.push(_buyer);
    }

    members[_buyer] = true;

    MemberAdded(_buyer);
  }

  function addBuyers(address[] _buyers) public returns (bool) {
    for (uint256 i = 0; i < _buyers.length; i++) {

      if (!members[_buyers[i]]) {
        uint256 id = membersAddress.length;
        membersIndex[_buyers[i]] = id;
        membersAddress.push(_buyers[i]);
      }

      members[_buyers[i]] = true;

      MemberAdded(_buyers[i]);
    }
  }

  function remove(address _buyer) public returns (bool) {

    if (members[_buyer]) {
      uint256 id = membersIndex[_buyer];
      delete membersAddress[id];
    }

    members[_buyer] = false;

    MemberRemoved(_buyer);
  }

  function getBuyers() view public returns (address[]) {
    return membersAddress;
  }

}

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

  function verify(address _buyer) public constant returns (bool) {
    return members[_buyer];
  }

  function add(address _buyer) public returns (bool) {
    members[_buyer] = true;
    uint256 id = membersAddress.length;
    membersIndex[_buyer] = id;
    membersAddress.push(_buyer);

    MemberAdded(_buyer);
  }

  function addBuyers(address[] _buyers) public returns (bool) {
    for (uint256 i = 0; i < _buyers.length; i++) {
      members[_buyers[i]] = true;
      uint256 id = membersAddress.length;
      membersIndex[_buyers[i]] = id;
      membersAddress.push(_buyers[i]);

      MemberAdded(_buyers[i]);
    }
  }

  function remove(address _buyer) public returns (bool) {
    members[_buyer] = false;
    uint256 id = membersIndex[_buyer];
    delete membersAddress[id];

    MemberRemoved(_buyer);
  }

  function getBuyers() constant public returns (address[]) {
    return membersAddress;
  }

}

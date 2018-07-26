pragma solidity ^0.4.18;

import "./interfaces/IIssuanceWhiteList.sol";
import "./zeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title IssuanceWhiteList
 * @dev WhiteList for an AboveBoard issued token. Owner is the issuer.
 */
contract IssuanceWhiteList is IIssuanceWhiteList, Ownable {

  address agent;
  mapping(address => bool) members;
  mapping(address => bool) qualifiers;
  address[] membersAddress;
  address[] qualifiersAddress;
  mapping(address => uint256) qualifiersIndex;
  mapping(address => uint256) membersIndex;

  string public whitelistType;

  modifier onlyAgentOrOwner() {
    require(msg.sender == owner || msg.sender == agent);
    _;
  }

  modifier onlyAgentOrOwnerOrQualifier() {
    require(msg.sender == owner || msg.sender == agent || qualifiers[msg.sender]);
    _;
  }

  function setAgent(address _agent) onlyOwner public {

    agent = _agent;
    NewAgentAssigned(_agent);
    
  }

  function setWhitelistType(string _whitelistType) onlyOwner public {
    whitelistType = _whitelistType;
    WhitelistTypeSet(_whitelistType);
  }

  function addQualifier(address _qualifier) onlyAgentOrOwner public {
    qualifiers[_qualifier] = true;
    uint256 id = qualifiersAddress.length;
    qualifiersIndex[_qualifier] = id;
    qualifiersAddress.push(_qualifier);
    QualifierAdded(_qualifier);
  }

  function removeQualifier(address _qualifier) onlyAgentOrOwner public {
    qualifiers[_qualifier] = false;
    uint256 id = qualifiersIndex[_qualifier];
    delete qualifiersAddress[id];
    QualifierRemoved(_qualifier);
  }

  function add(address _buyer) onlyAgentOrOwnerOrQualifier public returns (bool) {
    if (!members[_buyer]) {
      uint256 id = membersAddress.length;
      membersIndex[_buyer] = id;
      membersAddress.push(_buyer);
    }

    members[_buyer] = true;

    MemberAdded(_buyer);
  }

  function addBuyers(address[] _buyers) onlyAgentOrOwnerOrQualifier public returns (bool) {
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

  function remove(address _buyer) onlyAgentOrOwnerOrQualifier public returns (bool) {
    if (members[_buyer]) {
      uint256 id = membersIndex[_buyer];
      delete membersAddress[id];
    }

    members[_buyer] = false;

    MemberRemoved(_buyer);
  }

  function verify(address _buyer) view public returns (bool) {
    return members[_buyer] == true;
  }

  function getBuyers() onlyAgentOrOwnerOrQualifier view public returns (address[]) {
    return membersAddress;
  }

  function getQualifiers() onlyAgentOrOwnerOrQualifier view public returns (address[]) {
    return qualifiersAddress;
  }
}

pragma solidity ^0.4.18;

import "./interfaces/IIssuanceWhiteList.sol";
import "./zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./MessagingAddress.sol";

/**
 * @title IssuanceWhiteList
 * @dev WhiteList for an AboveBoard issued token. Owner is the issuer.
 */
contract IssuanceWhiteList is IIssuanceWhiteList, Ownable, MessagingAddress {

  address agent;

  mapping(address => kyc) members;
  address[] membersAddress;
  mapping(address => uint256) membersIndex;

  mapping(address => bool) qualifiers;
  address[] qualifiersAddress;
  mapping(address => uint256) qualifiersIndex;

  string public whitelistType;

  modifier onlyAgentOrOwner() {
    require(msg.sender == owner || msg.sender == agent);
    _;
  }

  modifier onlyAgentOrOwnerOrQualifier() {
    require(msg.sender == owner || msg.sender == agent || qualifiers[msg.sender]);
    _;
  }

  /**
   * @notice Constructor
   * @param _whitelistType Type of the `IssuanceWhiteList`
   */
  constructor (string _whitelistType, string _messagingAddress, string _messagingAddressType) public
    MessagingAddress(_messagingAddress, _messagingAddressType) {
    whitelistType = _whitelistType;
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

  function add(address _buyer, string _kycStatus, uint256 _kycExpDate, string _accreditationStatus, string _jurisdiction) onlyAgentOrOwnerOrQualifier public returns (bool) {
    if (!members[_buyer].approved) {
      uint256 id = membersAddress.length;
      membersIndex[_buyer] = id;
      membersAddress.push(_buyer);
    }

    members[_buyer] = kyc({approved:true, kycStatus:_kycStatus, kycExpDate:_kycExpDate, accreditationStatus:_accreditationStatus, jurisdiction:_jurisdiction});

    MemberAdded(_buyer);
  }

  function addBuyers(address[] _buyers) onlyAgentOrOwnerOrQualifier public returns (bool) {
    for (uint256 i = 0; i < _buyers.length; i++) {

      if (!members[_buyers[i]].approved) {
        uint256 id = membersAddress.length;
        membersIndex[_buyers[i]] = id;
        membersAddress.push(_buyers[i]);
      }

      members[_buyers[i]] = kyc({approved:true, kycStatus:"", kycExpDate:0, accreditationStatus:"", jurisdiction:""});

      MemberAdded(_buyers[i]);
    }
  }

  function remove(address _buyer) onlyAgentOrOwnerOrQualifier public returns (bool) {
    if (members[_buyer].approved) {
      uint256 id = membersIndex[_buyer];
      delete membersAddress[id];
    }

    members[_buyer].approved = false;

    MemberRemoved(_buyer);
  }

  function verify(address _buyer) view public returns (bool) {
    return members[_buyer].approved == true;
  }

  function getBuyers() onlyAgentOrOwnerOrQualifier view public returns (address[]) {
    return membersAddress;
  }

  function getBuyerKyc(address _buyer) onlyAgentOrOwnerOrQualifier view public returns (bool, string, uint256, string, string) {
    return (members[_buyer].approved, members[_buyer].kycStatus, members[_buyer].kycExpDate, members[_buyer].accreditationStatus, members[_buyer].jurisdiction);
  }

  function getQualifiers() onlyAgentOrOwnerOrQualifier view public returns (address[]) {
    return qualifiersAddress;
  }

  function getAgentsOwnerAndQualifiers() onlyAgentOrOwnerOrQualifier view public returns (address[]) {
    address[] memory agentOwnerAndQualifiers = new address[](qualifiersAddress.length + 2);

    agentOwnerAndQualifiers[0] = owner;
    agentOwnerAndQualifiers[1] = agent;

    for (uint i = 0; i < qualifiersAddress.length; i++) {
      agentOwnerAndQualifiers[i + 2] = qualifiersAddress[i];
    }

    return agentOwnerAndQualifiers;
  }
}

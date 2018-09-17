pragma solidity ^0.4.18;

import "./zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./interfaces/IMessagingAddress.sol";

contract MessagingAddress is IMessagingAddress, Ownable {

  string public messagingAddress;
  string public messagingAddressType;

  function setMessagingAddress(string _address) onlyOwner public {
    messagingAddress = _address;
    MessagingAddressSet(_address);
  }

  function setMessagingAddressType(string _type) onlyOwner public {
    messagingAddressType = _type;
    MessagingAddressTypeSet(_type);
  }

  function setMessagingAddressAndType(string _address, string _type) onlyOwner public {
    messagingAddress = _address;
    messagingAddressType = _type;
    MessagingAddressSet(_address);
    MessagingAddressTypeSet(_type);
  }
}

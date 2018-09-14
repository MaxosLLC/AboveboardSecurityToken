pragma solidity ^0.4.18;

import "./zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./interfaces/IMessagingAddress.sol";

contract MessagingAddress is IMessagingAddress, Ownable {

  string public messagingAddress;
  string public messagingAddressType;

  /**
   * @notice Constructor
   * @param _messagingAddress Messaging Address
   * @param _messagingAddressType Type of the `_messagingAddress`
   */
  constructor (string _messagingAddress, string _messagingAddressType) public {
    messagingAddress = _messagingAddress;
    messagingAddressType = _messagingAddressType;
  }

  function setMessagingAddress(string _address) onlyOwner public {
    messagingAddress = _address;
    MessagingAddressSet(_address);
  }

  function setMessagingAddressType(string _type) onlyOwner public {
    messagingAddressType = _type;
    MessagingAddressTypeSet(_type);
  }
}

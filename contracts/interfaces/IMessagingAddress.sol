pragma solidity ^0.4.18;

interface IMessagingAddress {

  /**
   * @notice Triggered when a messaging address is set
   *
   * @param  _messagingAddress Address of a messaging service
   */
  event MessagingAddressSet(string _messagingAddress);

  /**
   * @notice Triggered when a messaging address type is set
   *
   * @param  _messagingAddressType Type of a messaging address
   */
  event MessagingAddressTypeSet(string _messagingAddressType);

  /**
   * @dev Add a new whitelist
   *
   * @param  _address The Messaging Address
   */
  function setMessagingAddress(string _address) public;

  /**
   * @dev Remove a whitelist from the array
   *
   * @param  _type The Messaging Address Type
   */
  function setMessagingAddressType(string _type) public;
}

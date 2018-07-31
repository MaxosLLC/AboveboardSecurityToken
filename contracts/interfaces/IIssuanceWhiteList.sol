pragma solidity ^0.4.18;

import "./WhiteList.sol";

contract IIssuanceWhiteList is WhiteList {

  /**
   * @notice Triggered when a new aggent is assigned to the whitelist
   */
  event NewAgentAssigned(address newAgent);

  /**
   * @notice Triggered when a new qualifier is added to the qualifier mapping
   */
  event QualifierAdded(address qualifier);

  /**
   * @notice Triggered when a qualifier is deleted from the mapping
   */
  event QualifierRemoved(address qualifier);

  /**
   * @notice Triggered when a whitelist type is set
   */
  event WhitelistTypeSet(string _whitelistType);

  /// @dev Set the agent for the whitelist
  /// @param _agent Address of agent that will be assigned
  function setAgent(address _agent) public;

  /// @dev Add a qualifier to the mapping
  /// @param _qualifier Address of qualifier that will be added
  function addQualifier(address _qualifier) public;

  /// @dev Remove a qualifier from the mapping
  /// @param _qualifier Address of qualifier that will be removed
  function removeQualifier(address _qualifier) public;

  /// @dev Get qualifiers
  /// @return Addresses of qualifiers
  function getQualifiers() view public returns (address[]);

  /// @dev Get the owner, agent and all qualifiers
  /// @return Addresses of owner, agent and all qualifiers
  function getAgentsOwnerAndQualifiers() view public returns (address[]);
}

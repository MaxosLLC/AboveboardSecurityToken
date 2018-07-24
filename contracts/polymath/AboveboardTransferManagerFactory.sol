pragma solidity ^0.4.24;

import "./AboveboardTransferManager.sol";
import "../SettingsStorage.sol";

contract AboveboardTransferManagerFactory is IModuleFactory {
  constructor (address _polyAddress, uint256 _setupCost, uint256 _usageCost, uint256 _subscriptionCost)
  public
  IModuleFactory(_polyAddress, _setupCost, _usageCost, _subscriptionCost) {
  }

  function deploy(bytes _data) external returns(address) {
    SettingsStorage settingsStorage = new SettingsStorage();
    AboveboardTransferManager aboveboardTransferManager = new AboveboardTransferManager(msg.sender, address(polyToken), settingsStorage);
    require(getSig(_data) == aboveboardTransferManager.getInitFunction());
    require(address(aboveboardTransferManager).call(_data));
    return address(aboveboardTransferManager);
  }

  function getCost() public view returns(uint256) {
    return 0;
  }

  function getType() public view returns(uint8) {
    return 2;
  }

  function getName() public view returns(bytes32) {
    return "AboveboardTransferManager";
  }

  function getDescription() public view returns(string) {
    return "Use this module to power the Aboveboard Issuer Registry";
  }

  function getTitle() public view returns(string) {
    return "Aboveboard Transfer Manager";
  }

  function getInstructions() public view returns(string) {
    return "Aboveboard Transfer Manager - use the Aboveboard Issuer Registry to access shareholder data and control your token security";
  }
}
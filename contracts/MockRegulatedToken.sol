pragma solidity ^0.4.18;

import "./RegulatedToken.sol";
import "./AboveboardRegDSWhitelistRegulatorService.sol";

contract MockRegulatedToken is RegulatedToken {

  AboveboardRegDSWhitelistRegulatorService public service;
  uint public decimals;

  // 0xffffffff is a test address for ServiceRegistry that is bypassed by our _service() implementation
  function MockRegulatedToken(address _service) public
    RegulatedToken(ServiceRegistry(0xffffffff), "MockToken", "MTKN")
  {
    service = AboveboardRegDSWhitelistRegulatorService(_service);
  }

  function setDecimals(uint _decimals) public {
    decimals = _decimals;
  }

  function _service() constant public returns (AboveboardRegDSWhitelistRegulatorService) {
    return service;
  }
}
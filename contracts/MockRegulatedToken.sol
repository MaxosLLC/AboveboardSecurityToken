pragma solidity ^0.4.18;

import "./RegulatedToken.sol";
import "./RegulatorService.sol";

contract MockRegulatedToken is RegulatedToken {

  RegulatorService public service;
  uint public decimals;

  // 0xffffffff is a test address for RegulatorService that is bypassed by our service implementation
  function MockRegulatedToken(address _service) public
    RegulatedToken(RegulatorService(0xffffffff), "MockToken", "MTKN", 0, "", "")
  {
    service = RegulatorService(_service);
  }

  function setDecimals(uint _decimals) public {
    decimals = _decimals;
  }
}

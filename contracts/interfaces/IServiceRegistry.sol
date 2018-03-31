pragma solidity ^0.4.18;

import "../zeppelin-solidity/contracts/ownership/Ownable.sol";

contract IServiceRegistry is Ownable {

  /**
   * @notice Triggered when service address is replaced
   */
  event ReplaceService(address oldService, address newService);

  /**
   * @notice Replaces the address pointer to the `RegulatorService`
   *
   * @dev This method is only callable by the contract's owner
   *
   * @param _service The address of the new `RegulatorService`
   */

  function replaceService(address _service) public;

}
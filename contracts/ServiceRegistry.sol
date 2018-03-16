pragma solidity ^0.4.18;

import 'contracts/interfaces/IServiceRegistry.sol';

/// @notice A service that points to a `RegulatorService`

contract ServiceRegistry is IServiceRegistry {

  address public service;

  /**
   * @dev Validate contract address
   * Credit: https://github.com/Dexaran/ERC223-token-standard/blob/Recommended/ERC223_Token.sol#L107-L114
   *
   * @param _addr The address of a smart contract
   */
  modifier withContract(address _addr) {

    uint length;
    assembly { length := extcodesize(_addr) }
    require(length > 0);
    _;

  }

  /**
   * @notice Constructor
   *
   * @param _service The address of the `RegulatorService`
   *
   */
  function ServiceRegistry(address _service) public {

    service = _service;

  }

  /**
   * @dev Replace the current RegulatorService
   *
   * @param _service The address of the `RegulatorService`
   *
   */
  function replaceService(address _service) onlyOwner withContract(_service) public {

    address oldService = service;
    service = _service;
    ReplaceService(oldService, service);

  }

  /**
   * @notice Get Regulator Service address
   *
   * @return Regulator Service address
   */
  function getRegulatorService() public returns (address) {
    return service;
  }
}

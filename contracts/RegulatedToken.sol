pragma solidity ^0.4.18;

import "./zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "./zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "./ServiceRegistry.sol";
import "./AboveboardRegDSWhitelistRegulatorService.sol";


/// @notice An ERC-20 token that has the ability to check for trade validity
contract RegulatedToken is DetailedERC20, MintableToken {

  /**
   * @notice Triggered when regulator checks pass or fail
   */
  event CheckStatus(uint8 reason, address indexed spender, address indexed from, address indexed to, uint256 value);

 /**
   * @notice Triggered when transfered by arbitrage
  */
  event Arbitrage(address _from, address _to, uint256 _value);

  /**
   * @notice Address of the `ServiceRegistry` that has the location of the
   *         `RegulatorService` contract responsible for checking trade
   *         permissions.
   */
  ServiceRegistry public registry;

  /**
   * @notice Constructor
   *
   * @param _registry Address of `ServiceRegistry` contract
   * @param _name Name of the token: See DetailedERC20
   * @param _symbol Symbol of the token: See DetailedERC20
   * @param _decimals Decimals of the token: See DetailedERC20
   */
  constructor (address _registry, string _name, string _symbol, uint8 _decimals) public
    DetailedERC20(_name, _symbol, _decimals) {
    require(_registry != address(0));
    registry = ServiceRegistry(_registry);
  }

  /**
   * @notice ERC-20 overridden function that include logic to check for trade validity.
   *
   * @param _to The address of the receiver
   * @param _value The number of tokens to transfer
   *
   * @return `true` if successful and `false` if unsuccessful
   */
  function transfer(address _to, uint256 _value) public returns (bool) {
    if (_check(msg.sender, _to, _value)) {
      return super.transfer(_to, _value);
    } else {
      return false;
    }
  }

 /**
   * @notice ERC-20 overridden function that include logic to check for trade validity.
   *
   * @param _from The address of the sender
   * @param _to The address of the receiver
   * @param _value The number of tokens to transfer
   *
   * @return `true` if successful and `false` if unsuccessful
   */
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
    if (_check(_from, _to, _value)) {
      return super.transferFrom(_from, _to, _value);
    } else {
      return false;
    }
  }

  /**
   * @notice Transfer tokens by arbitrage from one address to another
   *
   * @param _from The address of the sender
   * @param _to The address of the receiver
   * @param _value The number of tokens to transfer
   *
   * @return `true` if successful and `false` if unsuccessful
   */
  function arbitrage(address _from, address _to, uint256 _value) onlyOwner public returns (bool) {
    if (_checkArbitrage(_from, _to, _value)) {
      require(_to != address(0));
      require(_from != address(0));
      require(_value <= balances[_from]);

      balances[_from] = balances[_from].sub(_value);
      balances[_to] = balances[_to].add(_value);

      Arbitrage(_from, _to, _value);
      Transfer(_from, _to, _value);
      return true;
    } else {
      return false;
    }
  }

  /**
   * @dev Override mint function, _to has to be owner
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address _to, uint256 _amount) onlyOwner canMint public returns (bool) {
    require(_to == owner);

    super.mint(_to, _amount);

    return true;
  }

  /**
   * @notice Performs the regulator check
   *
   * @dev This method raises a CheckStatus event indicating success or failure of the check
   *
   * @param _from The address of the sender
   * @param _to The address of the receiver
   * @param _value The number of tokens to transfer
   *
   * @return `true` if the check was successful and `false` if unsuccessful
   */
  function _check(address _from, address _to, uint256 _value) private returns (bool) {
    var reason = _service().check(this, _from, _to, _value);

    CheckStatus(reason, msg.sender, _from, _to, _value);

    return reason == 0;
  }

  function _checkArbitrage(address _from, address _to, uint256 _value) private returns (bool) {
    var reason = _service().checkArbitrage(this, _from, _to, _value);

    CheckStatus(reason, msg.sender, _from, _to, _value);

    return reason == 0;
  }

  /**
   * @notice Retreives the address of the `RegulatorService` that manages this token.
   *
   * @dev This function *MUST NOT* memorize the `RegulatorService` address.  This would
   *      break the ability to upgrade the `RegulatorService`.
   *
   * @return The `RegulatorService` that manages this token.
   */
  function _service() constant public returns (AboveboardRegDSWhitelistRegulatorService) {
    return AboveboardRegDSWhitelistRegulatorService(registry.service());
  }
}

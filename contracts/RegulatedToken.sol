pragma solidity ^0.4.18;

import "./zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "./zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "./RegulatorService.sol";
import "./MessagingAddress.sol";


/// @notice An ERC-20 token that has the ability to check for trade validity
contract RegulatedToken is DetailedERC20, MintableToken, MessagingAddress {

  /**
   * @notice Triggered when service address is replaced
   */
  event ReplaceService(address oldService, address newService);

  /**
   * @notice Triggered when regulator checks pass or fail
   */
  event CheckStatus(uint8 reason, address indexed spender, address indexed from, address indexed to, uint256 value);

 /**
   * @notice Triggered when transfered by arbitrage
  */
  event Arbitrage(address _from, address _to, uint256 _value);

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
   * @notice Address of the `RegulatorService` contract responsible for
   *         checking trade permissions.
   */
  RegulatorService public service;

  /**
   * @notice Constructor
   *
   * @param _service Address of `RegulatorService` contract
   * @param _name Name of the token: See DetailedERC20
   * @param _symbol Symbol of the token: See DetailedERC20
   * @param _decimals Decimals of the token: See DetailedERC20
   * @param _messagingAddress Messaging Address
   * @param _messagingAddressType Type of the `_messagingAddress`
   */
  constructor (address _service, string _name, string _symbol, uint8 _decimals, string _messagingAddress, string _messagingAddressType) public
    DetailedERC20(_name, _symbol, _decimals) MessagingAddress(_messagingAddress, _messagingAddressType) {
    require(_service != address(0));
    service = RegulatorService(_service);
  }

  /**
   * @dev Replace the current RegulatorService
   *
   * @param _service The address of the `RegulatorService`
   *
   */
  function replaceService(address _service) onlyOwner withContract(_service) public {
    address oldService = service;
    service = RegulatorService(_service);
    ReplaceService(oldService, service);
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
    var reason = service.check(this, _from, _to, _value);

    CheckStatus(reason, msg.sender, _from, _to, _value);

    return reason == 0;
  }

  function _checkArbitrage(address _from, address _to, uint256 _value) private returns (bool) {
    var reason = service.checkArbitrage(this, _from, _to, _value);

    CheckStatus(reason, msg.sender, _from, _to, _value);

    return reason == 0;
  }
}

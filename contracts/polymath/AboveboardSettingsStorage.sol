pragma solidity ^0.4.24;

import "../zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "../SettingsStorage.sol";

contract AboveboardSettingsStorage is SettingsStorage {
  /**
   * @notice Constructor
   */
  constructor () public {
    tokenOwner = MintableToken(msg.sender).owner();
  }
}

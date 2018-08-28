pragma solidity ^0.4.24;

import "../zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "../SettingsStorage.sol";

contract AboveboardSettingsStorage is SettingsStorage {
  /**
   * @notice Constructor
   */
  constructor (bool _locked, bool _newShareholdersAllowed, uint256 _initialOfferEndDate, string _messagingAddress)
    SettingsStorage(_locked, _newShareholdersAllowed, _initialOfferEndDate, _messagingAddress) public {
    owner = MintableToken(msg.sender).owner();
  }
}

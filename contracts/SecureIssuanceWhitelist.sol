pragma solidity ^0.4.18;

import "./IssuanceWhiteList.sol";

/**
 * @title SecureIssuanceWhiteList
 * @dev WhiteList for an AboveBoard issued token. Owner is Aboveboard.
 */
contract SecureIssuanceWhiteList is IssuanceWhiteList {

  event TokenAdded(address _address);
  event TokenRemoved(address _address);

  mapping(address => uint256) verifiedTokensIndex;
  address[] verifiedTokenAddresses;
  mapping(address => bool) verifiedTokens;

  bool verifyTokens;

  /**
   * @notice Constructor
   * @param _whitelistType Type of the `SecureIssuanceWhiteList`
   */
  constructor (string _whitelistType, string _messagingAddress, string _messagingAddressType)
    IssuanceWhiteList(_whitelistType, _messagingAddress, _messagingAddressType) public {
    verifyTokens = true;
  }

  function getVerifyingTokens() view onlyOwner public returns (bool) {
    return verifyTokens;
  }

  function setVerifyingTokens(bool _verifying) onlyOwner public {
    verifyTokens = _verifying;
  }

  function verify(address _buyer) view public returns (bool) {
    if (verifyTokens)
      require(verifiedTokens[msg.sender] == true);

    return members[_buyer].approved == true;
  }

  function getVerifiedTokens() onlyOwner view public returns (address[]) {
    return verifiedTokenAddresses;
  }

  function addToken(address _address) onlyOwner public {
    verifiedTokens[_address] = true;
    uint256 id = verifiedTokenAddresses.length;
    verifiedTokensIndex[_address] = id;
    verifiedTokenAddresses.push(_address);
    TokenAdded(_address);
  }

  function removeToken(address _address) onlyOwner public {
    verifiedTokens[_address] = false;
    uint256 id = verifiedTokensIndex[_address];
    delete verifiedTokenAddresses[id];
    TokenRemoved(_address);
  }
}

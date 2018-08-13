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

  function verify(address _buyer) view public returns (bool) {
    require(verifiedTokens[msg.sender] == true);

    return members[_buyer] == true;
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

# Aboveboard Security Token

## Feedback

We would love your feedback. Have questions, want to contribute, or have general comments?
Get help now in our Telegram channel. Sign up at http://aboveboard.ai

## Description

AboveboardSecurityToken is a security  token on the Ethereum blockchain, enabling token transfers to occur if and only if they are approved by an on-chain Regulator Service. 

It includes the following features.
* Whitelisting. Buyers must place their address into an on-chain whitelist to receive a token. This security token will qualify as a private offering to sophisticated investors, under the laws and regulations of all of the countries where we will sell it. This allows us to comply with KYC/AML rules and it removes the cost and delay of a public offering. Contact Aboveboard to get access to our whitelists and investor registry.
* Complies with US rules rules for a private offering under Regulation D and Regulation S. It enforces a one year lockup for buyers that are on the US whitelist, and it blocks redistribution back to the US. Sophisticated buyers in many non-US markets can trade it immediately.  Trading rules for other jurisdictions can be added.
* Tradable. Because trading rules are enforced on the whitelist, an issuer can release this token for trading on exchanges, or peer to peer, without a subscription agreement from each buyer.
* We use the R-token regulator architecture to enforce trading rules. The Regulator Service links to any number of whitelists. Regulator Service is upgradable, so we can add trading rules in the future.
* Registry: Buyers on the Aboveboard whitelists are linked to the Aboveboard stockholder registry system. So, this security can be used as to sell and record real stock transactions for companies in all of the many jurisdictions that require a stockholder registry, including Delaware.
* Replacement of lost tokens. The token includes a system for replacing tokens lost due to key problems or hacking. The issuer and an arbitrator can agree and multi-sign a transaction to replace tokens. This is potentially a massive step forward for institutional investors who must hold their client assets in careful custody.

## Components

* AboveboardSecurityToken
  * Permissioned ERC-20 smart contract representing ownership of securities
  * Compatible with existing wallets and exchanges that support the ERC-20 token standard
  * Overrides the existing ERC-20 transfer method to check with an on-chain Regulator Service for trade approval
* AboveboardRegDSWhitelistRegulatorService
  * Contains the permissions necessary for regulatory compliance
  * Supports SEC Regulation D lockup rule
* ServiceRegistry
  * Accounts for regulatory requirement changes over time
  * Routes the AboveboardSecurityToken to the correct version of the Regulator Service
* Whitelists
  * A whitelist is a list of buyers that qualify. We put that list inside our blockchain scripts, which we call “whitelist tokens”


## Upgradable

The `ServiceRegistry` is used to point many `AboveboardSecurityToken` smart contracts to a single `AboveboardRegDSWhitelistRegulatorService`. This setup is recommended so that rules and logic implemented by the `AboveboardRegDSWhitelistRegulatorService` can be upgraded by changing a single `AboveboardRegDSWhitelistRegulatorService` address held by the `ServiceRegistry`.

<p align="center">
  <img src="https://github.com/MaxosLLC/AboveboardSecurityToken/raw/master/docs/images/diagram.png">
</p>

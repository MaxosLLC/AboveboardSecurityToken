const IssuanceWhiteList = artifacts.require("./IssuanceWhiteList.sol")
const SettingsStorage = artifacts.require("./SettingsStorage.sol")
const TransferManager = artifacts.require("./polymath/AboveboardTransferManager.sol")
// const RegulatedToken = artifacts.require("./RegulatedToken.sol")

const deployPolymath = false

module.exports = async (deployer, network, accounts) => {
  if (!deployPolymath) { return }

  await deployer.deploy(IssuanceWhiteList).catch(e => console.log('Error deploying IssuanceWhiteList ', e.message))
  // await deployer.deploy(RegulatedToken, 'AboveboardStock', 'ABST')
  // await deployer.deploy(SettingsStorage).catch(e => console.log('Error deploying SettingsStorage ', e.message))
  await deployer.deploy(TransferManager, '0xFec990b9aa412d93cD12E61d7dfC3f63676e7ea2', '0x0DFb0511E9e28B643a9B01A684724048821992D4', { gas: 9000000 }).catch(e => console.log('Error deploying TransferManager ', e.message))

  // await RegulatedToken.deployed()
  const regulatorService = await TransferManager.deployed()
  // regulatorService.replaceStorage(SettingsStorage.address)

  const whitelist = await IssuanceWhiteList.deployed()
  await whitelist.setWhitelistType('RegS')

  // const storage = await SettingsStorage.deployed()
  // await storage.addWhitelist(IssuanceWhiteList.address)

  // await storage.setIssuer(accounts[0])
  // await storage.allowNewShareholders(true)
}

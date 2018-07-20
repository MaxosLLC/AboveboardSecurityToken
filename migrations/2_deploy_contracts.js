const IssuanceWhiteList = artifacts.require("./IssuanceWhiteList.sol")
const SettingsStorage = artifacts.require("./SettingsStorage.sol")
const RegulatorService = artifacts.require("./polymath/AboveboardTransferManager.sol")
// const RegulatedToken = artifacts.require("./RegulatedToken.sol")

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(IssuanceWhiteList).catch(e => console.log('Error deploying IssuanceWhiteList ', e.message))
  // await deployer.deploy(RegulatedToken, 'AboveboardStock', 'ABST')
  await deployer.deploy(SettingsStorage).catch(e => console.log('Error deploying SettingsStorage ', e.message))
  await deployer.deploy(RegulatorService, '0x86976312f1e5682E637C689B062a2B053e9c4c4c', '0x40830eDF059FF1eF1b499C81F2D556077f3a5F29', { gas: 5000000 }).catch(e => console.log('Error deploying RegulatorService ', e.message))

  // await RegulatedToken.deployed()
  const regulatorService = await RegulatorService.deployed()
  regulatorService.replaceStorage(SettingsStorage.address)

  const whitelist = await IssuanceWhiteList.deployed()
  await whitelist.setWhitelistType('RegS')

  const storage = await SettingsStorage.deployed()
  await storage.addWhitelist(IssuanceWhiteList.address)

  await storage.setIssuer(accounts[0])
  await storage.allowNewShareholders(true)
}

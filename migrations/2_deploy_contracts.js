const IssuanceWhiteList = artifacts.require('./IssuanceWhiteList.sol')
const SecureIssuanceWhiteList = artifacts.require('./SecureIssuanceWhiteList.sol')
const SettingsStorage = artifacts.require('./SettingsStorage.sol')
const RegulatorService = artifacts.require('./AboveboardRegDSWhitelistRegulatorService.sol')
const RegulatedToken = artifacts.require('./RegulatedToken.sol')
const ServiceRegistry = artifacts.require('./ServiceRegistry.sol')

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(IssuanceWhiteList)
  await deployer.deploy(SecureIssuanceWhiteList)
  await deployer.deploy(SettingsStorage)
  await deployer.deploy(RegulatorService, SettingsStorage.address)
  await deployer.deploy(ServiceRegistry, RegulatorService.address)
  await deployer.deploy(RegulatedToken, ServiceRegistry.address, 'AboveboardStock', 'ABST')

  const whitelist = await IssuanceWhiteList.deployed()
  await whitelist.setWhitelistType('Affiliates')

  const seucreWhitelist = await SecureIssuanceWhiteList.deployed()
  await seucreWhitelist.setWhitelistType('RegS')

  const storage = await SettingsStorage.deployed()
  await storage.addWhitelist(IssuanceWhiteList.address)
  await storage.addOfficer(accounts[0])
  return storage.allowNewShareholders(true)
}

const IssuanceWhiteList = artifacts.require('./IssuanceWhiteList.sol')
const SecureIssuanceWhiteList = artifacts.require('./SecureIssuanceWhiteList.sol')
const SettingsStorage = artifacts.require('./SettingsStorage.sol')
const RegulatorService = artifacts.require('./AboveboardRegDSWhitelistRegulatorService.sol')
const RegulatedToken = artifacts.require('./RegulatedToken.sol')
const ServiceRegistry = artifacts.require('./ServiceRegistry.sol')

module.exports = (deployer, network, accounts) =>
  deployer.then(async () => {
    await deployer.deploy(IssuanceWhiteList, 'Affiliates')
    await deployer.deploy(SecureIssuanceWhiteList, 'qib')
    await deployer.deploy(SettingsStorage, false, true, 0, '')
    await deployer.deploy(RegulatorService, SettingsStorage.address)
    await deployer.deploy(ServiceRegistry, RegulatorService.address)
    await deployer.deploy(RegulatedToken, ServiceRegistry.address, 'AboveboardStock', 'ABST', 0)

    await RegulatorService.deployed()
    await ServiceRegistry.deployed()
    await RegulatedToken.deployed()
    await IssuanceWhiteList.deployed()
    await SecureIssuanceWhiteList.deployed()
    const storage = await SettingsStorage.deployed()

    await storage.addWhitelist(IssuanceWhiteList.address)
    await storage.addWhitelist(SecureIssuanceWhiteList.address)
    await storage.addOfficer(accounts[0])
  })

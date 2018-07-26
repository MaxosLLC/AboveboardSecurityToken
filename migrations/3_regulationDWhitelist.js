const RegulationDWhiteList = artifacts.require('./IssuanceWhiteList.sol')
const SettingsStorage = artifacts.require('./SettingsStorage.sol')

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(RegulationDWhiteList)

  const whitelist = await RegulationDWhiteList.deployed()
  await whitelist.setWhitelistType('RegD')

  const storage = await SettingsStorage.deployed()
  return storage.addWhitelist(RegulationDWhiteList.address)
}

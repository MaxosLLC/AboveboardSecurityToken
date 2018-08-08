const RegulationDWhiteList = artifacts.require('./IssuanceWhiteList.sol')
const SettingsStorage = artifacts.require('./SettingsStorage.sol')

const deployRegDWhitelist = false

module.exports = (deployer, network, accounts) =>
  deployer.then(async () => {
    if (!deployRegDWhitelist) { return }

    await deployer.deploy(RegulationDWhiteList)

    const whitelist = await RegulationDWhiteList.deployed()
    await whitelist.setWhitelistType('RegD')

    const storage = await SettingsStorage.deployed()
    return storage.addWhitelist(RegulationDWhiteList.address)
  })

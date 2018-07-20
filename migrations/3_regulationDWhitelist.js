const RegulationDWhiteList = artifacts.require("./IssuanceWhiteList.sol")
const SettingsStorage = artifacts.require("./SettingsStorage.sol")
const RegulatorService = artifacts.require("./AboveboardRegDSWhitelistRegulatorService.sol")
const RegulatedToken = artifacts.require("./RegulatedToken.sol")

module.exports = async (deployer, network, accounts) => {
  // await deployer.deploy(RegulationDWhiteList)

  // const whitelist = await RegulationDWhiteList.deployed()
  // await whitelist.setWhitelistType('RegD')

  // const storage = await SettingsStorage.deployed()
  // storage.addWhitelist(RegulationDWhiteList.address)
}

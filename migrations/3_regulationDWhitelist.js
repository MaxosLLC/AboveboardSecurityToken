var RegulationDWhiteList = artifacts.require("./IssuanceWhiteList.sol");
var SettingsStorage = artifacts.require("./SettingsStorage.sol");
var RegulatorService = artifacts.require("./AboveboardRegDSWhitelistRegulatorService.sol");
var RegulatedToken = artifacts.require("./RegulatedToken.sol");
var storage;

module.exports = async function(deployer, network, accounts) {

    return deployer.deploy(RegulationDWhiteList)
      .then(() => {
        return SettingsStorage.deployed().then(function(instance) {
          storage = instance;
          return instance.addWhitelist(RegulationDWhiteList.address);
        });
      }).then(() => {
        return RegulatedToken.deployed().then(function(instance) {
          return storage.setRegDWhitelist(instance.address, RegulationDWhiteList.address);
        });
      });
};

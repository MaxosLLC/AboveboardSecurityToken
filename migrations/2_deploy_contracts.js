var IssuanceWhiteList = artifacts.require("./IssuanceWhiteList.sol");
var SettingsStorage = artifacts.require("./SettingsStorage.sol");
var RegulatorService = artifacts.require("./AboveboardRegDSWhitelistRegulatorService.sol");
var ServiceRegistry = artifacts.require("./ServiceRegistry.sol");
var RegulatedToken = artifacts.require("./RegulatedToken.sol");
var storage;

module.exports = async function(deployer, network, accounts) {

    return deployer.deploy(IssuanceWhiteList)
      .then(() => {
        return IssuanceWhiteList.deployed().then(function(instance) {
          return instance.setWhitelistType("RegS");
        });
      }).then(() => {
        return IssuanceWhiteList.deployed().then(function(instance) {
          return instance.add(accounts[0]);
        });
      }).then(() => {
        return deployer.deploy(SettingsStorage);
      }).then(() => {
        return deployer.deploy(RegulatorService, SettingsStorage.address);
      }).then(() => {
        return deployer.deploy(ServiceRegistry, RegulatorService.address);
      }).then(() => {
        return deployer.deploy(RegulatedToken, ServiceRegistry.address, 'AboveboardStock', 'ABST');
      }).then(() => {
        return SettingsStorage.deployed().then(function(instance) {
          storage = instance;
          return instance.addWhitelist(IssuanceWhiteList.address);
        });
      }).then(() => {
        return RegulatedToken.deployed().then(function(instance) {
          return storage.setIssuer(accounts[0]);
        });
      }).then(() => {
        return RegulatedToken.deployed().then(function(instance) {
          return storage.allowNewShareholders(true);
        });
      });
};

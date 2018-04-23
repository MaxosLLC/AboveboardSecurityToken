var IssuanceWhiteList = artifacts.require("./IssuanceWhiteList.sol");
var RegulatorService = artifacts.require("./AboveboardRegDSWhitelistRegulatorService.sol");
var ServiceRegistry = artifacts.require("./ServiceRegistry.sol");
var RegulatedToken = artifacts.require("./RegulatedToken.sol");
var service;

module.exports = async function(deployer, network, accounts) {

    return deployer.deploy(IssuanceWhiteList)
      .then(() => {
        return IssuanceWhiteList.deployed().then(function(instance) {
          return instance.add(accounts[0]);
        });
      }).then(() => {
        return deployer.deploy(RegulatorService);
      }).then(() => {
        return deployer.deploy(ServiceRegistry, RegulatorService.address);
      }).then(() => {
        return deployer.deploy(RegulatedToken, ServiceRegistry.address, 'AboveboardStock', 'ABST');
      }).then(() => {
        return RegulatorService.deployed().then(function(instance) {
          service = instance;
          return instance.addWhitelist(IssuanceWhiteList.address);
        });
      }).then(() => {
        return RegulatedToken.deployed().then(function(instance) {
          return service.setPartialTransfers(instance.address, true);
        });
      }).then(() => {
        return RegulatedToken.deployed().then(function(instance) {
          return service.allowNewShareholders(instance.address, true);
        });
      }).then(() => {
        return RegulatedToken.deployed().then(function(instance) {
          return service.setIssuer(instance.address, accounts[0]);
        });
      });
};

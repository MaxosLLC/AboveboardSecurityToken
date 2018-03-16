var BasicWhiteList = artifacts.require("./BasicWhiteList.sol");
var IssuanceWhiteList = artifacts.require("./IssuanceWhiteList.sol");
var RegulatorService = artifacts.require("./AboveboardRegDSWhitelistRegulatorService.sol");
var ServiceRegistry = artifacts.require("./ServiceRegistry.sol");
var RegulatedToken = artifacts.require("./RegulatedToken.sol");
var MockRegulatorService = artifacts.require('contracts/MockRegulatorService.sol');
var MockRegulatedToken = artifacts.require('contracts/MockRegulatedToken.sol');
var MultiSigArbitration = artifacts.require('contracts/MultiSigArbitration.sol');
var service;

module.exports = async function(deployer, network, accounts) {

    return deployer.deploy(IssuanceWhiteList)
      .then(() => {
        return deployer.deploy(RegulatorService);
      }).then(() => {
        return deployer.deploy(ServiceRegistry, RegulatorService.address);
      }).then(() => {
        return deployer.deploy(RegulatedToken, ServiceRegistry.address, 'Aboveboard', 'ABV');
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
        return deployer.deploy(MultiSigArbitration, accounts[0], accounts[1]);
      });
};

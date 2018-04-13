var RegulationDWhiteList = artifacts.require("./IssuanceWhiteList.sol");
var RegulatorService = artifacts.require("./AboveboardRegDSWhitelistRegulatorService.sol");
var RegulatedToken = artifacts.require("./RegulatedToken.sol");
var service;

module.exports = async function(deployer, network, accounts) {

    return deployer.deploy(RegulationDWhiteList)
      .then(() => {
        return RegulatorService.deployed().then(function(instance) {
          service = instance;
          return instance.addWhitelist(RegulationDWhiteList.address);
        });
      }).then(() => {
        return RegulatedToken.deployed().then(function(instance) {
          return service.setRegDWhitelist(instance.address, RegulationDWhiteList.address);
        });
      });
};

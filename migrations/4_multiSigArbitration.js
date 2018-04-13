var RegulatedToken = artifacts.require("./RegulatedToken.sol");
var MultiSigArbitration = artifacts.require('contracts/MultiSigArbitration.sol');

module.exports = async function(deployer, network, accounts) {
    return deployer.deploy(MultiSigArbitration, [accounts[0]], 1)
      .then(() => {
        return RegulatedToken.deployed().then(function(instance) {
          return instance.setMultisigArbitrator(MultiSigArbitration.address);
        });
      });
};

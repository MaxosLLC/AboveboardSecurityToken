var MultiSigArbitration = artifacts.require('contracts/MultiSigArbitration.sol');

module.exports = async function(deployer, network, accounts) {
    return deployer.deploy(MultiSigArbitration, [accounts[0]], 1);
};

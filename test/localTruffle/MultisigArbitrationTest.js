const RegulatedToken = artifacts.require('contracts/RegulatedToken.sol');
let ServiceRegistry = artifacts.require('contracts/ServiceRegistry.sol');
const MultisigArbitrage = artifacts.require('contracts/MultiSigArbitration.sol');
const MockRegulatorService = artifacts.require('contracts/MockRegulatorService.sol');

contract('MultisigArbitrage', async accounts => {

    let wallet;
    let token;

    beforeEach(async () => {

        regulator = await MockRegulatorService.new({ from: accounts[0] });

        const registry = await ServiceRegistry.new(regulator.address);

        token = await RegulatedToken.new(registry.address, 'Test', 'TEST', {from: accounts[0]});

        wallet = await MultisigArbitrage.new(accounts[0], accounts[1]);

        await token.setMultisigArbitrage(wallet.address, {from: accounts[0]});

      });

      it('Reassign tokens', async () => {

        const id = await wallet.submitTransaction(token.address, 
          "RegulatedToken", "transferFrom", {from: accounts[0]});

        await wallet.confirmTransaction(1, {from: accounts[1]});

        await token.mint(accounts[0], 10, {from: accounts[0]});

        assert.equal(await token.balanceOf(accounts[0], 10));

        await wallet.executeTransferFrom(1, accounts[0], accounts[1], 5, {from: accounts[0]});

        assert.equal(await token.balanceOf(accounts[0], 5));
        
      });

});
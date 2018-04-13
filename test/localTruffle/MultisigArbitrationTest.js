const BigNumber = require('bignumber.js');
const helpers = require('../helpers/throwAndAssert');
const utils = require('../helpers/utils')

const RegulatedToken = artifacts.require('./RegulatedToken.sol');
const ServiceRegistry = artifacts.require('./ServiceRegistry.sol');
const RegulatorService = artifacts.require('./AboveboardRegDSWhitelistRegulatorService.sol');
const IssuanceWhiteList = artifacts.require('./IssuanceWhiteList.sol');
const MultiSigArbitration = artifacts.require('./MultiSigArbitration.sol');

contract('MultiSigArbitration', async function(accounts) {
  let regulator;
  let token;
  let whitelist;
  let arbitration;
  const value = 25;

  const owner = accounts[0];
  const receiver = accounts[1];
  const arbitrator = accounts[2];
  const hacker = accounts[3];

  const fromOwner = { from: owner };
  const fromReceiver = { from: receiver };

  beforeEach(async () => {
    regulator = await RegulatorService.new({ from: owner });

    const registry = await ServiceRegistry.new(regulator.address);

    token = await RegulatedToken.new(registry.address, 'Test', 'TEST');

    whitelist = await IssuanceWhiteList.new({ from: owner });

    arbitration = await MultiSigArbitration.new([arbitrator, owner], 2);

    await regulator.setPartialTransfers(token.address, true);
    await regulator.allowNewShareholders(token.address, true);
    await regulator.addWhitelist(whitelist.address);
    await token.setMultisigArbitrator(arbitration.address);

    await token.mint(owner, 100);
    await token.finishMinting();

    await assertBalances({ owner: 100, receiver: 0 });
  });

  const assertBalances = async balances => {
    assert.equal(balances.owner, (await token.balanceOf.call(owner)).valueOf());
    assert.equal(balances.receiver, (await token.balanceOf.call(receiver)).valueOf());
  };

  describe('MultisigArbitrator', () => {
    it('getMultisigArbitrator', async () => {
      let l = await token.setMultisigArbitrator(arbitration.address);

      l = await token.getMultisigArbitrator({from: owner});
      assert.equal(l, arbitration.address);
    });

    it('getMultisigArbitrator by hacker', async () => {
      try {
        let l = await token.setMultisigArbitrator(arbitration.address);

        l = await token.getMultisigArbitrator({from: hacker});
        assert.equal(l, arbitration.address);

        assert.fail('hacker cannot get arbitrators address, should have thrown before');
      } catch (error) {
        assert(error);
        return;
      }
      assert.fail('Expected throw not received');
    });
  });

  describe('when funds are send back to owner and confirmed by arbitrator', () => {
    beforeEach(async () => {
      await whitelist.add(owner);
      await whitelist.add(receiver);
      await assertBalances({ owner: 100, receiver: 0 });
    });

    it('transfer', async () => {
      // transfer some funds to receiver
      await token.transfer(receiver, value, {from: owner});
      await assertBalances({ owner: 75, receiver: value });

      // create tx which transfers from receiver's lost account back to owner
      const transferEncoded = token.contract.arbitrage.getData(arbitrator, receiver, owner, value, {from: owner})

      // submit tx
      const transactionId = utils.getParamFromTxEvent(
          await arbitration.submitTransaction(token.address, 0, transferEncoded, {from: owner}),
          'transactionId', null, 'Submission')

      // confirm by arbitrator
      const executedTransactionId = utils.getParamFromTxEvent(
          await arbitration.confirmTransaction(transactionId, {from: arbitrator}),
          'transactionId', null, 'Execution')

      // Check that transaction has been executed
      assert.ok(transactionId.equals(executedTransactionId))

      await assertBalances({ owner: 100, receiver: 0 });
    })
  });
});

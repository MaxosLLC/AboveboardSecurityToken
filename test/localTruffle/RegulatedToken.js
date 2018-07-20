const BigNumber = require('bignumber.js');

const helpers = require('../helpers/throwAndAssert');
const RegulatedToken = artifacts.require('./RegulatedToken.sol');
const ServiceRegistry = artifacts.require('./ServiceRegistry.sol');
const RegulatorService = artifacts.require('./AboveboardRegDSWhitelistRegulatorService.sol');
const IssuanceWhiteList = artifacts.require('./IssuanceWhiteList.sol');
const SettingsStorage = artifacts.require('./SettingsStorage.sol');

contract('RegulatedToken', async function(accounts) {
  let storage;
  let regulator;
  let token;
  let whitelist;
  let regDWhitelist;
  var releaseTime;

  const owner = accounts[0];
  const receiver = accounts[1];
  const issuer = accounts[4];
  const newOwner = accounts[5];

  const fromOwner = { from: owner };
  const fromReceiver = { from: receiver };
  const fromNewOwner = { from: newOwner };

  beforeEach(async () => {
    releaseTime = web3.eth.getBlock('latest').timestamp + helpers.duration.years(1);

    storage = await SettingsStorage.new({ from: owner });

    regulator = await RegulatorService.new(storage.address, { from: owner });

    const registry = await ServiceRegistry.new(regulator.address);

    token = await RegulatedToken.new(registry.address, 'Test', 'TEST');

    whitelist = await IssuanceWhiteList.new({ from: owner });

    regDWhitelist = await IssuanceWhiteList.new({ from: owner });

    await regDWhitelist.setWhitelistType("RegD");
    await storage.setIssuerPermission('locked', true);
    await storage.setIssuer(issuer);
    await storage.allowNewShareholders(true, { from: issuer });
    await storage.addWhitelist(whitelist.address);
    await storage.addWhitelist(regDWhitelist.address);
    await storage.setInititalOfferEndDate(releaseTime, { from: issuer });

    // mint
    await token.mint(owner, 100, fromOwner);

    // transfer ownership to new owner
    await token.transferOwnership(newOwner);
    await regulator.transferOwnership(newOwner);

    await token.mint(newOwner, 100, fromNewOwner);
    await token.finishMinting(fromNewOwner);

    await assertBalances({ owner: 100, receiver: 0 });
    await assertBalancesNewOwner({ newOwner: 100, receiver: 0 });
  });

  const assertBalances = async balances => {
    assert.equal(balances.owner, (await token.balanceOf.call(owner)).valueOf());
    assert.equal(balances.receiver, (await token.balanceOf.call(receiver)).valueOf());
  };

  const assertBalancesNewOwner = async balances => {
    assert.equal(balances.newOwner, (await token.balanceOf.call(newOwner)).valueOf());
    assert.equal(balances.receiver, (await token.balanceOf.call(receiver)).valueOf());
  };

  const assertCheckStatusEvent = async (event, params) => {
    const p = Object.assign({}, params, {
      reason: new BigNumber(params.reason),
      value: new BigNumber(params.value),
    });

    return helpers.assertEvent(event, p, (expected, actual) => {
      assert.equal(expected.reason.valueOf(), actual.reason.valueOf());
      assert.equal(expected.spender, actual.spender);
      assert.equal(expected.from, actual.from);
      assert.equal(expected.to, actual.to);
      assert.equal(expected.value.valueOf(), actual.value.valueOf());
    });
  };

  describe('constructor', () => {
    it('requires a non-zero registry argument', async () => {
      await helpers.expectThrow(RegulatedToken.new(0, 'TEST', 'Test'));
    });
  });

  describe('transfer', () => {
    describe('when the receiver is not added to whitelist', () => {
      beforeEach(async () => {
        await assertBalances({ owner: 100, receiver: 0 });
      });

      it('triggers a CheckStatus event and does NOT transfer funds', async () => {
        const event = token.CheckStatus();
        const value = 25;

        await token.transfer(receiver, value, fromOwner);
        await assertBalances({ owner: 100, receiver: 0 });
        await assertCheckStatusEvent(event, {
          reason: 4,
          spender: owner,
          from: owner,
          to: receiver,
          value,
        });
      });
    });

    describe('when receiver is added to whitelist', () => {
      beforeEach(async () => {
        await whitelist.add(receiver);
        await assertBalances({ owner: 100, receiver: 0 });
      });

      it('triggers a CheckStatus event and transfers funds', async () => {
        const event = token.CheckStatus();
        const value = 25;

        await token.transfer(receiver, value, fromOwner);
        await assertBalances({ owner: 75, receiver: value });
        await assertCheckStatusEvent(event, {
          reason: 0,
          spender: owner,
          from: owner,
          to: receiver,
          value,
        });
      });
    });

    describe('when new shareholders are not allowed', () => {
      beforeEach(async () => {
        await whitelist.add(receiver);
        await whitelist.add(accounts[2]);
        await assertBalances({ owner: 100, receiver: 0 });
      });

      it('triggers a CheckStatus event and does NOT transfers funds', async () => {
        // disable new shareholders
        await storage.allowNewShareholders(false, { from: issuer });
        const event = token.CheckStatus();
        const value = 25;

        await token.transfer(receiver, value, fromOwner);
        await assertBalances({ owner: 100, receiver: 0 });
        await assertCheckStatusEvent(event, {
          reason: 2,
          spender: owner,
          from: owner,
          to: receiver,
          value,
        });
      });

      it('triggers a CheckStatus event and transfers funds', async () => {
        var event = token.CheckStatus();
        const value = 25;

        // transfer funds to receiver, so balance is not zero
        await token.transfer(receiver, value, fromOwner);
        await assertBalances({ owner: 75, receiver: value });

        // disable new shareholders
        await storage.allowNewShareholders(false, { from: issuer });

        event = token.CheckStatus();
        // transfer will pass to existing shareholder, receiver already has funds
        await token.transfer(receiver, value, fromOwner);
        await assertBalances({ owner: 50, receiver: 50 });
        await assertCheckStatusEvent(event, {
          reason: 0,
          spender: owner,
          from: owner,
          to: receiver,
          value,
        });

        event = token.CheckStatus();
        // transfer will fail to new shareholder
        await token.transfer(accounts[2], value, fromOwner);
        await assertCheckStatusEvent(event, {
          reason: 2,
          spender: owner,
          from: owner,
          to: accounts[2],
          value,
        });
      });
    });

    describe('when receiver is under Regulation D, transfer is before release date', () => {
      beforeEach(async () => {
        await regDWhitelist.add(receiver);
        await assertBalances({ owner: 100, receiver: 0 });
      });

      it('triggers a CheckStatus event and does NOT transfer funds', async () => {
        const event = token.CheckStatus();
        const value = 25;

        await token.transfer(receiver, value, fromOwner);
        await assertBalances({ owner: 100, receiver: 0 });
        await assertCheckStatusEvent(event, {
          reason: 5,
          spender: owner,
          from: owner,
          to: receiver,
          value,
        });
      });
    });

    describe('when receiver is under Regulation D, transfer is after release date', () => {
      beforeEach(async () => {
        await regDWhitelist.add(receiver);
        await assertBalances({ owner: 100, receiver: 0 });
        await helpers.increaseTimeTo(releaseTime + helpers.duration.seconds(100), web3)
      });

      it('triggers a CheckStatus event and transfers funds', async () => {
        const event = token.CheckStatus();
        const value = 25;

        await token.transfer(receiver, value, fromOwner);
        await assertBalances({ owner: 75, receiver: value });
        await assertCheckStatusEvent(event, {
          reason: 0,
          spender: owner,
          from: owner,
          to: receiver,
          value,
        });
      });
    });

    describe('when receiver is under Regulation D, only token contract owner can send to US investors first year', () => {
      beforeEach(async () => {
        await regDWhitelist.add(receiver);
        await storage.setIssuer(owner, { from: issuer });
      });

      it('triggers a CheckStatus event and transfers funds', async () => {
        const event = token.CheckStatus();
        const value = 25;

        await token.transfer(receiver, value, fromNewOwner);
        await assertBalancesNewOwner({ newOwner: 75, receiver: value });
        await assertCheckStatusEvent(event, {
          reason: 0,
          spender: newOwner,
          from: newOwner,
          to: receiver,
          value,
        });
      });
    });

    describe('when receiver is under Regulation D, cannot sell these shares in the first year, except to the token contract owner', () => {
      beforeEach(async () => {
        await regDWhitelist.add(receiver);
        await storage.setIssuer(owner, { from: issuer });
      });

      it('triggers a CheckStatus event, transfers funds from issuer then transfers funds back to token contract owner', async () => {
        const event = token.CheckStatus();
        const value = 25;

        await token.transfer(receiver, value, fromNewOwner);
        await assertBalancesNewOwner({ newOwner: 75, receiver: value });
        await assertCheckStatusEvent(event, {
          reason: 0,
          spender: newOwner,
          from: newOwner,
          to: receiver,
          value,
        });

        const ev = token.CheckStatus();
        await token.transfer(newOwner, value, fromReceiver);
        await assertBalancesNewOwner({ newOwner: 100, receiver: 0 });
        await assertCheckStatusEvent(ev, {
          reason: 0,
          spender: receiver,
          from: receiver,
          to: newOwner,
          value,
        });
      });

      it('triggers a CheckStatus event, transfers funds from token contract owner then transfers funds back to token contract owner even when trading is locked', async () => {
        const event = token.CheckStatus();
        const value = 25;

        await token.transfer(receiver, value, fromNewOwner);
        await assertBalancesNewOwner({ newOwner: 75, receiver: value });
        await assertCheckStatusEvent(event, {
          reason: 0,
          spender: newOwner,
          from: newOwner,
          to: receiver,
          value,
        });

        // lock trading. Trading will pass because we are sending back to token contract owner
        await storage.setLocked(true);

        const ev = token.CheckStatus();
        await token.transfer(newOwner, value, fromReceiver);
        await assertBalancesNewOwner({ newOwner: 100, receiver: 0 });
        await assertCheckStatusEvent(ev, {
          reason: 0,
          spender: receiver,
          from: receiver,
          to: newOwner,
          value,
        });
      });
    });
  });

  describe('transferFrom', () => {
    describe('when receiver is added to whitelist', () => {
      beforeEach(async () => {
        await whitelist.add(receiver);
      });

      it('returns true', async () => {
        assert.isTrue(await token.transferFrom.call(newOwner, receiver, 25, fromNewOwner));
        await assertBalancesNewOwner({ newOwner: 100, receiver: 0 });
      });

      it('triggers a CheckStatus event and transfers funds', async () => {
        const event = token.CheckStatus();
        const value = 25;

        await token.transferFrom(newOwner, receiver, value, fromNewOwner);
        await assertBalancesNewOwner({ newOwner: 75, receiver: value });
      });
    });
  });
});

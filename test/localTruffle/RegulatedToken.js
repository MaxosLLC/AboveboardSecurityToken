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

  const fromOwner = { from: owner };
  const fromReceiver = { from: receiver };

  beforeEach(async () => {
    releaseTime = web3.eth.getBlock('latest').timestamp + helpers.duration.years(1);

    storage = await SettingsStorage.new({ from: owner });

    regulator = await RegulatorService.new(storage.address, { from: owner });

    const registry = await ServiceRegistry.new(regulator.address);

    token = await RegulatedToken.new(registry.address, 'Test', 'TEST');

    whitelist = await IssuanceWhiteList.new({ from: owner });

    regDWhitelist = await IssuanceWhiteList.new({ from: owner });

    await regDWhitelist.setWhitelistType("RegD");
    await storage.allowNewShareholders(token.address, true);
    await storage.addWhitelist(whitelist.address);
    await storage.addWhitelist(regDWhitelist.address);
    await storage.setInititalOfferEndDate(token.address, releaseTime);

    await token.mint(owner, 100);
    await token.finishMinting();

    await assertBalances({ owner: 100, receiver: 0 });
  });

  const assertBalances = async balances => {
    assert.equal(balances.owner, (await token.balanceOf.call(owner)).valueOf());
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
    describe('when the sender is not added to whitelist', () => {
      beforeEach(async () => {
        await assertBalances({ owner: 100, receiver: 0 });
      });

      it('returns false', async () => {
        assert.isFalse(await token.transfer.call(receiver, 100, fromOwner));
        await assertBalances({ owner: 100, receiver: 0 });
      });

      it('triggers a CheckStatus event and does NOT transfer funds', async () => {
        const event = token.CheckStatus();
        const value = 25;

        await token.transfer(receiver, value, fromOwner);
        await assertBalances({ owner: 100, receiver: 0 });
        await assertCheckStatusEvent(event, {
          reason: 3,
          spender: owner,
          from: owner,
          to: receiver,
          value,
        });
      });
    });

    describe('when the receiver is not added to whitelist', () => {
      beforeEach(async () => {
        await assertBalances({ owner: 100, receiver: 0 });
        await whitelist.add(owner);
      });

      it('returns false', async () => {
        assert.isFalse(await token.transfer.call(receiver, 100, fromOwner));
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

    describe('when sender and receiver are added to whitelist', () => {
      beforeEach(async () => {
        await whitelist.add(owner);
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
        await whitelist.add(owner);
        await whitelist.add(receiver);
        await whitelist.add(accounts[2]);
        await assertBalances({ owner: 100, receiver: 0 });
      });

      it('triggers a CheckStatus event and does NOT transfers funds', async () => {
        // disable new shareholders
        await storage.allowNewShareholders(token.address, false);
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
        await storage.allowNewShareholders(token.address, false);

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
        await whitelist.add(owner);
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
        await whitelist.add(owner);
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

    describe('when receiver is under Regulation D, only issuer can send to US investors first year', () => {
      beforeEach(async () => {
        await whitelist.add(owner);
        await regDWhitelist.add(receiver);
        await assertBalances({ owner: 100, receiver: 0 });
        await storage.setIssuer(token.address, owner);
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

    describe('when receiver is under Regulation D, cannot sell these shares in the first year, except to the issuer', () => {
      beforeEach(async () => {
        await whitelist.add(owner);
        await regDWhitelist.add(receiver);
        await assertBalances({ owner: 100, receiver: 0 });
        await storage.setIssuer(token.address, owner);
      });

      it('triggers a CheckStatus event, transfers funds from issuer then transfers funds back to issuer', async () => {
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

        const ev = token.CheckStatus();
        await token.transfer(owner, value, fromReceiver);
        await assertBalances({ owner: 100, receiver: 0 });
        await assertCheckStatusEvent(ev, {
          reason: 0,
          spender: receiver,
          from: receiver,
          to: owner,
          value,
        });
      });

      it('triggers a CheckStatus event, transfers funds from issuer then transfers funds back to issuer even when trading is locked', async () => {
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

        // lock trading. Trading will pass because we are sending back to issuer
        await storage.setLocked(token.address, true);

        const ev = token.CheckStatus();
        await token.transfer(owner, value, fromReceiver);
        await assertBalances({ owner: 100, receiver: 0 });
        await assertCheckStatusEvent(ev, {
          reason: 0,
          spender: receiver,
          from: receiver,
          to: owner,
          value,
        });
      });
    });
  });

  describe('transferFrom', () => {
    describe('when sender and receiver are added to whitelist', () => {
      beforeEach(async () => {
        await whitelist.add(owner);
        await whitelist.add(receiver);
        await token.approve(receiver, 25, fromOwner);
        await assertBalances({ owner: 100, receiver: 0 });
      });

      it('returns true', async () => {
        assert.isTrue(await token.transferFrom.call(owner, receiver, 25, fromReceiver));
        await assertBalances({ owner: 100, receiver: 0 });
      });

      it('triggers a CheckStatus event and transfers funds', async () => {
        const event = token.CheckStatus();
        const value = 25;

        await token.transferFrom(owner, receiver, value, fromReceiver);
        await assertBalances({ owner: 75, receiver: value });
      });
    });
  });
});

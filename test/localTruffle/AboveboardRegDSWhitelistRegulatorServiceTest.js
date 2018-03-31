const helpers = require('../helpers/throwAndAssert');
const RegulatedToken = artifacts.require('./RegulatedToken.sol');
const ServiceRegistry = artifacts.require('./ServiceRegistry.sol');
const RegulatorService = artifacts.require('./AboveboardRegDSWhitelistRegulatorService.sol');
const IssuanceWhiteList = artifacts.require('./IssuanceWhiteList.sol');

contract('AboveboardRegDSWhitelistRegulatorService', async accounts => {
  let regulator;
  let token;
  let whitelist;

  let owner;

  beforeEach(async () => {
    owner = accounts[0];

    regulator = await RegulatorService.new({ from: owner });
    const registry = await ServiceRegistry.new(regulator.address);
    token = await RegulatedToken.new(registry.address, 'Test', 'TEST');
    whitelist = await IssuanceWhiteList.new({ from: owner });
  });

  describe('manage whitelists', () => {
    it('add whitelist', async () => {
      let wl = await regulator.addWhitelist(whitelist.address);
      assert.equal(wl.logs[0].event, 'WhitelistAdded');
    });

    it('remove whitelist', async () => {
      let wl = await regulator.addWhitelist(whitelist.address);
      assert.equal(wl.logs[0].event, 'WhitelistAdded');

      wl = await regulator.removeWhitelist(whitelist.address);
      assert.equal(wl.logs[0].event, 'WhitelistRemoved');
    });

    it('set Regulation D whitelist', async () => {
      let wl = await regulator.setRegDWhitelist(token.address, whitelist.address);
      assert.equal(wl.logs[0].event, 'RegulationDWhitelistSet');
    });

    it('get whitelists', async () => {
      let wl = await regulator.addWhitelist(whitelist.address);
      assert.equal(wl.logs[0].event, 'WhitelistAdded');

      wl = await regulator.getWhitelists.call();
      assert.equal(wl[0], whitelist.address);
    });
  });

  describe('manage settings', () => {
    it('setLocked', async () => {
      let l = await regulator.setLocked(token.address, true);
      assert.equal(l.logs[0].event, 'LogLockSet');
    });

    it('setPartialTransfers', async () => {
      let l = await regulator.setPartialTransfers(token.address, true);
      assert.equal(l.logs[0].event, 'LogPartialTransferSet');
    });

    it('setInititalOfferEndDate', async () => {
      let l = await regulator.setInititalOfferEndDate(token.address, new Date().getTime()/1000.0);
      assert.equal(l.logs[0].event, 'InititalOfferEndDateSet');
    });

    it('setIssuer', async () => {
      let l = await regulator.setIssuer(token.address, accounts[1]);
      assert.equal(l.logs[0].event, 'IssuerSet');
    });

    it('removeIssuer', async () => {
      let l = await regulator.removeIssuer(token.address);
      assert.equal(l.logs[0].event, 'IssuerRemoved');
    });

    it('getIssuerAddress', async () => {
      let l = await regulator.setIssuer(token.address, accounts[1]);
      assert.equal(l.logs[0].event, 'IssuerSet');

      l = await regulator.getIssuerAddress(token.address);
      assert.equal(l, accounts[1]);
    });

    it('setMessagingAddress', async () => {
      let l = await regulator.setMessagingAddress('someAddress');
      assert.equal(l.logs[0].event, 'MessagingAddressSet');
    });

    it('getMessagingAddress', async () => {
      let l = await regulator.setMessagingAddress('someAddress');
      assert.equal(l.logs[0].event, 'MessagingAddressSet');

      l = await regulator.getMessagingAddress();
      assert.equal(l, 'someAddress');
    });
  });
});

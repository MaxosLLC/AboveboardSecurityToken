const helpers = require('../helpers/throwAndAssert');
const RegulatedToken = artifacts.require('./RegulatedToken.sol');
const ServiceRegistry = artifacts.require('./ServiceRegistry.sol');
const RegulatorService = artifacts.require('./AboveboardRegDSWhitelistRegulatorService.sol');
const IssuanceWhiteList = artifacts.require('./IssuanceWhiteList.sol');
const SettingsStorage = artifacts.require('./SettingsStorage.sol');

contract('SettingsStorage', async accounts => {
  let storage;
  let regulator;
  let token;
  let whitelist;

  let owner;

  beforeEach(async () => {
    owner = accounts[0];

    storage = await SettingsStorage.new({ from: owner });
    regulator = await RegulatorService.new(storage.address, { from: owner });
    const registry = await ServiceRegistry.new(regulator.address);
    token = await RegulatedToken.new(registry.address, 'Test', 'TEST');
    whitelist = await IssuanceWhiteList.new({ from: owner });
  });

  describe('manage whitelists', () => {
    it('add whitelist', async () => {
      let wl = await storage.addWhitelist(whitelist.address);
      assert.equal(wl.logs[0].event, 'WhitelistAdded');
    });

    it('remove whitelist', async () => {
      let wl = await storage.addWhitelist(whitelist.address);
      assert.equal(wl.logs[0].event, 'WhitelistAdded');

      wl = await storage.removeWhitelist(whitelist.address);
      assert.equal(wl.logs[0].event, 'WhitelistRemoved');
    });

    it('get whitelists', async () => {
      let wl = await storage.addWhitelist(whitelist.address);
      assert.equal(wl.logs[0].event, 'WhitelistAdded');

      wl = await storage.getWhitelists.call();
      assert.equal(wl[0], whitelist.address);
    });
  });

  describe('manage settings', () => {
    it('setLocked', async () => {
      let l = await storage.setLocked(token.address, true);
      assert.equal(l.logs[0].event, 'LogLockSet');
    });

    it('setInititalOfferEndDate', async () => {
      let l = await storage.setInititalOfferEndDate(token.address, new Date().getTime()/1000.0);
      assert.equal(l.logs[0].event, 'InititalOfferEndDateSet');
    });

    it('setIssuer', async () => {
      let l = await storage.setIssuer(token.address, accounts[1]);
      assert.equal(l.logs[0].event, 'IssuerSet');
    });

    it('removeIssuer', async () => {
      let l = await storage.removeIssuer(token.address);
      assert.equal(l.logs[0].event, 'IssuerRemoved');
    });

    it('getIssuerAddress', async () => {
      let l = await storage.setIssuer(token.address, accounts[1]);
      assert.equal(l.logs[0].event, 'IssuerSet');

      l = await storage.getIssuerAddress(token.address);
      assert.equal(l, accounts[1]);
    });

    it('setMessagingAddress', async () => {
      let l = await storage.setMessagingAddress(token.address, 'someAddress');
      assert.equal(l.logs[0].event, 'MessagingAddressSet');
    });

    it('getMessagingAddress', async () => {
      let l = await storage.setMessagingAddress(token.address, 'someAddress');
      assert.equal(l.logs[0].event, 'MessagingAddressSet');

      l = await storage.getMessagingAddress(token.address);
      assert.equal(l, 'someAddress');
    });
  });
});

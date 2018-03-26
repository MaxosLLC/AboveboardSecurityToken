const helpers = require('./throwAndAssert');
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
  });
});

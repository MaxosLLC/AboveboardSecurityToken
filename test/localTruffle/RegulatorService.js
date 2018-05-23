const helpers = require('../helpers/throwAndAssert');
const RegulatedToken = artifacts.require('./RegulatedToken.sol');
const RegulatorService = artifacts.require('./AboveboardRegDSWhitelistRegulatorService.sol');
const SettingsStorage = artifacts.require('./SettingsStorage.sol');

contract('ServiceRegistry', async accounts => {
  let owner;
  let newOwner;
  let hacker;
  let participant;

  let storage;
  let service;

  beforeEach(async () => {
    owner = accounts[0];
    newOwner = accounts[1];
    hacker = accounts[2];
    participant = accounts[3];

    storage = await SettingsStorage.new({ from: owner });
    service = await RegulatorService.new(storage.address, { from: owner });
  });

  describe('ownership', () => {
    it('allows ownership transfer', async () => {
      await helpers.expectThrow(storage.transferOwnership(newOwner, { from: hacker }));
      await storage.transferOwnership(newOwner, { from: owner });

      await helpers.expectThrow(storage.transferOwnership(hacker, { from: owner }));
      await storage.transferOwnership(hacker, { from: newOwner });
    });
  });

  describe('replaceService', () => {
    let newStorage;

    beforeEach(async () => {
      assert.equal(await storage.owner(), owner);
      assert.equal(await service.getStorageAddress(), storage.address);

      newStorage = await SettingsStorage.new({ from: owner });
    });

    it('should allow the owner to replace the service with a contract', async () => {
      const event = service.ReplaceStorage();

      await service.replaceStorage(newStorage.address);
      assert.equal(await service.getStorageAddress(), newStorage.address);

      await helpers.assertEvent(event, {
        oldStorage: storage.address,
        newStorage: newStorage.address,
      });
    });

    it('should NOT allow an invalid address', async () => {
      await helpers.expectThrow(service.replaceStorage(participant));
      await helpers.expectThrow(service.replaceStorage(0));
      assert.equal(await service.getStorageAddress(), storage.address);
    });

    it('should NOT allow anybody except for the owner to replace the service', async () => {
      await helpers.expectThrow(service.replaceStorage(newStorage.address, { from: hacker }));
      assert.equal(await service.getStorageAddress(), storage.address);
    });
  });
});

const helpers = require('../helpers/throwAndAssert')
const RegulatorService = artifacts.require('./RegulatorService.sol')
const SettingsStorage = artifacts.require('./SettingsStorage.sol')

contract('RegulatorService', async accounts => {
  let owner
  let hacker
  let participant

  let storage
  let service

  beforeEach(async () => {
    owner = accounts[0]
    hacker = accounts[2]
    participant = accounts[3]

    storage = await SettingsStorage.new(false, true, 0, '', { from: owner })
    service = await RegulatorService.new(storage.address, { from: owner })
  })

  describe('replaceStorage', () => {
    let newStorage

    beforeEach(async () => {
      assert.equal(await service.settingsStorage(), storage.address)

      newStorage = await SettingsStorage.new(false, true, 0, '', { from: owner })
    })

    it('should allow the owner to replace the storage with a contract', async () => {
      const event = service.ReplaceStorage()

      await service.replaceStorage(newStorage.address)
      assert.equal(await service.settingsStorage(), newStorage.address)

      await helpers.assertEvent(event, {
        oldStorage: storage.address,
        newStorage: newStorage.address
      })
    })

    it('should NOT allow an invalid address', async () => {
      await helpers.expectThrow(service.replaceStorage(participant))
      await helpers.expectThrow(service.replaceStorage(0))
      assert.equal(await service.settingsStorage(), storage.address)
    })

    it('should NOT allow anybody except for the owner to replace the service', async () => {
      await helpers.expectThrow(service.replaceStorage(newStorage.address, { from: hacker }))
      assert.equal(await service.settingsStorage(), storage.address)
    })
  })
})

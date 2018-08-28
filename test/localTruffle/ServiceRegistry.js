const helpers = require('../helpers/throwAndAssert')
const ServiceRegistry = artifacts.require('./ServiceRegistry.sol')
const RegulatorService = artifacts.require('./AboveboardRegDSWhitelistRegulatorService.sol')
const SettingsStorage = artifacts.require('./SettingsStorage.sol')

contract('ServiceRegistry', async accounts => {
  let owner
  let hacker
  let participant

  let storage
  let service
  let registry

  beforeEach(async () => {
    owner = accounts[0]
    hacker = accounts[2]
    participant = accounts[3]

    storage = await SettingsStorage.new(false, true, 0, '', { from: owner })
    service = await RegulatorService.new(storage.address, { from: owner })
    registry = await ServiceRegistry.new(service.address, { from: owner })
  })

  describe('replaceService', () => {
    let newService

    beforeEach(async () => {
      assert.equal(await registry.service(), service.address)

      newService = await RegulatorService.new(storage.address, { from: owner })
    })

    it('should allow the owner to replace the service with a contract', async () => {
      const event = registry.ReplaceService()

      await registry.replaceService(newService.address)
      assert.equal(await registry.service(), newService.address)

      await helpers.assertEvent(event, {
        oldService: service.address,
        newService: newService.address
      })
    })

    it('should NOT allow an invalid address', async () => {
      await helpers.expectThrow(registry.replaceService(participant))
      await helpers.expectThrow(registry.replaceService(0))
      assert.equal(await registry.service(), service.address)
    })

    it('should NOT allow anybody except for the owner to replace the service', async () => {
      await helpers.expectThrow(registry.replaceService(newService.address, { from: hacker }))
      assert.equal(await registry.service(), service.address)
    })
  })
})

const helpers = require('../helpers/throwAndAssert')
const RegulatedToken = artifacts.require('./RegulatedToken.sol')
const ServiceRegistry = artifacts.require('./ServiceRegistry.sol')
const RegulatorService = artifacts.require('./AboveboardRegDSWhitelistRegulatorService.sol')
const IssuanceWhiteList = artifacts.require('./IssuanceWhiteList.sol')
const SettingsStorage = artifacts.require('./SettingsStorage.sol')
const TransferManager = artifacts.require('./polymath/AboveboardTransferManager.sol')

contract('AboveboardTransferManager', async accounts => {
  let storage
  let manager
  let whitelist
  let token

  const owner = accounts[0]
  const receiver = accounts[1]
  const issuer = accounts[4]

  const fromOwner = { from: owner }
  const fromReceiver = { from: receiver }

  beforeEach(async () => {
    storage = await SettingsStorage.new(false, true, 0, '')

    const regulator = await RegulatorService.new(storage.address, { fromOwner })

    const registry = await ServiceRegistry.new(regulator.address)

    token = await RegulatedToken.new(registry.address, 'Test', 'TEST')

    manager = await TransferManager.new(token.address, '0x0000000000000000000000000000000000000000', storage.address, { gas: 9000000 })

    whitelist = await IssuanceWhiteList.new('Test')

    await storage.setIssuerPermission('setLocked', true)
    await storage.setIssuerPermission('setInititalOfferEndDate', true)
    await storage.setIssuerPermission('allowNewShareholders', true)
    await storage.setIssuerPermission('addWhitelist', true)

    await storage.addOfficer(issuer)
    await storage.allowNewShareholders(true, { from: issuer })
    await storage.addWhitelist(whitelist.address)
  })

  describe('verifyTransfer', () => {
    
    describe('when the receiver is not added to whitelist', () => {
      it('does NOT verify transfer', async () => {
        const value = 25

        try {
          await manager.verifyTransfer(owner, receiver, value, true);
        } catch (e) {
          assert.ok(e)
        }
      })
    })
    
    describe('when receiver is added to whitelist', () => {
      beforeEach(async () => {
        await whitelist.add(receiver, '', 0, '', '')
      })

      it('verifies transfer', async () => {
        const value = 25

        await manager.verifyTransfer(owner, receiver, value, true);
      })
    })
  })
})

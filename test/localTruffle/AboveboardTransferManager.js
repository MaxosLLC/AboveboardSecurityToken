const helpers = require('../helpers/throwAndAssert')
const RegulatedToken = artifacts.require('./RegulatedToken.sol')
const IssuanceWhiteList = artifacts.require('./IssuanceWhiteList.sol')
const SettingsStorage = artifacts.require('./SettingsStorage.sol')
const TransferManager = artifacts.require('./polymath/AboveboardTransferManager.sol')

contract('AboveboardTransferManager', async accounts => {
  let storage
  let manager
  let whitelist

  const owner = accounts[0]
  const receiver = accounts[1]
  const issuer = accounts[4]

  const fromOwner = { from: owner }
  const fromReceiver = { from: receiver }

  beforeEach(async () => {
    storage = await SettingsStorage.new()

    manager = await TransferManager.new('', '', storage.address, { gas: 9000000 })

    whitelist = await IssuanceWhiteList.new()

    await storage.setIssuerPermission('setLocked', true)
    await storage.setIssuerPermission('setInititalOfferEndDate', true)
    await storage.setIssuerPermission('allowNewShareholders', true)
    await storage.setIssuerPermission('addWhitelist', true)

    await storage.addOfficer(issuer)
    await storage.allowNewShareholders(true, { from: issuer })
    await storage.addWhitelist(whitelist.address)
    await storage.addWhitelist(regDWhitelist.address)
    await storage.setInititalOfferEndDate(releaseTime, { from: issuer })
  })

  describe('verifyTransfer', () => {
    
    describe('when the receiver is not added to whitelist', () => {
      it('does NOT transfer funds', async () => {
        const value = 25

        let res = await manager.verifyTransfer(owner, receiver, value, fromOwner);
        assert.equal(res, 'INVALID')
      })
    })
    
    describe('when receiver is added to whitelist', () => {
      beforeEach(async () => {
        await whitelist.add(receiver)
      })

      it('transfers funds', async () => {
        const value = 25

        let res = await manager.verifyTransfer(owner, receiver, value, fromOwner);
        assert.equal(res, 'VALID')
      })
    })
  })
})

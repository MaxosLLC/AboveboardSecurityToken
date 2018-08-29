const utils = require('../helpers/utils')

const RegulatedToken = artifacts.require('./RegulatedToken.sol')
const ServiceRegistry = artifacts.require('./ServiceRegistry.sol')
const RegulatorService = artifacts.require('./AboveboardRegDSWhitelistRegulatorService.sol')
const IssuanceWhiteList = artifacts.require('./IssuanceWhiteList.sol')
const MultiSigWallet = artifacts.require('./MultiSigArbitration.sol')
const SettingsStorage = artifacts.require('./SettingsStorage.sol')

contract('MultiSigWallet', async accounts => {
  let storage
  let regulator
  let token
  let whitelist
  let wallet
  const value = 25

  const owner = accounts[0]
  const arbitrator = accounts[2]
  const issuer = accounts[4]

  beforeEach(async () => {
    storage = await SettingsStorage.new(false, true, 0, '', { from: owner })

    regulator = await RegulatorService.new(storage.address, { from: owner })

    const registry = await ServiceRegistry.new(regulator.address)

    token = await RegulatedToken.new(registry.address, 'Test', 'TEST', 0)

    whitelist = await IssuanceWhiteList.new('Test', { from: owner })

    wallet = await MultiSigWallet.new([arbitrator, owner], 2)

    await storage.setIssuerPermission('setLocked', true)
    await storage.setIssuerPermission('allowNewShareholders', true)
    await storage.setIssuerPermission('addWhitelist', true)

    await storage.addOfficer(issuer)
    await storage.allowNewShareholders(true, { from: issuer })
    await storage.addWhitelist(whitelist.address, { from: issuer })

    await token.mint(owner, 100)
    await token.finishMinting()
  })

  describe('when funds are send from wallet', () => {
    beforeEach(async () => {
      await whitelist.add(owner, '', 0, '', '')
      await whitelist.add(wallet.address, '', 0, '', '')
    })

    it('transfer from wallet', async () => {
      // transfer some funds to multisig wallet contract
      await token.transfer(wallet.address, value, {from: owner})
      let b = await token.balanceOf.call(wallet.address).valueOf()
      assert.equal(b, value)

      // create tx which approves funds transfer from wallet to receiver
      const approveEncoded = token.contract.approve.getData(wallet.address, value, {from: wallet.address})

      // submit tx
      var transactionId = utils.getParamFromTxEvent(
          await wallet.submitTransaction(token.address, 0, approveEncoded, {from: owner}),
          'transactionId', null, 'Submission')

      // confirm by arbitrator
      var executedTransactionId = utils.getParamFromTxEvent(
          await wallet.confirmTransaction(transactionId, {from: arbitrator}),
          'transactionId', null, 'Execution')

      // Check that transaction has been executed
      assert.ok(transactionId.equals(executedTransactionId))

      // create tx which transfers funds from wallet to receiver
      const transferEncoded = token.contract.transferFrom.getData(wallet.address, owner, value, {from: wallet.address})

      // submit tx
      transactionId = utils.getParamFromTxEvent(
        await wallet.submitTransaction(token.address, 0, transferEncoded, {from: owner}),
        'transactionId', null, 'Submission')

      // confirm by arbitrator
      executedTransactionId = utils.getParamFromTxEvent(
        await wallet.confirmTransaction(transactionId, {from: arbitrator}),
        'transactionId', null, 'Execution')

      // Check that transaction has been executed
      assert.ok(transactionId.equals(executedTransactionId))

      b = await token.balanceOf.call(wallet.address).valueOf()
      assert.equal(b, 0)
    })
  })
})

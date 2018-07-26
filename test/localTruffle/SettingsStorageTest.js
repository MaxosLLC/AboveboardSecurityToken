const IssuanceWhiteList = artifacts.require('./IssuanceWhiteList.sol')
const SettingsStorage = artifacts.require('./SettingsStorage.sol')

contract('SettingsStorage', async accounts => {
  let storage
  let whitelist

  const owner = accounts[0]
  const issuer = accounts[4]
  const hacker = accounts[5]

  beforeEach(async () => {
    storage = await SettingsStorage.new({ from: owner })
    whitelist = await IssuanceWhiteList.new({ from: owner })

    await storage.setIssuer(issuer, { from: owner })
    await storage.setIssuerPermission('setLocked', true)
    await storage.setIssuerPermission('setInititalOfferEndDate', true)
    await storage.setIssuerPermission('allowNewShareholders', true)
    await storage.setIssuerPermission('addWhitelist', true)
  })

  describe('manage whitelists', () => {
    it('add whitelist', async () => {
      let wl = await storage.addWhitelist(whitelist.address)
      assert.equal(wl.logs[0].event, 'WhitelistAdded')
    })

    it('remove whitelist', async () => {
      let wl = await storage.addWhitelist(whitelist.address)
      assert.equal(wl.logs[0].event, 'WhitelistAdded')

      wl = await storage.removeWhitelist(whitelist.address)
      assert.equal(wl.logs[0].event, 'WhitelistRemoved')
    })

    it('get whitelists', async () => {
      let wl = await storage.addWhitelist(whitelist.address)
      assert.equal(wl.logs[0].event, 'WhitelistAdded')

      wl = await storage.getWhitelists.call()
      assert.equal(wl[0], whitelist.address)
    })
  })

  describe('manage settings', () => {
    it('setLocked', async () => {
      let l = await storage.setLocked(true, { from: issuer })
      assert.equal(l.logs[0].event, 'LogLockSet')
    })

    it('setInititalOfferEndDate', async () => {
      let l = await storage.setInititalOfferEndDate(new Date().getTime() / 1000.0, { from: issuer })
      assert.equal(l.logs[0].event, 'InititalOfferEndDateSet')
    })

    it('setIssuer', async () => {
      let l = await storage.setIssuer(accounts[1], { from: issuer })
      assert.equal(l.logs[0].event, 'IssuerSet')
    })

    it('setIssuer from owner after already set', async () => {
      try {
        await storage.setIssuer(accounts[1], { from: owner })
      } catch (e) {
        assert.ok(e)
      }
    })

    it('setIssuer from hacker', async () => {
      try {
        await storage.setIssuer(accounts[1], { from: hacker })
      } catch (e) {
        assert.ok(e)
      }
    })

    it('getIssuerAddress', async () => {
      let l = await storage.setIssuer(accounts[1], { from: issuer })
      assert.equal(l.logs[0].event, 'IssuerSet')

      l = await storage.officers.call(accounts[1])
      assert.equal(l, true)
    })

    it('setMessagingAddress', async () => {
      let l = await storage.setMessagingAddress('someAddress')
      assert.equal(l.logs[0].event, 'MessagingAddressSet')

      l = await storage.messagingAddress.call()
      assert.equal(l, 'someAddress')
    })

    it('allowNewShareholders', async () => {
      let l = await storage.allowNewShareholders(true, { from: issuer })
      assert.equal(l.logs[0].event, 'NewShareholdersAllowance')

      l = await storage.newShareholdersAllowed.call()
      assert.equal(l, true)
    })
  })
})

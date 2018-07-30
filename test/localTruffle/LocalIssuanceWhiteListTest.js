let IssuanceWhiteList = artifacts.require('contracts/IssuanceWhiteList.sol')

contract('IssuanceWhiteList', accounts => {
  let issuanceWhiteList

  const hacker = accounts[3]

  beforeEach(async () => {
    issuanceWhiteList = await IssuanceWhiteList.new({from: accounts[0]})
  })

  it('Test agent - qualifier addition/removal', async () => {
    await issuanceWhiteList.setAgent(accounts[0])
    await issuanceWhiteList.addQualifier(accounts[0])
    await issuanceWhiteList.removeQualifier(accounts[0])
  })

  it('Set whitelist type', async () => {
    let w = await issuanceWhiteList.setWhitelistType('RegS')
    assert.equal(w.logs[0].event, 'WhitelistTypeSet')
  })

  it('Get list of buyers', async () => {
    await issuanceWhiteList.add(accounts[0])
    await issuanceWhiteList.add(accounts[1])

    let l = await issuanceWhiteList.getBuyers()
    assert.equal(l[0], accounts[0])
    assert.equal(l[1], accounts[1])

    await issuanceWhiteList.remove(accounts[0])

    l = await issuanceWhiteList.getBuyers()
    assert.equal(l[0], '0x0000000000000000000000000000000000000000')
    assert.equal(l[1], accounts[1])
  })

  it('Get list of qualifiers', async () => {
    await issuanceWhiteList.addQualifier(accounts[1])
    await issuanceWhiteList.addQualifier(accounts[2])

    let l = await issuanceWhiteList.getQualifiers({ from: accounts[2] })
    assert.equal(l[0], accounts[1])
    assert.equal(l[1], accounts[2])

    await issuanceWhiteList.removeQualifier(accounts[1])

    l = await issuanceWhiteList.getQualifiers({ from: accounts[2] })
    assert.equal(l[0], '0x0000000000000000000000000000000000000000')
    assert.equal(l[1], accounts[2])
  })

  it('Get list of qualifiers by hacker', async () => {
    await issuanceWhiteList.addQualifier(accounts[1])
    await issuanceWhiteList.addQualifier(accounts[2])

    try {
      await issuanceWhiteList.getQualifiers({ from: hacker })
    } catch (e) {
      assert.ok(e)
    }
  })
})

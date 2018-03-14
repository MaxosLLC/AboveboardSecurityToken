/* global describe test expect beforeEach */
var assert = require('assert')
const Web3 = require('web3')
import { IssuanceWhiteList } from 'helpers/contracts'
import { RegulationDWhiteList } from 'helpers/contracts'
import { ServiceRegistry } from 'helpers/contracts'
import { RegulatorService } from 'helpers/contracts'
import { RegulatedToken } from 'helpers/contracts'

import latestTime from 'helpers/latestTime'
import { increaseTimeTo, duration } from 'helpers/increaseTime'
var releaseTime;

describe('RegDWhitelist test', () => {
  const web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
  let _web3 = new Web3(web3Provider);
  let iwl;
  let regDWl;
  let registry;
  let service;
  let token;
  beforeEach(async () => {
    iwl = await newIssuanceWhiteList();
    regDWl = await newRegulationDWhiteList();
    service = await newRegulatorService();
    registry = await newServiceRegistry(service.address);
    token = await newRegulatedToken(registry.address, 'Aboveboard', 'ABV');
    releaseTime = latestTime(_web3) + duration.days(180);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  })

  test('RegDWhitelist add to whitelist', async () => {
    // add members to whitelist
    let add = await iwl.add(_web3.eth.accounts[0]);
    assert.equal(add.logs[0].event, 'MemberAdded');

    add = await regDWl.add(_web3.eth.accounts[1]);
    assert.equal(add.logs[0].event, 'MemberAdded');

    // add whitelist to Regulator Service
    let addWl = await service.addWhitelist(iwl.address);
    assert.equal(addWl.logs[0].event, 'WhitelistAdded');

    // add RegD whitelist to Regulator Service
    let addRegDWl = await service.addWhitelist(regDWl.address);
    assert.equal(addRegDWl.logs[0].event, 'WhitelistAdded');
  });

  test('RegDWhitelist transfer', async () => {
    // add members to whitelist
    let add = await iwl.add(_web3.eth.accounts[0]);
    assert.equal(add.logs[0].event, 'MemberAdded');

    add = await regDWl.add(_web3.eth.accounts[1]);
    assert.equal(add.logs[0].event, 'MemberAdded');

    // set RegD release date
    let dt = await regDWl.setReleaseDate(_web3.eth.accounts[1], releaseTime);
    assert.equal(dt.logs[0].event, 'ReleaseDateSet');

    // add whitelist to Regulator Service
    let addWl = await service.addWhitelist(iwl.address);
    assert.equal(addWl.logs[0].event, 'WhitelistAdded');

    // add RegD whitelist to Regulator Service
    let addRegDWl = await service.addWhitelist(regDWl.address);
    assert.equal(addRegDWl.logs[0].event, 'WhitelistAdded');

    // mint some coins
    await token.mint(_web3.eth.accounts[0], 1000000);
    await token.finishMinting();

    let balance = await token.balanceOf(_web3.eth.accounts[0]);
    assert.equal(balance.c, '1000000');

    // enable partial transfers
    let pt = await service.setPartialTransfers(token.address, true);
    assert.equal(pt.logs[0].event, 'LogPartialTransferSet');

    // increase time
    await increaseTimeTo(releaseTime + duration.seconds(100), _web3)

    // transfer
    let t = await token.transfer(_web3.eth.accounts[1], 1000)
    assert.equal(t.logs[0].event, 'CheckStatus');
    assert.equal(t.logs[0].args.reason.c, 0);

    balance = await token.balanceOf(_web3.eth.accounts[1]);
    assert.equal(balance.c, '1000');
  });

  test('RegDWhitelist transfer before release date', async () => {
    // add members to whitelist
    let add = await iwl.add(_web3.eth.accounts[0]);
    assert.equal(add.logs[0].event, 'MemberAdded');

    add = await regDWl.add(_web3.eth.accounts[1]);
    assert.equal(add.logs[0].event, 'MemberAdded');

    // set RegD release date
    let dt = await regDWl.setReleaseDate(_web3.eth.accounts[1], releaseTime);
    assert.equal(dt.logs[0].event, 'ReleaseDateSet');
    
    // add whitelist to Regulator Service
    let addWl = await service.addWhitelist(iwl.address);
    assert.equal(addWl.logs[0].event, 'WhitelistAdded');

    // add RegD whitelist to Regulator Service
    let addRegDWl = await service.addWhitelist(regDWl.address);
    assert.equal(addRegDWl.logs[0].event, 'WhitelistAdded');

    // mint some coins
    await token.mint(_web3.eth.accounts[0], 1000000);
    await token.finishMinting();

    let balance = await token.balanceOf(_web3.eth.accounts[0]);
    assert.equal(balance.c, '1000000');

    // enable partial transfers
    let pt = await service.setPartialTransfers(token.address, true);
    assert.equal(pt.logs[0].event, 'LogPartialTransferSet');

    // do not increase time so transfer fails
    let t;
    try {
      t = await token.transfer(_web3.eth.accounts[1], 1000)
      assert.fail('locked up, should have thrown before');
    } catch (error) {
      assert(error);
      assert.equal(t.logs[0].event, 'CheckStatus');
      assert.equal(t.logs[0].args.reason.c, 4);
      return;
    }
    assert.fail('Expected throw not received');
  });

  test('RegDWhitelist sender not added to whitelist', async () => {
    // add receiver to whitelist
    let add = await regDWl.add(_web3.eth.accounts[1]);
    assert.equal(add.logs[0].event, 'MemberAdded');

    // set RegD release date
    let dt = await regDWl.setReleaseDate(_web3.eth.accounts[1], releaseTime);
    assert.equal(dt.logs[0].event, 'ReleaseDateSet');

    // add whitelist to Regulator Service
    let addWl = await service.addWhitelist(iwl.address);
    assert.equal(addWl.logs[0].event, 'WhitelistAdded');

    // add RegD whitelist to Regulator Service
    let addRegDWl = await service.addWhitelist(regDWl.address);
    assert.equal(addRegDWl.logs[0].event, 'WhitelistAdded');

    // mint some coins
    await token.mint(_web3.eth.accounts[0], 1000000);
    await token.finishMinting();

    let balance = await token.balanceOf(_web3.eth.accounts[0]);
    assert.equal(balance.c, '1000000');

    // enable partial transfers
    let pt = await service.setPartialTransfers(token.address, true);
    assert.equal(pt.logs[0].event, 'LogPartialTransferSet');

    // increase time
    await increaseTimeTo(releaseTime + duration.seconds(100), _web3)

    // transfer
    let t = await token.transfer(_web3.eth.accounts[1], 1000)
    assert.equal(t.logs[0].event, 'CheckStatus');
    assert.equal(t.logs[0].args.reason.c, 3);
  });

  test('RegDWhitelist receiver not added to whitelist', async () => {
    // add receiver to whitelist
    let add = await regDWl.add(_web3.eth.accounts[0]);
    assert.equal(add.logs[0].event, 'MemberAdded');

    // set RegD release date
    let dt = await regDWl.setReleaseDate(_web3.eth.accounts[0], releaseTime);
    assert.equal(dt.logs[0].event, 'ReleaseDateSet');
    
    // add whitelist to Regulator Service
    let addWl = await service.addWhitelist(iwl.address);
    assert.equal(addWl.logs[0].event, 'WhitelistAdded');

    // add RegD whitelist to Regulator Service
    let addRegDWl = await service.addWhitelist(regDWl.address);
    assert.equal(addRegDWl.logs[0].event, 'WhitelistAdded');

    // mint some coins
    await token.mint(_web3.eth.accounts[0], 1000000);
    await token.finishMinting();

    let balance = await token.balanceOf(_web3.eth.accounts[0]);
    assert.equal(balance.c, '1000000');

    // enable partial transfers
    let pt = await service.setPartialTransfers(token.address, true);
    assert.equal(pt.logs[0].event, 'LogPartialTransferSet');

    // increase time
    await increaseTimeTo(releaseTime + duration.seconds(100), _web3)

    // transfer
    let t = await token.transfer(_web3.eth.accounts[1], 1000)
    assert.equal(t.logs[0].event, 'CheckStatus');
    assert.equal(t.logs[0].args.reason.c, 4);
  });

  test('RegDWhitelist transfer locked', async () => {
    // add members to whitelist
    let add = await iwl.add(_web3.eth.accounts[0]);
    assert.equal(add.logs[0].event, 'MemberAdded');

    add = await regDWl.add(_web3.eth.accounts[1]);
    assert.equal(add.logs[0].event, 'MemberAdded');

    // set RegD release date
    let dt = await regDWl.setReleaseDate(_web3.eth.accounts[1], releaseTime);
    assert.equal(dt.logs[0].event, 'ReleaseDateSet');
    
    // add whitelist to Regulator Service
    let addWl = await service.addWhitelist(iwl.address);
    assert.equal(addWl.logs[0].event, 'WhitelistAdded');

    // add RegD whitelist to Regulator Service
    let addRegDWl = await service.addWhitelist(regDWl.address);
    assert.equal(addRegDWl.logs[0].event, 'WhitelistAdded');

    // mint some coins
    await token.mint(_web3.eth.accounts[0], 1000000);
    await token.finishMinting();

    let balance = await token.balanceOf(_web3.eth.accounts[0]);
    assert.equal(balance.c, '1000000');

    // enable partial transfers
    let pt = await service.setPartialTransfers(token.address, true);
    assert.equal(pt.logs[0].event, 'LogPartialTransferSet');

    // lock regulator service
    let l = await service.setLocked(token.address, true);
    assert.equal(l.logs[0].event, 'LogLockSet');

    // increase time
    await increaseTimeTo(releaseTime + duration.seconds(100), _web3)

    // transfer
    let t = await token.transfer(_web3.eth.accounts[1], 1000)
    assert.equal(t.logs[0].event, 'CheckStatus');
    assert.equal(t.logs[0].args.reason.c, 1);
  });

  test('RegDWhitelist transfer back to issuer', async () => {
    // set issuer
    var issuer = _web3.eth.accounts[0];
    service.setIssuer(issuer);

    // add members to whitelist
    let add = await iwl.add(issuer);
    assert.equal(add.logs[0].event, 'MemberAdded');

    add = await regDWl.add(_web3.eth.accounts[1]);
    assert.equal(add.logs[0].event, 'MemberAdded');

    // set RegD release date
    let dt = await regDWl.setReleaseDate(_web3.eth.accounts[1], releaseTime);
    assert.equal(dt.logs[0].event, 'ReleaseDateSet');

    // add whitelist to Regulator Service
    let addWl = await service.addWhitelist(iwl.address);
    assert.equal(addWl.logs[0].event, 'WhitelistAdded');

    // add RegD whitelist to Regulator Service
    let addRegDWl = await service.addWhitelist(regDWl.address);
    assert.equal(addRegDWl.logs[0].event, 'WhitelistAdded');

    // mint some coins
    await token.mint(issuer, 1000000);
    await token.finishMinting();

    let balance = await token.balanceOf(issuer);
    assert.equal(balance.c, '1000000');

    // enable partial transfers
    let pt = await service.setPartialTransfers(token.address, true);
    assert.equal(pt.logs[0].event, 'LogPartialTransferSet');

    // transfer from issuer
    let t = await token.transfer(_web3.eth.accounts[1], 1000)
    assert.equal(t.logs[0].event, 'CheckStatus');
    assert.equal(t.logs[0].args.reason.c, 0);

    balance = await token.balanceOf(_web3.eth.accounts[1]);
    assert.equal(balance.c, '1000');

    // transfer back to issuer
    t = await token.transfer(issuer, 500, { from: _web3.eth.accounts[1] })
    assert.equal(t.logs[0].event, 'CheckStatus');
    assert.equal(t.logs[0].args.reason.c, 0);

    balance = await token.balanceOf(_web3.eth.accounts[1]);
    assert.equal(balance.c, '500');
  });
})

async function newIssuanceWhiteList () {
  const shrmp = await tryAsync(IssuanceWhiteList.new())
  return shrmp
}

async function newRegulationDWhiteList () {
  const shrmp = await tryAsync(RegulationDWhiteList.new())
  return shrmp
}

async function newRegulatedToken (registry, name, symbol) {
  const shrmp = await tryAsync(RegulatedToken.new(registry, name, symbol))
  return shrmp
}

async function newRegulatorService () {
  const shrmp = await tryAsync(RegulatorService.new())
  return shrmp
}

async function newServiceRegistry (service) {
  const shrmp = await tryAsync(ServiceRegistry.new(service))
  return shrmp
}

async function tryAsync (asyncFn) {
  try {
    return await asyncFn
  } catch (err) {
    console.error(err)
  }
}

// https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/test/helpers/expectThrow.js
exports.expectThrow = async promise => {
    try {
      await promise;
    } catch (error) {
      // TODO: Check jump destination to destinguish between a throw
      //       and an actual invalid jump.
      const invalidOpcode = error.message.search('invalid opcode') >= 0;
      // TODO: When we contract A calls contract B, and B throws, instead
      //       of an 'invalid jump', we get an 'out of gas' error. How do
      //       we distinguish this from an actual out of gas event? (The
      //       testrpc log actually show an 'invalid jump' event.)
      const outOfGas = error.message.search('out of gas') >= 0;
      const revert = error.message.search('revert') >= 0;
      assert(invalidOpcode || outOfGas || revert, "Expected throw, got '" + error + "' instead");
      return;
    }
    assert.fail('Expected throw not received');
  };
  
  exports.assertEvent = (event, args, assertEqual = assert.deepEqual, timeout = 3000) => {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        reject(new Error('Timeout while waiting for event'));
      }, timeout);
  
      event.watch((error, response) => {
        try {
          assertEqual(response.args, args, 'Event argument mismatch');
          resolve(response);
        } finally {
          clearTimeout(t);
          event.stopWatching();
        }
      });
    });
  };

  // Increases testrpc time by the passed duration in seconds
  exports.increaseTime = (duration, web3) => {
    const id = Date.now()

    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync({
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [duration],
        id: id,
      }, err1 => {
        if (err1) return reject(err1)

        web3.currentProvider.sendAsync({
          jsonrpc: '2.0',
          method: 'evm_mine',
          id: id+1,
        }, (err2, res) => {
          return err2 ? reject(err2) : resolve(res)
        })
      })
    })
  }

  /**
   * Beware that due to the need of calling two separate testrpc methods and rpc calls overhead
   * it's hard to increase time precisely to a target point so design your test to tolerate
   * small fluctuations from time to time.
   *
   * @param target time in seconds
   */
  exports.increaseTimeTo = (target, web3) => {
    let now = web3.eth.getBlock('latest').timestamp;
    if (target < now) throw Error(`Cannot increase current time(${now}) to a moment in the past(${target})`);
    let diff = target - now;
    return this.increaseTime(diff, web3);
  }

  exports.duration = {
    seconds: function(val) { return val},
    minutes: function(val) { return val * this.seconds(60) },
    hours:   function(val) { return val * this.minutes(60) },
    days:    function(val) { return val * this.hours(24) },
    weeks:   function(val) { return val * this.days(7) },
    years:   function(val) { return val * this.days(365)}
  };

/* globals expect */

import toBeValidAddress from './assertions/toBeValidAddress'

expect.extend({
  toBeValidAddress: function (received) {
    return {
      message: () => { return `expected ${received} to be a valid address` },
      pass: toBeValidAddress(received) === true
    }
  }
})

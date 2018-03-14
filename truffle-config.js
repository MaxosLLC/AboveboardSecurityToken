module.exports = {
  networks: {

    development: {
      host: process.env.TRUFFLE_HOST || 'localhost',
      port: process.env.TRUFFLE_PORT || 8545,
      network_id: '*' // Match any network id
    },

    rinkeby: getRinkebyConfig()

  }
}

function getRinkebyConfig () {
  var HDWalletProvider = require('truffle-hdwallet-provider')
  var secrets = {}
  try {
    secrets = require('./secrets.json')
  } catch (err) {
    console.log('could not find ./secrets.json')
  }

  var rinkebyProvider = new HDWalletProvider(secrets.mnemonic, 'https://kovan.infura.io/' + secrets.infura_apikey)

  return {
    network_id: 4,
    provider: rinkebyProvider,
    from: rinkebyProvider.getAddress(),
    gas: 4700000
  }
}

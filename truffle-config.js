module.exports = {
  networks: {
    development: {
      host: process.env.TRUFFLE_HOST || 'localhost',
      port: process.env.TRUFFLE_PORT || 8545,
      network_id: '*' // Match any network id
    },
    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8545,
      gas: 6712390,
      gasPrice: 0x01
    },
    rinkeby: getRinkebyConfig(),
    live: getliveNetworkConfig()
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
    network_id: 42,
    provider: rinkebyProvider,
    from: rinkebyProvider.getAddress(),
    gas: 4700000
  }
}

function getliveNetworkConfig () {
  var HDWalletProvider = require('truffle-hdwallet-provider')
  var secrets = {}
  try {
    secrets = require('./secrets.json')
  } catch (err) {
    console.log('could not find ./secrets.json')
  }

  var liveProvider = new HDWalletProvider(secrets.mnemonic, 'https://mainnet.infura.io/' + secrets.infura_apikey)

  return {
    network_id: 1,
    provider: liveProvider,
    from: liveProvider.getAddress()
  }
}
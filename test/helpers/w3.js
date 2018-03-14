const Web3 = require('web3')

export const web3Provider = new Web3.providers.HttpProvider('http://localhost:8545')

let _web3 = new Web3(web3Provider)
_web3.eth.defaultAccount = _web3.eth.accounts[0]

export const web3 = _web3

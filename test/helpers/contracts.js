import truffleContract from 'truffle-contract'
import truffleExt from 'truffle-ext'
import { web3, web3Provider } from './w3'
import BasicWhiteListJSON from '../../build/contracts/BasicWhiteList.json'
import IssuanceWhiteListJSON from '../../build/contracts/IssuanceWhiteList.json'
import RegulationDWhiteListJSON from '../../build/contracts/RegulationDWhiteList.json'
import ServiceRegistryJSON from '../../build/contracts/ServiceRegistry.json'
import RegulatorServiceJSON from '../../build/contracts/RegulatorService.json'
import RegulatedTokenJSON from '../../build/contracts/RegulatedToken.json'

export const BasicWhiteList = getContract(BasicWhiteListJSON)
export const IssuanceWhiteList = getContract(IssuanceWhiteListJSON)
export const RegulationDWhiteList = getContract(RegulationDWhiteListJSON)
export const ServiceRegistry = getContract(ServiceRegistryJSON)
export const RegulatorService = getContract(RegulatorServiceJSON)
export const RegulatedToken = getContract(RegulatedTokenJSON)

function getContract (contractAbi) {
  const { requireContract } = truffleExt(web3)
  return requireContract(getTruffleContract(contractAbi))
}

function getTruffleContract (contractAbi) {
  const contract = truffleContract(contractAbi)
  contract.setProvider(web3Provider)
  contract.defaults({
    from: web3.eth.accounts[0],
    gas: 4712388
  })
  return contract
}

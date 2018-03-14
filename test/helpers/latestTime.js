// Returns the time of the last mined block in seconds
export default function latestTime(web3) {
  return web3.eth.getBlock('latest').timestamp;
}

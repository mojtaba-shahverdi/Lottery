const { network } = require('hardhat')
const fs = require('fs')

const FRONT_END_ADDRESSES_FILE = '../client/constants/contractAddresses.json'
const FRONT_END_ABI_FILE = '../client/constants/abi.json'

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log('Updating Frontend...')
    await updateContractAddresses()
    await updateAbi()
    console.log('Frontend UPDATED!')
  }
}

const updateAbi = async () => {
  const lottery = await ethers.getContract('Lottery')
  fs.writeFileSync(
    FRONT_END_ABI_FILE,
    lottery.interface.format(ethers.utils.FormatTypes.json)
  )
}

const updateContractAddresses = async () => {
  const lottery = await ethers.getContract('Lottery')
  const chainId = network.config.chainId.toString()
  const contractAddresses = JSON.parse(
    fs.readFileSync(FRONT_END_ADDRESSES_FILE, 'utf8')
  )
  if (chainId in contractAddresses) {
    if (!contractAddresses[chainId].includes(lottery.address)) {
      contractAddresses[chainId].push(lottery.address)
    }
  } else {
    contractAddresses[chainId] = [lottery.address]
  }
  fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(contractAddresses))
}

module.exports.tags = ['all', 'frontend']

require('@nomicfoundation/hardhat-toolbox')
require('@nomiclabs/hardhat-etherscan')
require('hardhat-deploy')
require('hardhat-contract-sizer')
require('dotenv').config()
require('solidity-coverage')
require('hardhat-gas-reporter')

/** @type import('hardhat/config').HardhatUserConfig */

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ''
const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY'
const PRIVATE_KEY =
  process.env.PRIVATE_KEY || '0x11ee3108a03081fe260ecdc106554d09d9d1209bcafd46942b10e02943effc4a'
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ''

module.exports = {
  solidity: '0.8.7',
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1,
    },
    sepolia: {
      chainId: 11155111,
      blockConfirmations: 6,
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    // customChains: [], // uncomment this line if you are getting a TypeError: customChains is not iterable
  },
  gasReporter: {
    enabled: false,
    currency: 'USD',
    outputFile: 'gas-report.txt',
    noColors: true,
    // coinmarketcap: COINMARKETCAP_API_KEY,
  },
  mocha: {
    timeout: 300000,
  },
}

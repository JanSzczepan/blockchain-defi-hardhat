import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
import 'dotenv/config'

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || ''

const config: HardhatUserConfig = {
   defaultNetwork: 'hardhat',
   networks: {
      hardhat: {
         chainId: 31337,
         forking: {
            url: MAINNET_RPC_URL,
         },
      },
   },
   solidity: '0.8.18',
   namedAccounts: {
      deployer: {
         default: 0,
         1: 0,
      },
   },
}

export default config

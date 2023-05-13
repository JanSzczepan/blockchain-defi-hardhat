import { ethers } from 'hardhat'

export interface networkConfigItem {
   name: string
   wethToken?: string
   lendingPoolAddressesProvider?: string
   daiEthPriceFeed?: string
   daiToken?: string
   blockConfirmations?: number
   ethUsdPriceFeed?: string
}

export interface networkConfigInfo {
   [key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
   31337: {
      name: 'localhost',
      wethToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
   },
}

export const developmentChains = ['hardhat', 'localhost']
export const WETH_AMOUNT = ethers.utils.parseEther('0.1').toString()

import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'

export default function formatUnits(amount: any, decimals: number): string {
   return ethers.utils.formatUnits(
      BigNumber.from(amount)
         .mul(10 ** decimals)
         .div(String(10 ** 18)),
      decimals
   )
}

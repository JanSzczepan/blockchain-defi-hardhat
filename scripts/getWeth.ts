import { ethers, getNamedAccounts, network } from 'hardhat'
import { WETH_AMOUNT, networkConfig } from '../helper-hardhat-config'
import { IWeth } from '../typechain-types'

export async function getWeth() {
   console.log('Getting WETH...')
   const { deployer } = await getNamedAccounts()
   const iWeth: IWeth = await ethers.getContractAt(
      'IWeth',
      networkConfig[network.config.chainId!].wethToken!,
      deployer
   )

   const tx = await iWeth.deposit({ value: WETH_AMOUNT })
   await tx.wait(1)

   const wethBalance = await iWeth.balanceOf(deployer)
   console.log(
      `Got ${ethers.utils.formatUnits(
         wethBalance.mul(1000000).div(String(10 ** 18)),
         6
      )} WETH`
   )
}

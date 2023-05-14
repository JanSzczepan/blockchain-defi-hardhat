import { ethers, getNamedAccounts, network } from 'hardhat'
import { networkConfig } from '../helper-hardhat-config'
import { IWeth } from '../typechain-types'
import formatUnits from '../utils/formatUnits'

export async function getWeth(amount: string) {
   console.log('Getting WETH...')
   const { deployer } = await getNamedAccounts()
   const iWeth: IWeth = await ethers.getContractAt(
      'IWeth',
      networkConfig[network.config.chainId!].wethToken!,
      deployer
   )

   const tx = await iWeth.deposit({ value: amount })
   await tx.wait(1)

   const wethBalance = await iWeth.balanceOf(deployer)
   console.log(`Got ${formatUnits(wethBalance, 6)} WETH`)
}

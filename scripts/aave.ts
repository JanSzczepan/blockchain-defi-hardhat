import { ethers, getNamedAccounts, network } from 'hardhat'
import { getWeth } from './getWeth'
import { WETH_AMOUNT, networkConfig } from '../helper-hardhat-config'
import {
   AggregatorV3Interface,
   IERC20,
   ILendingPool,
   ILendingPoolAddressesProvider,
} from '../typechain-types'
import { Address } from 'hardhat-deploy/dist/types'
import { BigNumber } from 'ethers'
import formatUnits from '../utils/formatUnits'

type UserData = {
   availableBorrowsETH: BigNumber
   totalDebtETH: BigNumber
}

async function main() {
   await getWeth(WETH_AMOUNT)

   const { deployer } = await getNamedAccounts()
   const lendingPool: ILendingPool = await getLandingPool(deployer)
   const chainId = network.config.chainId!
   const wethAddress = networkConfig[chainId].wethToken!

   await approveErc20(
      wethAddress,
      deployer,
      lendingPool.address,
      WETH_AMOUNT,
      'WETH'
   )

   await deposit(lendingPool, wethAddress, WETH_AMOUNT, deployer, 0)

   const { availableBorrowsETH } = await getUserData(lendingPool, deployer)
   const daiPrice = await getDaiPrice(networkConfig[chainId].daiEthPriceFeed!)
   const availableBorrowDai = getAvailableBorrowDai(
      availableBorrowsETH,
      daiPrice
   ).toString()
   const daiTokenAddress = networkConfig[chainId].daiToken!

   await borrowDai(
      lendingPool,
      daiTokenAddress,
      availableBorrowDai,
      deployer,
      1,
      0
   )
   await getUserData(lendingPool, deployer)

   await approveErc20(
      daiTokenAddress,
      deployer,
      lendingPool.address,
      availableBorrowDai,
      'DAI'
   )
   await repay(lendingPool, daiTokenAddress, availableBorrowDai, deployer, 1)
   await getUserData(lendingPool, deployer)
}

async function repay(
   lendingPool: ILendingPool,
   assetAddress: string,
   amount: string,
   onBehalfOfAddress: string,
   interestRateMode: 1 | 2
) {
   console.log(`Repaying ${formatUnits(amount, 6)} DAI...`)
   const tx = await lendingPool.repay(
      assetAddress,
      amount,
      interestRateMode,
      onBehalfOfAddress
   )
   await tx.wait(1)
   console.log('DAI repaid!')
}

async function borrowDai(
   lendingPool: ILendingPool,
   assetAddress: string,
   amount: string,
   onBehalfOfAddress: string,
   interestRateMode: 1 | 2,
   referralCode: number
) {
   console.log(`Borrowing ${formatUnits(amount, 6)} DAI...`)
   const tx = await lendingPool.borrow(
      assetAddress,
      amount,
      interestRateMode,
      referralCode,
      onBehalfOfAddress
   )
   await tx.wait(1)
   console.log('DAI borrowed!')
}

function getAvailableBorrowDai(
   availableBorrowsETH: BigNumber,
   daiPrice: BigNumber
): BigNumber {
   const availableBorrowDai = availableBorrowsETH.div(daiPrice)
   const availableBorrowDaiWei = ethers.utils.parseEther(
      availableBorrowDai.toString()
   )

   console.log(`You can borrow ${availableBorrowDai.toString()} DAI`)
   return availableBorrowDaiWei
}

async function getDaiPrice(aggregatorV3Address: string): Promise<BigNumber> {
   console.log('Getting DAI/ETH price...')
   const aggregatorV3: AggregatorV3Interface = await ethers.getContractAt(
      'AggregatorV3Interface',
      aggregatorV3Address
   )
   const daiPrice = (await aggregatorV3.latestRoundData())[1]

   console.log(`The DAI/ETH price is ${formatUnits(daiPrice, 10)}`)
   return daiPrice
}

async function getUserData(
   lendingPool: ILendingPool,
   userAccount: Address
): Promise<UserData> {
   const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
      await lendingPool.getUserAccountData(userAccount)

   console.log(
      `You have ${formatUnits(totalCollateralETH, 6)} worth of ETH deposited.`
   )
   console.log(
      `You have ${formatUnits(totalDebtETH, 6)} worth of ETH borrowed.`
   )
   console.log(
      `You can borrow ${formatUnits(availableBorrowsETH, 6)} worth of ETH.`
   )

   return { availableBorrowsETH, totalDebtETH }
}

async function deposit(
   lendingPool: ILendingPool,
   assetAddress: string,
   amount: string,
   onBehalfOfAddress: string,
   referralCode: number
) {
   console.log('Depositing WETH...')
   await lendingPool.deposit(
      assetAddress,
      amount,
      onBehalfOfAddress,
      referralCode
   )
   console.log('Deposited!')
}

async function approveErc20(
   erc20Address: string,
   account: Address,
   spenderAddress: string,
   amount: string,
   tokenName?: string
) {
   console.log(
      `Approving ${spenderAddress} to spend ${formatUnits(amount, 6)} ${
         tokenName || 'ERC20'
      } tokens with address ${erc20Address}`
   )
   const iERC20: IERC20 = await ethers.getContractAt(
      'IERC20',
      erc20Address,
      account
   )
   const tx = await iERC20.approve(spenderAddress, amount)
   await tx.wait(1)
   console.log('Approved!')
}

async function getLandingPool(account: Address): Promise<ILendingPool> {
   console.log('Getting Lending Pool...')
   const lendingPoolAddressesProvider: ILendingPoolAddressesProvider =
      await ethers.getContractAt(
         'ILendingPoolAddressesProvider',
         networkConfig[network.config.chainId!].lendingPoolAddressesProvider!,
         account
      )
   const lendingPoolAddress =
      await lendingPoolAddressesProvider.getLendingPool()
   const lendingPool: ILendingPool = await ethers.getContractAt(
      'ILendingPool',
      lendingPoolAddress,
      account
   )

   console.log(`Got Landding Pool at ${lendingPoolAddress}`)
   return lendingPool
}

main()
   .then(() => process.exit(0))
   .catch((e) => {
      console.error(e)
      process.exit(1)
   })

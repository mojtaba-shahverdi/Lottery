const { assert, expect } = require('chai')
const { getNamedAccounts, network } = require('hardhat')
const { developmentChains } = require('../../helper-hardhat-config')

developmentChains.includes(network.name)
  ? describe.skip
  : describe('Lottery Staging Tests', () => {
      let lottery, lotteryEntranceFee, deployer

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        lottery = await ethers.getContract('Lottery', deployer)
        lotteryEntranceFee = await lottery.getEntranceFee()
      })

      describe('fulfillRandomWords', () => {
        it('works with live Chainlink Keepers and Chainlink VRF, we get a random winner', async () => {
          console.log('Setting up test...')
          const startingTimeStamp = await lottery.getLatestTimeStamp()
          const accounts = await ethers.getSigners()

          console.log('Setting up Listener...')
          await new Promise(async (resolve, reject) => {
            lottery.once('WinnerPicked', async () => {
              console.log('WinnerPicked!')
              try {
                const recentWinner = await lottery.getRecentWinner()
                const lotteryState = await lottery.getLotteryState()
                const winnerEndingBalance = await accounts[0].getBalance()
                const endingTimeStamp = await lottery.getLatestTimeStamp()

                await expect(lottery.getPlayer(0)).to.be.reverted
                assert.equal(recentWinner.toString(), accounts[0].address)
                assert.equal(lotteryState, 0)
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(lotteryEntranceFee).toString()
                )
                assert(endingTimeStamp > startingTimeStamp)
                resolve()
              } catch (error) {
                console.log(error)
                reject(error)
              }
            })
            console.log('Entering lottery...')
            const tx = await lottery.enterLottery({ value: lotteryEntranceFee })
            await tx.wait(1)
            console.log('Processing...')
            const winnerStartingBalance = await accounts[0].getBalance()
          })
        })
      })
    })

const { network, getNamedAccounts, deployments } = require('hardhat')
const { developmentChains, networkConfig } = require('../../helper-hardhat-config')
const { assert, expect } = require('chai')

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Lottery unit Tests', () => {
      let lottery, vrfCoordinatorV2Mock, lotteryEntranceFee, deployer, interval
      const chainId = network.config.chainId

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(['all'])
        lottery = await ethers.getContract('Lottery', deployer)
        vrfCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock', deployer)
        lotteryEntranceFee = await lottery.getEntranceFee()
        interval = await lottery.getInterval()
      })

      describe('constructor', () => {
        it('initializes the lottery correctly!', async () => {
          const lotteryState = await lottery.getLotteryState()
          assert.equal(lotteryState.toString(), '0')
          assert.equal(interval.toString(), networkConfig[chainId]['interval'])
        })
      })

      describe('enterLottery', () => {
        it("reverts when you don't pay enough", async () => {
          await expect(lottery.enterLottery()).to.be.revertedWithCustomError(
            lottery,
            'Lottery__NotEnoughETHEntered'
          )
        })
        it('records players when they enter', async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee })
          const playerFromContract = await lottery.getPlayer(0)
          assert.equal(playerFromContract, deployer)
        })
        it('emits event on enter', async () => {
          await expect(lottery.enterLottery({ value: lotteryEntranceFee })).to.emit(
            lottery,
            'LotteryEnter'
          )
        })
        it('doesnt allow entrace when lottery is calculating', async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee })
          await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
          await network.provider.send('evm_mine', [])
          await lottery.performUpkeep([])
          await expect(
            lottery.enterLottery({ value: lotteryEntranceFee })
          ).to.be.revertedWithCustomError(lottery, 'Lottery__NotOpen')
        })
      })
      describe('checkUpKeep', () => {
        it("returns false if people haven't sent any ETH", async () => {
          await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
          await network.provider.send('evm_mine', [])
          const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([])
          assert(!upkeepNeeded)
        })
        it("returns false if lottery isn't open", async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee })
          await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
          await network.provider.send('evm_mine', [])
          await lottery.performUpkeep([])
          const lotteryState = await lottery.getLotteryState()
          const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([])
          assert.equal(lotteryState.toString(), '1')
          assert.equal(upkeepNeeded, false)
        })
        it("returns false if enough time hasn't passed", async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee })
          await network.provider.send('evm_increaseTime', [interval.toNumber() - 5])
          await network.provider.request({ method: 'evm_mine', params: [] })
          const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([])
          assert(!upkeepNeeded)
        })
        it('returns true if enough time has passed, has players, eth, and is open', async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee })
          await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
          await network.provider.request({ method: 'evm_mine', params: [] })
          const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([])
          assert(upkeepNeeded)
        })
      })
      describe('performUpkeep', () => {
        it('can only run if checkupkeep is true', async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee })
          await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
          await network.provider.request({ method: 'evm_mine', params: [] })
          const tx = await lottery.performUpkeep([])
          assert(tx)
        })
        it('reverts if checkup is false', async () => {
          await expect(lottery.performUpkeep([])).to.be.revertedWithCustomError(
            lottery,
            'Lottery__UpKeepNotNeeded'
          )
        })
        it('updates the lottery state and emits a requestId', async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee })
          await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
          await network.provider.request({ method: 'evm_mine', params: [] })
          const txResponse = await lottery.performUpkeep([])
          const txReceipt = await txResponse.wait(1)
          const lotteryState = await lottery.getLotteryState()
          const requestId = txReceipt.events[1].args.requestId
          assert(requestId.toNumber() > 0)
          assert(lotteryState == 1)
        })
      })
      describe('fulfillRandomWords', () => {
        beforeEach(async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee })
          await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
          await network.provider.send('evm_mine', [])
        })
        it('can only be called after performUpkeep', async () => {
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(0, lottery.address)
          ).to.be.revertedWith('nonexistent request')
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(1, lottery.address)
          ).to.be.revertedWith('nonexistent request')
        })
        // it('picks a winner, resets the lottery, and sends the money', async () => {
        //   const additionalEntrants = 3
        //   const startingAccountIndex = 1
        //   const accounts = await ethers.getSigners()
        //   for (let i = startingAccountIndex; i < startingAccountIndex + additionalEntrants; i++) {
        //     const accountConnectedLottery = lottery.connect(accounts[i])
        //     await accountConnectedLottery.enterLottery({ value: lotteryEntranceFee })
        //   }
        //   const startingTimeStamp = await lottery.getLatestTimeStamp()

        //   await new Promise(async (resolve, reject) => {
        //     lottery.once('WinnerPicked', async () => {
        //       console.log('Picked the winner')
        //       try {
        //         const recentWinner = await lottery.getRecentWinner()
        //         const lotteryState = await lottery.getLotteryState()
        //         const endingTimeStamp = await lottery.getLatestTimeStamp()
        //         const numPlayers = await lottery.getNumberOfPlayers()
        //         const winnerEndingBalance = await accounts[1].getBalance()
        //         assert.equal(numPlayers.toString(), '0')
        //         assert.equal(lotteryState.toString, '0')
        //         assert(endingTimeStamp > startingTimeStamp)
        //         assert.equal(
        //           winnerEndingBalance.toString(),
        //           winnerStartingBalance.add(
        //             lotteryEntranceFee.mul(additionalEntrants).add(lotteryEntranceFee).toString()
        //           )
        //         )
        //       } catch (error) {
        //         reject(error)
        //       }
        //       resolve()
        //     })
        //     const tx = await lottery.performUpkeep([])
        //     const txReceipt = await tx.wait(1)
        //     const winnerStartingBalance = await accounts[1].getBalance()
        //     await vrfCoordinatorV2Mock.fulfillRandomWords(
        //       txReceipt.events[1].args.requestId,
        //       lottery.address
        //     )
        //   })
        // })
      })
    })

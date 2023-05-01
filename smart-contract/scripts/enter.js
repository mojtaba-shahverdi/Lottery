async function enterRaffle() {
  const lottery = await ethers.getContract('Lottery')
  const entranceFee = await lottery.getEntranceFee()
  await lottery.enterLottery({ value: entranceFee + 1 })
  console.log('Entered!')
}

enterRaffle()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

import React, { useEffect, useState } from 'react'
import { useMoralis, useWeb3Contract } from 'react-moralis'
import { abi, contractAddresses } from '../constants'
import { ethers } from 'ethers'
import { useNotification } from '@web3uikit/core'

const LotteryEntrance = () => {
  const [entranceFee, setEntranceFee] = useState('0')
  const [numPlayers, setNumPlayers] = useState('0')
  const [recentWinner, setRecentWinner] = useState('0')
  const [loading, setLoading] = useState(false)

  const { Moralis, chainId: chainIdHex, isWeb3Enabled } = useMoralis()
  const chainId = parseInt(chainIdHex)

  const lotteryAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null

  const dispatch = useNotification()

  const {
    runContractFunction: enterLottery,
    data: enterTxResponse,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi,
    contractAddress: lotteryAddress,
    functionName: 'enterLottery',
    msgValue: entranceFee,
    params: {},
  })

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi,
    contractAddress: lotteryAddress,
    functionName: 'getEntranceFee',
    params: {},
  })

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi,
    contractAddress: lotteryAddress,
    functionName: 'getNumberOfPlayers',
    params: {},
  })

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi,
    contractAddress: lotteryAddress,
    functionName: 'getRecentWinner',
    params: {},
  })

  const updateUI = async () => {
    const entranceFee = (await getEntranceFee()).toString()
    const numPlayers = (await getNumberOfPlayers()).toString()
    const recentWinner = await getRecentWinner()
    setEntranceFee(entranceFee)
    setNumPlayers(numPlayers)
    setRecentWinner(recentWinner)
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI()
    }
  }, [isWeb3Enabled])

  const handleNewNotification = () => {
    dispatch({
      type: 'success',
      message: 'Transaction Completed!',
      title: 'Tx Notification',
      position: 'topR',
    })
  }

  const enterLotteryFunc = async () => {
    await enterLottery({
      onSuccess: handleSuccess,
      onError: (error) => console.log(error),
    })
  }

  const handleSuccess = async (tx) => {
    setLoading(true)
    try {
      await tx.wait(1)
      updateUI()
      handleNewNotification(tx)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      dispatch({
        type: 'error',
        message: `Transaction Failed! ${error}`,
        title: 'Tx Notification',
        position: 'topR',
      })
    }
  }

  return (
    <div className="lg:w-2/3 sm:w-10/12 w-full ">
      {lotteryAddress ? (
        <>
          <div className="flex flex-col">
            <h1 className="w-full flex justify-between">
              <span>Entrace Fee: </span>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r to-purple-400 from-pink-600">
                {ethers.utils.formatUnits(entranceFee, 'ether')}
                <span className="text-xs text-black">ETH</span>
              </span>
            </h1>
            <div className="w-10/12 my-2 h-1 m-auto rounded-[100%] bg-slate-300" />
            <h1 className="w-full flex justify-between">
              <span>Number Of Players:</span>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r to-purple-400 from-pink-600">
                {numPlayers}
              </span>
            </h1>
            <div className="w-10/12 my-2 h-1 m-auto rounded-[100%] bg-slate-300" />
            <div className="relative">
              <h1 className="w-full flex justify-between">
                <span>Recent Winner:</span>

                <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r to-purple-400 from-pink-600">
                  {recentWinner.slice(0, 6)}...
                  {recentWinner.slice(-4)}
                </span>
              </h1>
            </div>
            <button
              onClick={enterLotteryFunc}
              disabled={isLoading || isFetching || loading}
              className={`bg-[#e2f0fd] font-semibold mt-5 rounded-lg shadow-md active:shadow-sm active:shadow-[#c1ddf6] active:scale-90 hover:bg-right transition transform duration-700 ease-in-out text-white ${
                isLoading || isFetching || loading
                  ? 'scale-90 opacity-70 bg-right'
                  : 'px-5 py-2'
              }`}
              style={{
                backgroundImage:
                  'linear-gradient(to right,#c084fc 0%,#bfe9ff 51%,#c084fc 100%)',
                backgroundSize: '200% auto',
                transition: '0.5s',
              }}
            >
              {isLoading || isFetching || loading ? (
                <div className="w-9 h-9 my-[2px] m-auto border-t-4 border-b-4 rounded-full animate-spin border-purple-600" />
              ) : (
                <div>Enter Lottery</div>
              )}
            </button>
          </div>
          {loading && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full flex flex-col items-center justify-center bg-black text-white bg-opacity-60 text-5xl select-none">
              <div className="w-20 h-20 my-[2px] m-auto border-t-4 border-b-4 rounded-full animate-spin border-white mb-5" />
              Waiting for 1 Block Confirmation...
            </div>
          )}
        </>
      ) : (
        <div>No Lottery Address Detected</div>
      )}
    </div>
  )
}

export default LotteryEntrance

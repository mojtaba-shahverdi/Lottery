import { ConnectButton } from '@web3uikit/web3'
import React from 'react'

const Header = () => {
  return (
    <div className="flex flex-col space-y-10 items-center">
      <h1 className="py-5 font-extrabold text-transparent text-8xl bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Web 3.0 Lottery
      </h1>
      <ConnectButton moralisAuth={false} />
    </div>
  )
}

export default Header

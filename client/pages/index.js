import React from 'react'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import Head from 'next/head'
import { Header, LotteryEntrance, ManualHeader } from '@/components'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-around p-24 ${inter.className}`}
    >
      <Head>
        <title>Decentralized Lottery App</title>
        <meta name="description" content="Smart Contract Lottery" />
        <link rel="icon" href="favicon.ico" />
      </Head>
      <Header />
      {/* <ManualHeader /> */}
      <LotteryEntrance />
    </main>
  )
}

import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
import { Inter } from 'next/font/google';

import Image from 'next/image'

const inter = Inter({
  subsets: ["latin"],
  weight: "400",
})

const CardBase= () => {
  return (
  <div className="{`${inter.className} flex flex-col gap-4 border-4 border-blue-200 shadow-lg p-4 bg-white rounded-md transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:rotate-2">
    <Image src="/summer/frame-blue.png" alt={""} width={200} height={200}       
    />
    <h3 className="text-black text-center typewriter">OnChain Summer</h3>
    <Link href={'/onchain-summer'}>
      <Button variant={'primary'}>Let's Play</Button>
    </Link>
  </div>
  )
}

export default CardBase

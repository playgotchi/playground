import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
import { Inter } from 'next/font/google';

import Image from 'next/image'

const CardBase= () => {
  return (
  <div className="flex flex-col gap-4 border-4 border-b-8 border-blue-500 shadow-lg p-4 bg-white rounded-md transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:rotate-2 min-w-56">
    <Image src="/summer/bald-jesse.png" alt={"Onchain Summer"} width={200} height={200}       
    />
    <h3 className="text-teal-900 text-center typewriter font-bold">OnChain Summer</h3>
    <Link href={'/onchain-summer'}>
      <Button variant={'secondary'}>Let's Play</Button>
    </Link>
  </div>
  )
}

export default CardBase

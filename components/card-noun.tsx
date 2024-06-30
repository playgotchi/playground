import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
import { Londrina_Solid } from 'next/font/google';

import Image from 'next/image'

const nouns = Londrina_Solid({
  subsets: ["latin"],
  weight: "400",
})

const CardNoun= () => {
  return (
    <div className="{`${nouns.className} flex flex-col gap-4 border-4 border-yellow-200 shadow-lg p-4 bg-white rounded-md transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:rotate-2">
    <Image src="/summer/frame-yellow.png" alt={""} width={200} height={200}       
    />
    <h3 className="text-black text-center typewriter">Yellow Collective</h3>
    <Link href={'/nouns'}>
      <Button variant={'primary'}>Let's Play</Button>
    </Link>
  </div>
  )
}

export default CardNoun
import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
import { Inter } from 'next/font/google';

import Image from 'next/image'

const inter = Inter({
  subsets: ["latin"],
  weight: "400",
})

const CardPlaygotchi= () => {
  return (
    <div className="flex flex-col max-w-[360px] relative  gap-4 border-4 border-b-8 border-[#4FFF14] shadow-lg p-4 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:rotate-2 min-w-56">
      <Image src="/playgotchi-playground.png" alt={"Kai"} width={200} height={200}       
      />
      <div className="w-[200px] bg-[#4FFF14] h-[10px] top-0 mt-[-8px] absolute"/>
      <h3 className="text-primary typewriter font-bold">Playgotchi</h3>
      <Link href={'/playgotchi'}>
        <Button variant={'secondary'}>Let's Play</Button>
      </Link>
  </div>
  )
}

export default CardPlaygotchi
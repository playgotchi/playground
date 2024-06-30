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
    <div className="flex flex-col gap-4 border-4 border-b-8 border-[#4FFF14] shadow-lg p-4 bg-white rounded-md transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:rotate-2 min-w-56">
      <Image src="/playgotchi/kai.png" alt={"Kai"} width={200} height={200}       
      />
      <h3 className="text-teal-900 text-center typewriter font-bold">Playgotchi</h3>
      <Link href={'/playgotchi'}>
        <Button variant={'secondary'}>Let's Play</Button>
      </Link>
  </div>
  )
}

export default CardPlaygotchi
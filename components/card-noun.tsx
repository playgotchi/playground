import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'

import Image from 'next/image'

const CardNoun= () => {
  return (
    <div className="flex flex-col max-w-[360px] relative gap-4  border-4 border-b-8 border-yellow-500 shadow-lg p-4  transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:rotate-2 min-w-56">
    <Image src="/yellow-collective.png"  alt={"Yellow Collective"} width={200} height={200}       
    />
    <div className="w-[200px] bg-yellow-500 h-[10px] top-0 mt-[-8px] absolute"/>
    <h3 className="text-foreground text-center typewriter font-bold">Yellow Collective</h3>
    <Link href={'/nouns'}>
      <Button variant={'secondary'}>Let's Play</Button>
    </Link>
  </div>
  )
}

export default CardNoun
import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'

import Image from 'next/image'

const CardNoun= () => {
  return (
    <div className="flex flex-col gap-4 border-4 border-b-8 border-yellow-500 shadow-lg p-4 bg-white rounded-md transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:rotate-2 min-w-56">
    <Image src="/summer/frame-yellow.png"  alt={"Yellow Collective"} width={200} height={200}       
    />
    <h3 className="text-black text-center typewriter">Yellow Collective</h3>
    <Link href={'/nouns'}>
      <Button variant={'secondary'}>Let's Play</Button>
    </Link>
  </div>
  )
}

export default CardNoun
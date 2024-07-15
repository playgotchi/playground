import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { Github } from 'lucide-react'
import { Button } from './ui/button'

const SocialsLinks = () => {
  return (
    <ul className='flex items-center gap-4'>
      <li className='hover:opacity-60'>
        <Link href={'https://github.com/playgotchi/playground'} target="_blank" rel="noopener noreferrer" className='hover:cursor-py-cursor-hover'>
          <Button variant={'social'} size="icon">
            <Github/>
          </Button>
        </Link>
      </li>
      <li className='hover:opacity-60'>
        <Link href={'https://warpcast.com/playgotchi'} target="_blank" rel="noopener noreferrer" className='hover:cursor-py-cursor-hover'>
          <Button variant={'social'} size="icon">
            <Image src={'/farcaster.png'} width={24} height={24} alt='warpcast' />
          </Button>
        </Link>
      </li>
      <li className='hover:opacity-60'>
        <Link href={'https://hey.xyz/u/playgotchi'} target="_blank" rel="noopener noreferrer" className='hover:cursor-py-cursor-hover'>
         <Button variant="social" size="icon">
            <Image src={'/hey.png'} width={24} height={24} alt='hey' />
         </Button>
        </Link>
      </li>
      <li className='hover:opacity-60'>
        <Link href={'https://playgotchi.com'} target="_blank" rel="noopener noreferrer" className='hover:cursor-py-cursor-hover'>
        <Button variant="social" size="icon">
          <Image src={'/monomark.png'} width={24} height={24} alt='playgotchi' />
         </Button>
        </Link>
      </li>
      
    </ul>
  )
}

export default SocialsLinks

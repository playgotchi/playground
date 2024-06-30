import Link from 'next/link'
import React from 'react'
import Image from 'next/image'

const SocialsLinks = () => {
  return (
    <ul className='flex items-center gap-4'>
      <li className='hover:opacity-60'>
        <Link href={'https://warpcast.com/playgotchi'} target="_blank" rel="noopener noreferrer" className='hover:cursor-py-cursor-hover'>
          <Image src={'/farcaster.png'} width={24} height={24} alt='warpcast' />
        </Link>
      </li>
      <li className='hover:opacity-60'>
        <Link href={'https://hey.xyz/u/playgotchi'} target="_blank" rel="noopener noreferrer" className='hover:cursor-py-cursor-hover'>
          <Image src={'/hey.png'} width={24} height={24} alt='warpcast' className='grayscale'/>
        </Link>
      </li>
      <li className='hover:opacity-60'>
        <Link href={'https://playgotchi.com'} target="_blank" rel="noopener noreferrer" className='hover:cursor-py-cursor-hover'>
          <Image src={'/monomark.png'} width={24} height={24} alt='warpcast' />
        </Link>
      </li>
      
    </ul>
  )
}

export default SocialsLinks

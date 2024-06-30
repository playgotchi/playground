import React from 'react'

import CanvasComponent from '../../components/canvas';
import { Room } from '../../components/Room';
import LogInWrapper from '@/components/isLoggedIn-wrapper';

const NounPage = () => {
  return (
    <LogInWrapper>
      <Room roomId='nouns' fallback={null}>
        <CanvasComponent roomId='nouns' />
      </Room>
    </LogInWrapper>
  )
}

export default NounPage

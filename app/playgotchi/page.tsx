import React from 'react'

import CanvasComponent from '../../components/canvas';
import { Room } from '../../components/Room';
import LogInWrapper from '@/components/isLoggedIn-wrapper';

const onChainSummerPage = () => {
  return (
    <LogInWrapper>
      <Room roomId='playgotchi' fallback={null}>
        <CanvasComponent roomId='playgotchi' />
      </Room>
    </LogInWrapper>
  )
}

export default onChainSummerPage;
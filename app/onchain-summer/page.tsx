import React from 'react'

import CanvasComponent from '../../components/canvas';
import { Room } from '../../components/Room';
import LogInWrapper from '@/components/isLoggedIn-wrapper';

const onChainSummerPage = () => {
  return (
    <LogInWrapper>
      <Room roomId='summer' fallback={null}>
        <CanvasComponent />
      </Room>
    </LogInWrapper>
  )
}

export default onChainSummerPage;
"use client";
import { useIsLoggedIn } from '@/lib/dynamic';
import { useRouter } from 'next/navigation';
import React, { ReactNode, useEffect } from 'react'
import Loader from './Loader';

interface LogInWrapperProps {
  children: ReactNode; 
}

const LogInWrapper = ({children}:LogInWrapperProps) => {

  const isLoggedIn = useIsLoggedIn();
  const router = useRouter();
  

  useEffect(() => {
    // Redirect to homepage if user is not logged in
    if (!isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn]);

  return (
    <>
    {isLoggedIn ? (
      <>
        {children}
      </>
    ) : (
      <Loader/>
    )}
  </>
  )
}

export default LogInWrapper

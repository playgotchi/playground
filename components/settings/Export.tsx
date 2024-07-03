import { Button } from "@/components/ui/button";
import React from 'react';
import { useMintToken } from '../mintToken';

const MintButton: React.FC = () => {
  const { mintToken, isMinting, isPending, isSuccess, isError, error } = useMintToken();

  const handleMint = () => {
    mintToken('whiteboard-element-id'); 
  };

  return (
    <div className='flex flex-col gap-3 px-5 py-3'>
      <h3 className='text-[10px] uppercase'>Mint</h3>
      <Button 
        variant='primary'
        className='w-full'
        onClick={handleMint}
        disabled={isMinting || isPending}
      >
        {isMinting || isPending ? 'Minting...' : 'Mint'}
      </Button>
      {isSuccess && <p className="text-green-500 mt-2">Token minted successfully!</p>}
      {isError && <p className="text-red-500 mt-2">Error: {error}</p>}
    </div>
  );
};

export default MintButton;
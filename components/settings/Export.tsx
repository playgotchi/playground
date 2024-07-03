import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from 'react';
import { useMintToken } from '../mintToken';

const MintButton: React.FC = () => {
  const { mintToken, isMinting, isPending, isSuccess, isError, error } = useMintToken();
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const element = document.getElementById('main') as HTMLCanvasElement;
    setCanvasElement(element);
  }, []);

  const handleMint = async () => {
    if (!canvasElement) {
      console.error('Canvas element not found!');
      return;
    }

    try {
      await mintToken(canvasElement.id);  // Use the canvas element's ID
    } catch (error) {
      console.error('Error minting token:', error);
    }
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

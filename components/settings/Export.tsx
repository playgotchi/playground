import { Button } from "@/components/ui/button";
import React from 'react';
import { useMintToken } from '../mintToken';
import { useAccount } from 'wagmi';
import { base } from 'wagmi/chains';

const MintButton: React.FC = () => {
  const { mintToken, isMinting, isPending, isSuccess, isError, error, mintingStep } = useMintToken();
  const { isConnected, chain } = useAccount();

  const handleMint = async () => {
    try {
      await mintToken('main'); // Pass the ID as a string
    } catch (err) {
      console.error('Minting failed:', err);
    }
  };

  const isCorrectNetwork = chain?.id === base.id;
  const canMint = isConnected && isCorrectNetwork && !isMinting && !isPending;

  return (
    <div className='flex flex-col gap-3 px-5 py-3'>
      <h3 className='text-[10px] uppercase'>Mint</h3>
      <Button
        variant='primary'
        className='w-full'
        onClick={handleMint}
        disabled={!canMint}
      >
        {isMinting || isPending ? mintingStep || 'Minting...' : 'Mint'}
      </Button>
      {!isConnected && <p className="text-yellow-500 mt-2">Please connect your wallet</p>}
      {isConnected && !isCorrectNetwork && <p className="text-yellow-500 mt-2">Please switch to Base network</p>}
      {isSuccess && <p className="text-green-500 mt-2">Token minted successfully!</p>}
      {isError && <p className="text-red-500 mt-2">Error: {error}</p>}
    </div>
  );
};

export default MintButton;
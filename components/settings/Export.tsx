import { Button } from "@/components/ui/button";
import React from 'react';
import { useMintToken } from '../mintToken';

const MintButton: React.FC = () => {
  const { mintToken, isMinting, isPending, isSuccess, isError, error } = useMintToken();

  const handleMint = () => {
    const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;

    if (canvasElement) {
      canvasElement.toBlob((blob: Blob | null) => {
        if (blob) {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64Data = reader.result as string; // Type assertion
            if (base64Data) {
              try {
                mintToken(base64Data);
              } catch (error) {
                console.error('Error minting token:', error);
                // Handle minting error (e.g., display error message to user)
              }
            } else {
              console.error('No data to mint from canvas element');
              // Handle case where there's no data to mint (optional)
            }
          };
          reader.onerror = (error) => {
            console.error('Error reading canvas data:', error);
            // Handle error reading canvas data (optional)
          };
        } else {
          console.error('Canvas element did not return Blob data');
          // Handle case where canvas data is not available (optional)
        }
      }, 'image/png');
    } else {
      console.error('Canvas element not found');
      // Handle case where canvas element is not found (optional)
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

"use client";

import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSignMessage } from 'wagmi';
import { BaseError, Address } from "viem";
import { useSimulateContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { zoraNftCreatorV1Config } from "@zoralabs/zora-721-contracts";
import { base } from 'wagmi/chains';
import html2canvas from 'html2canvas';

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

const captureWhiteboard = async (elementId: string): Promise<Blob | null> => {
  const whiteboardElement = document.querySelector('main');
  if (!whiteboardElement) {
    throw new Error('Whiteboard element not found');
  }

  const canvas = await html2canvas(whiteboardElement);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        resolve(null);
      }
    }, 'image/png');
  });
};

const uploadToIPFS = async (blob: Blob): Promise<string> => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise((resolve, reject) => {
    reader.onloadend = async () => {
      const base64data = typeof reader.result === 'string' ? reader.result.split(',')[1] : '';
      try {
        const response = await fetch('/api/upload-to-ipfs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: base64data, filename: 'playground.png' }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { ipfsHash } = await response.json();
        console.log('IPFS Upload Response:', ipfsHash);

        resolve(ipfsHash);
      } catch (error) {
        console.error('Error in IPFS upload:', error);
        reject(error);
      }
    };
  });
};

const createMetadata = (imageHash: string) => ({
  name: "Playground Capture",
  description: "Made with Playground by Playgotchi (https://playground.playgotchi.com/)",
  image: `ipfs://${imageHash}` });

export const useMintToken = () => {
  const { address } = useAccount();
  const chainId = useChainId();

  const [isMinting, setIsMinting] = useState(false);
  const [metadataUri, setMetadataUri] = useState<string | null>(null);
  const [mintingStep, setMintingStep] = useState<string>('');
  const { signMessage } = useSignMessage(); 

  const { data: simulateData, error: simulateError } = useSimulateContract({
    address: zoraNftCreatorV1Config.address[base.id] as Address,
    abi: zoraNftCreatorV1Config.abi,
    functionName: "createEditionWithReferral",
    args: [
      "Playground Pic", // name
      "PP", // symbol
      BigInt(1), // editionSize
      3, // royaltyBPS
      address!, // fundsRecipient
      address!, // defaultAdmin
      {
        publicSalePrice: BigInt(0),
        maxSalePurchasePerAddress: 1,
        publicSaleStart: BigInt(0),
        publicSaleEnd: BigInt("0xFFFFFFFFFFFFFFFF"),
        presaleStart: BigInt(0),
        presaleEnd: BigInt(0),
        presaleMerkleRoot: "0x0000000000000000000000000000000000000000000000000000000000000000"
      },
      "Made with Playground by Playgotchi (https://playground.playgotchi.com/)", // description
      "", // animationURL or URI
      address!, // owner
      "0x124F3eB5540BfF243c2B57504e0801E02696920E", // createReferral
    ],
  });

  const { writeContract, data: writeData, error: writeError, isPending: isWritePending } = useWriteContract();

  const { isLoading: isWaitLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  const mintToken = async (elementId: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (chainId !== base.id) {
      throw new Error('Please switch to Base network');
    }

    setIsMinting(true);
    setMintingStep('Capturing canvas...');

    try {
      const blob = await captureWhiteboard('main');
      if (!blob) throw new Error('Failed to capture whiteboard');
      console.log("Blob size:", blob.size);


      setMintingStep('Uploading image to IPFS...');
      const imageHash = await uploadToIPFS(blob);
      console.log(`Pinned image to IPFS: ${imageHash}`);

      if (!imageHash) {
        throw new Error('Failed to upload image to IPFS');
      }

      setMintingStep('Creating metadata...');
      const metadata = createMetadata(imageHash);
      const metadataContent = JSON.stringify(metadata);
      const metadataBlob = new Blob([metadataContent], { type: 'application/json' });
      const metadataHash = await uploadToIPFS(metadataBlob);
      console.log(`Pinned metadata to IPFS: ${metadataHash}`);

      setMetadataUri(`ipfs://${metadataHash}`);

      setMintingStep('Signing confirmation message...');
      const signatureMessage = `Confirm minting of Playground NFT ${metadataHash}`;
      await signMessage({ message: signatureMessage });

      setMintingStep('Interacting with smart contract...');
        if (simulateData?.request) {
          setMintingStep('Minting NFT...');
          await writeContract(simulateData.request);
        } else {
          throw new Error('Failed to interact with smart contract ');
        }
      console.log(`IPFS Image URL: https://gateway.pinata.cloud/ipfs/${imageHash}`);
    } catch (error) {
      console.error('Error minting token:', error);
      throw error;
    } finally {
      setIsMinting(false);
    }
  };

  return { 
    mintToken, 
    isMinting, 
    isPending: isWritePending || isWaitLoading, 
    isSuccess, 
    isError: !!simulateError || !!writeError, 
    error: (writeError as BaseError)?.shortMessage || (simulateError as BaseError)?.shortMessage,
    mintingStep
  };
};

const MintToken: React.FC = () => {
  const [whiteboardImage, setWhiteboardImage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const { 
    mintToken, 
    isMinting, 
    isPending, 
    isSuccess, 
    isError, 
    error,
    mintingStep
  } = useMintToken();

  const handleMint = async () => {
    if (!isConnected || !address) {
      setErrorMessage('Please connect your wallet first');
      return;
    }
  
    if (chainId !== base.id) {
      setErrorMessage('Please switch to Base network');
      return;
    }
  
    try {
      await mintToken('canvas');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const handleCaptureWhiteboard = async () => {
    try {
      const blob = await captureWhiteboard('whiteboard');
      if (blob) {
        setWhiteboardImage(URL.createObjectURL(blob));
      }
    } catch (error) {
      console.error('Error capturing whiteboard:', error);
      setErrorMessage('Failed to capture whiteboard');
    }
  };

  useEffect(() => {
    if (isError && error) {
      setErrorMessage(error);
    }
  }, [isError, error]);

  return (
    <div className="mint-nft-container">
      <h2>Mint Your Playground NFT</h2>
      {isConnected ? (
        <div className="wallet-info">
          <p>Connected address: {address}</p>
          <p>Network: {chainId === base.id ? 'Base' : 'Wrong Network'}</p>
          <button onClick={() => disconnect()} className="disconnect-button">Disconnect</button>
        </div>
      ) : (
        <button 
          onClick={() => {
            const connector = connectors[0];
            if (connector) connect({ connector });
            else setErrorMessage('No connector available');
          }} 
          disabled={isConnecting}
          className="connect-button"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}

<button onClick={handleCaptureWhiteboard} className="capture-button">Capture Whiteboard</button>

      {whiteboardImage && (
        <div className="preview">
          <h3>Preview</h3>
          <img src={whiteboardImage} alt="Whiteboard Capture" style={{ maxWidth: '100%' }} />
        </div>
      )}

      <button 
        onClick={handleMint} 
        disabled={!isConnected || isMinting || isPending || chainId !== base.id}
        className="mint-button"
      >
        {isMinting ? mintingStep : 'Mint NFT'}
      </button>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {isSuccess && (
        <div className="success-message">
          <p>NFT minted successfully!</p>
        </div>
      )}
    </div>
  );
};

export default MintToken;

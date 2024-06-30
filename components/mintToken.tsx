"use client"
import { BaseError, Address } from "viem";
import html2canvas from 'html2canvas';
import pinataSDK from '@pinata/sdk';
import { 
  useAccount, 
  useChainId,
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt
} from 'wagmi';
import { useState, useCallback } from 'react';
import { zoraNftCreatorV1Config } from "@zoralabs/zora-721-contracts";

const tokenAddress = "0xa2fea3537915dc6c7c7a97a82d1236041e6feb2e";

const pinata = new pinataSDK('YOUR_PINATA_API_KEY', 'YOUR_PINATA_API_SECRET');

const captureWhiteboard = async (elementId: string): Promise<Blob | null> => {
  const whiteboardElement = document.getElementById(elementId);
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

const uploadToIPFS = async (imageBlob: Blob): Promise<string> => {
  const reader = new FileReader();
  reader.readAsDataURL(imageBlob);
  return new Promise((resolve, reject) => {
    reader.onloadend = async () => {
      const base64data = typeof reader.result === 'string' ? reader.result.split(',')[1] : '';
      try {
        const response = await fetch('/api/upload-to-ipfs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: base64data, filename: 'whiteboard.png' }),
        });
        const { ipfsHash } = await response.json();
        resolve(ipfsHash);
      } catch (error) {
        reject(error);
      }
    };
  });
};

const createMetadata = (imageHash: string) => ({
  name: "Whiteboard Capture",
  description: "A captured whiteboard session",
  image: `ipfs://${imageHash}`
});

export const useMintToken = () => {
  const { address } = useAccount();
  const chainId = useChainId();

  const [isMinting, setIsMinting] = useState(false);
  const [metadataUri, setMetadataUri] = useState<string | null>(null);

  const simulateResult = useSimulateContract({
    address: zoraNftCreatorV1Config.address[chainId as keyof typeof zoraNftCreatorV1Config.address] as Address,
    abi: zoraNftCreatorV1Config.abi,
    functionName: "createDropWithReferral",
    args: metadataUri ? [
      "Playgotchi Playground Board", // contractName
      "PPB", // symbol
      address!, // defaultAdmin
      BigInt(1), // editionSize
      0, // royaltyBps
      address!, // fundsRecipient
      {
        maxSalePurchasePerAddress: 4294967295,
        presaleEnd: BigInt(0),
        presaleStart: BigInt(0),
        presaleMerkleRoot: "0x0000000000000000000000000000000000000000000000000000000000000000",
        publicSaleEnd: BigInt("0xFFFFFFFFFFFFFFFF"),
        publicSalePrice: BigInt(0),
        publicSaleStart: BigInt(0),
      },
      "A captured Playgotchi Playground Board session", // description
      metadataUri, // imageUri
      "0x124F3eB5540BfF243c2B57504e0801E02696920E", // createReferral
    ] : undefined,
  });

  const { writeContract, data: writeData, error: writeError, isPending: isWritePending } = useWriteContract();

  const { isLoading: isWaitLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  const mintToken = useCallback(async (elementId: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsMinting(true);

    try {
      const blob = await captureWhiteboard(elementId);
      if (!blob) throw new Error('Failed to capture whiteboard');

      const imageHash = await uploadToIPFS(blob);
      console.log(`Pinned image to IPFS: ${imageHash}`);

      const metadata = createMetadata(imageHash);
      const metadataContent = JSON.stringify(metadata);
      const metadataBlob = new Blob([metadataContent], { type: 'application/json' });
      const metadataHash = await uploadToIPFS(metadataBlob);
      console.log(`Pinned metadata to IPFS: ${metadataHash}`);

      setMetadataUri(`ipfs://${metadataHash}`);

      if (simulateResult.data?.request) {
        await writeContract(simulateResult.data.request);
      } else {
        throw new Error('Failed to simulate contract interaction');
      }
    } catch (error) {
      console.error('Error minting token:', error);
    } finally {
      setIsMinting(false);
    }
  }, [address, simulateResult.data, writeContract]);

  return { 
    mintToken, 
    isMinting, 
    isPending: isWritePending || isWaitLoading, 
    isSuccess, 
    isError: !!simulateResult.error || !!writeError, 
    error: (writeError as BaseError)?.shortMessage || (simulateResult.error as BaseError)?.shortMessage 
  };
};

export default useMintToken;
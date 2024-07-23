"use client"

import React, { useRef, useState, useEffect } from 'react';
import { fabric } from "fabric";
import { useMutation, useRedo, useStorage, useUndo } from "@liveblocks/react/suspense";
import { handleCanvaseMouseMove, handleCanvasMouseDown, handleCanvasMouseUp, handleCanvasObjectModified, handleCanvasObjectMoving, handleCanvasObjectScaling, handleCanvasSelectionCreated, handleCanvasZoom, handlePathCreated, handleResize, initializeFabric, renderCanvas } from "@/lib/canvas";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import { handleImageUpload } from "@/lib/shapes";
import { defaultNavElement } from "@/constants";
import { ActiveElement, Attributes } from "@/types/type";
import { useAccount, useChainId, usePublicClient } from 'wagmi';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import RightSidebar from "@/components/RightSidebar";
import { parseEther } from 'viem';
import { ZoraAbi } from '@/lib/zoraABI';
import { zoraNftCreatorV1Config } from '@zoralabs/zora-721-contracts';
import { base } from 'wagmi/chains';



const CanvasComponent = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const isDrawing = useRef(false);
    const shapeRef = useRef<fabric.Object | null>(null);
    const selectedShapeRef = useRef<string | null>(null);
    const activeObjectRef = useRef<fabric.Object | null>(null);
    const isEditingRef = useRef(false);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const [activeElement, setActiveElement] = useState<ActiveElement>({ name: "", value: "", icon: "" });
    const [elementAttributes, setElementAttributes] = useState<Attributes>({
        width: "",
        height: "",
        fontSize: "",
        fontFamily: "",
        fontWeight: "",
        fill: "#aabbcc",
        stroke: "#aabbcc",
    });

    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    const [mintingStep, setMintingStep] = useState('');
    const [mintingError, setMintingError] = useState<string | null>(null);
    const [mintingSuccess, setMintingSuccess] = useState(false);
    const [mintData, setMintData] = useState<string | null>(null);
    const [tokenId, setTokenId] = useState<bigint | null>(null);



    const undo = useUndo();
    const redo = useRedo();
    const canvasObjects = useStorage((root) => root.canvasObjects);




    const deleteShapeFromStorage = useMutation(({ storage }, shapeId) => {
        const canvasObjects = storage.get("canvasObjects");
        canvasObjects.delete(shapeId);
    }, []);

    const deleteAllShapes = useMutation(({ storage }) => {
        const canvasObjects = storage.get("canvasObjects");
        if (!canvasObjects || canvasObjects.size === 0) return true;
        return canvasObjects.size === 0;
    }, []);

    const syncShapeInStorage = useMutation(({ storage }, object) => {
        if(!object) return;
        const { objectId } = object
        const shapeData = object.toJSON();
        shapeData.objectId = objectId;

        const canvasObjects = storage.get("canvasObjects");
        canvasObjects.set(objectId, shapeData);
    }, []);

    const handleActiveElement = (elem: ActiveElement) => {
        setActiveElement(elem);

        switch (elem?.value) {
            case "reset":
                deleteAllShapes();
                fabricRef.current?.clear();
                setActiveElement(defaultNavElement);
                break;
            case "delete":
                handleDelete(fabricRef.current as any, deleteShapeFromStorage);
                setActiveElement(defaultNavElement);
                break;
            case "image":
                imageInputRef.current?.click();
                isDrawing.current = false;
                if (fabricRef.current) {
                    fabricRef.current.isDrawingMode = false;
                }
                break;
            default:
                selectedShapeRef.current = elem?.value as string;
                break;
        }
    };

    const captureWhiteboard = async (aspectRatio: number = 1.91): Promise<string> => {
        if (!fabricRef.current) throw new Error('Canvas not initialized');

        try {
            const canvas = fabricRef.current;
            const originalWidth = canvas.getWidth();
            const originalHeight = canvas.getHeight();

            let newWidth, newHeight;
            if (originalWidth / originalHeight > aspectRatio) {
                newHeight = originalHeight;
                newWidth = newHeight * aspectRatio;
            } else {
                newWidth = originalWidth;
                newHeight = newWidth / aspectRatio;
            }

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = newWidth;
            tempCanvas.height = newHeight;

            const ctx = tempCanvas.getContext('2d');
            if (!ctx) throw new Error('Failed to get 2D context');

            ctx.fillStyle = '#020817';
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            canvas.renderAll();
            const fabricCanvas = canvas.getElement();

            const scale = Math.min(newWidth / originalWidth, newHeight / originalHeight);
            const x = (newWidth - originalWidth * scale) / 2;
            const y = (newHeight - originalHeight * scale) / 2;

            ctx.drawImage(fabricCanvas, x, y, originalWidth * scale, originalHeight * scale);

            return tempCanvas.toDataURL('image/png');
        } catch (error) {
            console.error('Failed to capture whiteboard:', error);
            throw error;
        }
    };

    const handleCapture = async () => {
        setIsExporting(true);
        try {
            const imageDataUrl = await captureWhiteboard();
            setCapturedImage(imageDataUrl);
        } catch (error) {
            console.error('Failed to capture whiteboard:', error);
            alert('Failed to capture whiteboard. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const exportWhiteboard = async () => {
        setIsExporting(true);
        try {
            const imageDataUrl = await captureWhiteboard();

            const link = document.createElement('a');
            link.href = imageDataUrl;
            link.download = 'playground-export.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to export whiteboard:', error);
            alert('Failed to export whiteboard. Please try again.');
        } finally {
            setIsExporting(false);
        }
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
              const { ipfsHash } = await response.json();
              resolve(ipfsHash);
            } catch (error) {
              reject(error);
            }
          };
        });
      };

    const [deployedContractAddress, setDeployedContractAddress] = useState<string | null>(null);

    const { writeContractAsync } = useWriteContract();
    const { isLoading: isWaitingForTransaction, isSuccess: transactionSuccess } = useWaitForTransactionReceipt({
        hash: mintData ? (mintData as `0x${string}`) : undefined,
      });

      const chainId = useChainId();
      const publicClient = usePublicClient()!;
      const { address } = useAccount();


      const createMetadata = (imageHash: string) => ({
        name: "Playground Capture",
        description: "A captured Playground session",
        image: `ipfs://${imageHash}`
    });

      const handleMint = async () => {
        setIsMinting(true);
        setMintingError(null);
        setMintingSuccess(false);
        setMintingStep('Capturing image');
    
        try {
            console.log("Capturing whiteboard");
          const imageDataUrl = await captureWhiteboard();
    
          console.log("Uploading to IPFS");
          setMintingStep('Uploading to IPFS');
            // Capture and upload image
            const blob = await (await fetch(imageDataUrl)).blob();
            const imageHash = await uploadToIPFS(blob);
    
            // Create and upload metadata
            const metadata = createMetadata(imageHash);
            const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
            const metadataHash = await uploadToIPFS(metadataBlob);
            console.log(`Pinned image to IPFS: ${imageHash}`);
            console.log(`Pinned image to IPFS: ${metadataHash}`);

          setMintingStep('Creating metadata...');
        

          console.log("Preparing to deploy Contract");

          setMintingStep('Deploying contract');
          const deployConfig = {
            address: zoraNftCreatorV1Config.address[base.id], 
            abi: ZoraAbi,
            functionName: 'createDropWithReferral' as const, // Define as literal type
            args: [
                "Playground Pic", // Edition name
                "PP", // Edition reference code
                address as `0x${string}`, // Default admin
                BigInt(1), // Edition size (1 for a single mint)
                3, // Royalty BPS (changed to number)
                address as `0x${string}`, // Funds recipient address
                {
                  publicSalePrice: BigInt(0),
                  maxSalePurchasePerAddress: 1,
                  publicSaleStart: BigInt(0),
                  publicSaleEnd: BigInt("0xFFFFFFFFFFFFFFFF"),
                  presaleStart: BigInt(0),
                  presaleEnd: BigInt(0),
                  presaleMerkleRoot: "0x0000000000000000000000000000000000000000000000000000000000000000"
                },
                `ipfs://${metadataHash}`, // Pass the metadata IPFS hash here
                "", // animation URI (optional, replace with "" if not used)
                "0x124F3eB5540BfF243c2B57504e0801E02696920E" as `0x${string}`, // Referral address
              ] as const,
              maxFeePerBlobGas: BigInt(0), // Placeholder value, replace as needed
              blobs: [], // Placeholder value, replace as needed
          
          };
    
          const deployHash = await writeContractAsync(deployConfig);
      
          if (deployHash) {
            const deployReceipt = await publicClient.waitForTransactionReceipt({ hash: deployHash });
            if (deployReceipt.contractAddress) {
              const contractAddress = deployReceipt.contractAddress;
              setDeployedContractAddress(contractAddress);

              console.log(contractAddress);

    
              setMintingStep('Minting NFT');
              // Prepare the mintWithRewards transaction 
              const quantity = 1n;
              const mintReferral = "0x124F3eB5540BfF243c2B57504e0801E02696920E"; // Replace with your referral address
              const minterArguments = "0x"; // Empty bytes for no additional arguments
      
              const mintConfig = {
                address: contractAddress,
                abi: ZoraAbi,
                functionName: 'mintWithRewards',
                args: [address, quantity, minterArguments, mintReferral],
                value: parseEther("0.000777"),
              } as any;  // Add 'as any' to bypass the TypeScript type check
    
              const mintHash = await writeContractAsync(mintConfig);
              if (mintHash) {
                setMintData(mintHash);
              } else {
                throw new Error("Failed to get transaction hash for minting");
              }
            }
          } else {
            throw new Error("Failed to get transaction hash from contract deployment");
          }
    
          setMintingStep('Waiting for transaction confirmation');
        } catch (error) {
          console.error("Error while minting:", error);
          setMintingError(error instanceof Error ? error.message : String(error));
        } finally {
          setIsMinting(false);
        }


      useEffect(() => {
        if (transactionSuccess) {
          setMintingSuccess(true);
          setMintingStep('NFT minted successfully!');
        }
      }, [transactionSuccess]);
      
    };

    

    useEffect(() => {
        const canvas = initializeFabric({ canvasRef, fabricRef });

        canvas.on("mouse:down", (options) => {
            handleCanvasMouseDown({
                options,
                canvas,
                selectedShapeRef,
                isDrawing,
                shapeRef,
            });
        });

        canvas.on("mouse:move", (options) => {
            handleCanvaseMouseMove({
                options,
                canvas,
                isDrawing,
                selectedShapeRef,
                shapeRef,
                syncShapeInStorage,
            });
        });

        canvas.on("mouse:up", () => {
            handleCanvasMouseUp({
                canvas,
                isDrawing,
                shapeRef,
                activeObjectRef,
                selectedShapeRef,
                syncShapeInStorage,
                setActiveElement,
            });
        });

        canvas.on("path:created", (options) => {
            handlePathCreated({
                options,
                syncShapeInStorage,
            });
        });

        canvas.on("object:modified", (options) => {
            handleCanvasObjectModified({
                options,
                syncShapeInStorage,
            });
        });

        canvas.on("object:moving", (options) => {
            handleCanvasObjectMoving({
                options,
            });
        });

        canvas.on("selection:created", (options) => {
            handleCanvasSelectionCreated({
                options,
                isEditingRef,
                setElementAttributes,
            });
        });

        canvas.on("object:scaling", (options) => {
            handleCanvasObjectScaling({
                options,
                setElementAttributes,
            });
        });

        canvas.on("mouse:wheel", (options) => {
            handleCanvasZoom({
                options,
                canvas,
            });
        });

        window.addEventListener("resize", () => {
            handleResize({
                canvas: fabricRef.current,
            });
        });

        window.addEventListener("keydown", (e) =>
            handleKeyDown({
                e,
                canvas: fabricRef.current,
                undo,
                redo,
                syncShapeInStorage,
                deleteShapeFromStorage,
            })
        );

        return () => {
            canvas.dispose();
            window.removeEventListener("resize", () => {
                handleResize({
                    canvas: null,
                });
            });
            window.removeEventListener("keydown", (e) =>
                handleKeyDown({
                    e,
                    canvas: fabricRef.current,
                    undo,
                    redo,
                    syncShapeInStorage,
                    deleteShapeFromStorage,
                })
            );
        };
    }, [canvasRef]);

    useEffect(() => {
        renderCanvas({
            fabricRef,
            canvasObjects,
            activeObjectRef,
        });
    }, [canvasObjects]);

    return (
        <main className='h-screen overflow-hidden'>
            <Navbar
                imageInputRef={imageInputRef}
                activeElement={activeElement}
                handleImageUpload={(e: any) => {
                    e.stopPropagation();
                    handleImageUpload({
                        file: e.target.files[0],
                        canvas: fabricRef as any,
                        shapeRef,
                        syncShapeInStorage,
                    });
                }}
                handleActiveElement={handleActiveElement}
            />
            <section className='flex h-full flex-row'>
                <Live canvasRef={canvasRef} undo={undo} redo={redo} />
                <RightSidebar
                    elementAttributes={elementAttributes}
                    setElementAttributes={setElementAttributes}
                    fabricRef={fabricRef}
                    activeObjectRef={activeObjectRef}
                    isEditingRef={isEditingRef}
                    syncShapeInStorage={syncShapeInStorage}
                    handleCapture={handleCapture}
                    exportWhiteboard={exportWhiteboard}
                    handleMint={handleMint}
                    isExporting={isExporting}
                    isMinting={isMinting}
                    mintingStep={mintingStep}
                    mintingSuccess={mintingSuccess}
                    mintingError={mintingError}
                />
            </section>           
        </main>
    );
};

export default CanvasComponent;
"use client"

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { fabric } from "fabric";
import { useMutation, useRedo, useStorage, useUndo } from "@liveblocks/react/suspense";
import { handleCanvaseMouseMove, handleCanvasMouseDown, handleCanvasMouseUp, handleCanvasObjectModified, handleCanvasObjectMoving, handleCanvasObjectScaling, handleCanvasSelectionCreated, handleCanvasZoom, handlePathCreated, handleResize, initializeFabric, renderCanvas } from "@/lib/canvas";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import { handleImageUpload } from "@/lib/shapes";
import { defaultNavElement } from "@/constants";
import { ActiveElement, Attributes } from "@/types/type";
import { useAccount, useChainId, useConnect, usePublicClient, useSimulateContract, useWalletClient } from 'wagmi';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import RightSidebar from "@/components/RightSidebar";
import { ContractFunctionExecutionError, encodeAbiParameters, parseAbiParameters, stringToHex, encodeFunctionData, parseEther } from 'viem';
import { erc721DropABI } from "@zoralabs/zora-721-contracts";
import { zoraNftCreatorV1Config } from '@zoralabs/zora-721-contracts';
import { base } from 'wagmi/chains';
import { waitForTransactionReceipt } from 'viem/actions';
import { ethers } from 'ethers';

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
        name: "Playground Pic",
        description: "Made with Playground by Playgotchi. (https://playground.playgotchi.com/)",
        image: `ipfs://${imageHash}`
    });


    
    const handleMint = async () => {
        if (!address) {
            throw new Error("User address is not available");
        }
        
        setIsMinting(true);
        setMintingError(null);
        setMintingSuccess(false);
        setMintingStep('Capturing image');
    
        try {
            console.log("Capturing image from whiteboard...");
            const imageDataUrl = await captureWhiteboard();
            setMintingStep('Uploading to IPFS');
            console.log("Image captured, fetching blob...");
            const blob = await (await fetch(imageDataUrl)).blob();
            console.log("Blob fetched, uploading to IPFS...");
            const imageHash = await uploadToIPFS(blob);
            console.log("Image uploaded to IPFS, hash:", imageHash);
            
            // Create and upload contract metadata
            console.log("Creating and uploading contract metadata...");
            const contractMetadata = createMetadata(imageHash);
            const contractMetadataHash = await uploadToIPFS(new Blob([JSON.stringify(contractMetadata)], { type: 'application/json' }));
            const contractURI = `ipfs://${contractMetadataHash}`;
            console.log("Contract metadata uploaded to IPFS, hash:", contractMetadataHash);
    
            const baseURI = `ipfs://${imageHash}/`;
            setMintingStep('Preparing transaction');
    
            // Prepare metadata initialization
            console.log("Creating metadataInitializer...");
            const abiCoder = new ethers.AbiCoder();

            const metadataInitializer = abiCoder.encode(
                ['string', 'string', 'string'],
                [baseURI, contractURI, "0x"] 
            );
            
            
            console.log("Preparing setupCalls...");
            const erc721DropInterface = new ethers.Interface(erc721DropABI);
           
            const salesConfiguration = {
                publicSalePrice: BigInt(0),
                maxSalePurchasePerAddress: 1,
                publicSaleStart: BigInt(Math.floor(Date.now() / 1000) - 60), // 1 minute ago to ensure it's active
                publicSaleEnd: BigInt("0xFFFFFFFFFFFFFFFF"), // Far future
                presaleStart: BigInt(0),
                presaleEnd: BigInt(0),
                presaleMerkleRoot: "0x0000000000000000000000000000000000000000000000000000000000000000"
            };

             // 1. Activate the sale
            const activateSaleData = erc721DropInterface.encodeFunctionData('setSaleConfiguration', [
                salesConfiguration.publicSalePrice,
                salesConfiguration.maxSalePurchasePerAddress,
                salesConfiguration.publicSaleStart,
                salesConfiguration.publicSaleEnd,
                salesConfiguration.presaleStart,
                salesConfiguration.presaleEnd,
                salesConfiguration.presaleMerkleRoot
            ]);
            console.log("Sales data encoded");

            // 2. Admin mint
            const adminMintData = erc721DropInterface.encodeFunctionData('adminMint', [
                address, // recipient
                BigInt(1) // quantity
            ]);
            console.log("Admin mint encoded");

            // Combine setupCalls
            const setupCalls: readonly `0x${string}`[] = [
                activateSaleData as `0x${string}`,
                adminMintData as `0x${string}`
            ];
            
            console.log("setupCalls prepared successfully");

    
            // Prepare the createAndConfigureDrop function call
            console.log("Preparing createAndConfigureDrop function call...");
            setMintingStep('Creating metadata...');
          
            // Create Drop contract
            const args = [
                "Playground Pic", // name
                "PP", // symbol
                address as `0x${string}`, // defaultAdmin
                BigInt(2), // editionSize (1 for a single mint)
                300, // royaltyBPS (3%)
                address as `0x${string}`, // fundsRecipient
                setupCalls, // setupCalls
                '0x7d1a46c6e614A0091c39E102F2798C27c1fA8892' as `0x${string}`, // metadataRenderer (EDITION_METADATA_RENDERER)
                metadataInitializer as `0x${string}`,
                "0x124F3eB5540BfF243c2B57504e0801E02696920E" as `0x${string}`, // createReferral
            ] as const;
    
            console.log("Args for createAndConfigureDrop:", args);
    
            // Simulate the transaction
            setMintingStep('Simulating transaction...');
            console.log("Simulating Transaction");
    
            try {
                // Simulate the transaction
                setMintingStep('Simulating transaction...');
                console.log("Simulating Transaction");
            
                const { request } = await publicClient.simulateContract({
                    account: address,
                    address: zoraNftCreatorV1Config.address[base.id],
                    abi: zoraNftCreatorV1Config.abi,
                    functionName: "createAndConfigureDrop",
                    args,
                });
                console.log("Transaction simulation successful", request);
            } catch (error) {
                console.error('Simulation error:', error);
            
                // Type assertion to specify the expected structure of the error object
                const typedError = error as { error?: { data?: any } };
            
                if (typedError.error && typedError.error.data) {
                    console.error('Error data:', typedError.error.data);
                }
            
                if (error instanceof Error) {
                    throw new Error(`Transaction simulation failed: ${error.message}`);
                } else {
                    throw new Error('Transaction simulation failed with an unknown error');
                }
            }
    
            setMintingStep('Deploying smart contract...');
            const hash = await writeContractAsync({
                address: zoraNftCreatorV1Config.address[base.id], 
                abi: zoraNftCreatorV1Config.abi,
                functionName: "createAndConfigureDrop",
                args,
            });
    
            console.log("Transaction hash:", hash);
            setMintingStep('Waiting for transaction confirmation...');
    
            // Wait for transaction confirmation
            const receipt = await waitForTransactionReceipt(publicClient, { hash });
    
            console.log("Transaction receipt:", receipt);
    
                  // Extract editionContractAddress from the CreatedDrop event
        const createdDropEvent = receipt.logs.find(log =>
            log.topics[0] === '0x5754af5e5da2a42f78041e5277cfb80bd4c4cd124f9bc9e4ddd909c66bbfde39'
        );

        if (createdDropEvent) {
            const editionContractAddress = createdDropEvent.address;
            console.log(`New drop created: ${editionContractAddress}`);
            setMintingSuccess(true);
            setMintingStep('Drop created successfully');
        } else {
            throw new Error("CreatedDrop event not found in transaction receipt");
        }
    } catch (error) {
        console.error('Error minting token:', error);
        if (error instanceof ContractFunctionExecutionError) {
            console.error("Contract error details:", error.cause);
            setMintingError(`Contract error: ${error.cause?.message || error.message}`);
        } else {
            setMintingError(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    } finally {
        setIsMinting(false);
    }
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
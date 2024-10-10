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
import { zoraCreator1155FactoryImplConfig } from '@zoralabs/protocol-deployments';
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
    const [editionContractAddress, setEditionContractAddress] = useState<`0x${string}` | null>(null);


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
        // Capture image and upload to IPFS
        const imageDataUrl = await captureWhiteboard();
        const blob = await (await fetch(imageDataUrl)).blob();
        const imageHash = await uploadToIPFS(blob);

        const contractMetadata = createMetadata(imageHash);
        const contractMetadataHash = await uploadToIPFS(new Blob([JSON.stringify(contractMetadata)], { type: 'application/json' }));
        const contractURI = `ipfs://${contractMetadataHash}`;
        const tokenURI = `ipfs://${contractMetadataHash}`;

        setMintingStep('Preparing transaction');

        // Prepare contract creation parameters
        const name = "Playground Pic";
        const defaultRoyaltyConfiguration = {
            royaltyMintSchedule: 0, // Immediate
            royaltyBPS: 300, // 3%
            royaltyRecipient: address
        };
        const defaultAdmin = address;
        const maxSupply = BigInt(1);

        // Prepare setup actions
        const erc1155CreatorInterface = new ethers.Interface(zoraCreator1155FactoryImplConfig.abi); // You'll need to import this ABI

        // Action 1: Create a token
        const createTokenAction = erc1155CreatorInterface.encodeFunctionData(
            'setupNewTokenWithCreateReferral',
            [
                tokenURI, // newURI
                maxSupply, // maxSupply: MAX_INT for open edition
                address // createReferral: your address for rewards
            ]
        );
        // Action 2: Set up sale configuration
        const setSaleConfigAction = erc1155CreatorInterface.encodeFunctionData(
            'setSaleConfiguration',
            [1, { // tokenId
                salePrice: BigInt(0),
                maxTokensPerAddress: 1,
                pricePerToken: BigInt(0),
                startTime: BigInt(0),
                endTime: BigInt("0xFFFFFFFFFFFFFFFF"),
                fundingRecipient: address
            }]
        );

        // Action 3: Mint a token
        const adminMintAction = erc1155CreatorInterface.encodeFunctionData('adminMint', [address, 1, 1]);


        const setupActions: readonly `0x${string}`[] = [
            createTokenAction as `0x${string}`,
            setSaleConfigAction as `0x${string}`,
            adminMintAction as `0x${string}`
        ];
        console.log("setupActions:", setupActions);
 

        // Prepare transaction for contract creation
        setMintingStep('Creating contract...');
        const createContractTx = await writeContractAsync({
            address: '0x777777C338d93e2C7adf08D102d45CA7CC4Ed021' as `0x${string}`, // Factory address
            abi: zoraCreator1155FactoryImplConfig.abi, // You'll need to import this ABI
            functionName: "createContract",
            args: [
                contractURI,
                name,
                defaultRoyaltyConfiguration,
                defaultAdmin,
                setupActions
            ] as const,
        });
        console.log("createContractTx:", createContractTx);

        // Wait for the transaction to be mined
        const receipt = await waitForTransactionReceipt(publicClient, { hash: createContractTx });

        // Extract new contract address from the event
        const createdContractEvent = receipt.logs.find(log =>
            log.topics[0] === ethers.id("CreatedContract(address,address)")
        );

        if (!createdContractEvent) {
            throw new Error("CreatedContract event not found in transaction receipt");
        }

 

        setMintingSuccess(true);
        setMintingStep('Contract created and token minted successfully');
    } catch (error) {
        console.error('Error creating contract and minting token:', error);
        setMintingError(error instanceof Error ? error.message : 'An unknown error occurred');
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
            {capturedImage && (
          <div className="fixed bottom-4 right-4 p-2 bg-white rounded shadow">
            <img src={capturedImage} alt="Captured Whiteboard" className="w-32 h-32 object-cover" />
          </div>
        )}        
        </main>
    );
};

export default CanvasComponent;
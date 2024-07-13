"use client"

import React, { useRef, useState, useEffect } from 'react';
import { fabric } from "fabric";
import { useMutation, useRedo, useStorage, useUndo } from "@liveblocks/react/suspense";
import { handleCanvaseMouseMove, handleCanvasMouseDown, handleCanvasMouseUp, handleCanvasObjectModified, handleCanvasObjectMoving, handleCanvasObjectScaling, handleCanvasSelectionCreated, handleCanvasZoom, handlePathCreated, handleResize, initializeFabric, renderCanvas } from "@/lib/canvas";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import { handleImageUpload } from "@/lib/shapes";
import { defaultNavElement } from "@/constants";
import { ActiveElement, Attributes } from "@/types/type";
import html2canvas from 'html2canvas';
import { useAccount, useChainId } from 'wagmi';
import { useSimulateContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { base } from 'wagmi/chains';
import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import RightSidebar from "@/components/RightSidebar";
import { erc721DropABI, dropMetadataRendererABI } from "@zoralabs/zora-721-contracts";
import { parseEther, Address } from 'viem';


const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

const YOUR_CONTRACT_ADDRESS = "0x2506012d406Cd451735e78Ff5Bcea35dC7ee1505";
const DROP_METADATA_RENDERER_ADDRESS = "0xd1cba36d92B052079523F471Eb891563F2E5dF5C";


const CanvasComponent = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    const [mintingStep, setMintingStep] = useState('');
    const [mintingError, setMintingError] = useState<string | null>(null);
    const [mintingSuccess, setMintingSuccess] = useState(false);

    const undo = useUndo();
    const redo = useRedo();

    const canvasObjects = useStorage((root) => root.canvasObjects);

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
            case "comments":
                break;
            default:
                selectedShapeRef.current = elem?.value as string;
                break;
        }
    };

    const captureWhiteboard = async (aspectRatio: number = 1.9): Promise<string> => {
        if (!fabricRef.current) throw new Error('Canvas not initialized');

        try {
            const canvas = fabricRef.current;
            const originalWidth = canvas.getWidth();
            const originalHeight = canvas.getHeight();

            // Calculate dimensions for the new aspect ratio
            let newWidth, newHeight;
            if (originalWidth / originalHeight > aspectRatio) {
                // Original canvas is wider than target aspect ratio
                newHeight = originalHeight;
                newWidth = newHeight * aspectRatio;
            } else {
                // Original canvas is taller than target aspect ratio
                newWidth = originalWidth;
                newHeight = newWidth / aspectRatio;
            }

            // Create a new canvas with the desired aspect ratio
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = newWidth;
            tempCanvas.height = newHeight;

            const ctx = tempCanvas.getContext('2d');
            if (!ctx) throw new Error('Failed to get 2D context');

            // Get the background color from the Fabric.js canvas or use default
            ctx.fillStyle = '#020817'; // Use the same background color as before
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            // Render the Fabric.js canvas
            canvas.renderAll();
            const fabricCanvas = canvas.getElement();

            // Calculate positioning to center the original content
            const scale = Math.min(newWidth / originalWidth, newHeight / originalHeight);
            const x = (newWidth - originalWidth * scale) / 2;
            const y = (newHeight - originalHeight * scale) / 2;

            // Draw the scaled and centered content onto the new canvas
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
            const imageDataUrl = await captureWhiteboard(1.9); // Specify 1.9:1 aspect ratio
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
            const imageDataUrl = await captureWhiteboard(1.9); // Specify 1.9:1 aspect ratio

            const link = document.createElement('a');
            link.href = imageDataUrl;
            link.download = 'whiteboard-export.png';
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

       const createMetadata = (imageHash: string, tokenId: string | number) => ({
        name: `Playground Pic #${tokenId}`,
        description: "Made with Playground by Playgotchi. (https://playground.playgotchi.com/)",
        image: `ipfs://${imageHash}`,
        attributes: [
            {
                trait_type: "Token ID",
                value: tokenId.toString()
            }
        ]
    });
    
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
                    const { ipfsHash, filename } = await response.json();
                    resolve(`ipfs://${ipfsHash}/${filename}`);
                } catch (error) {
                    reject(error);
                }
            };
        });
    };

    const { address } = useAccount();
    const chainId = useChainId();
    
    const { writeContract, data: writeData, error: writeError } = useWriteContract();

    const { data: receiptData, isLoading: isReceiptLoading, error: receiptError } = useWaitForTransactionReceipt({
        hash: writeData,
    });

    const handleMint = async () => {
        setIsMinting(true);
        setMintingStep('Capturing image');
        setMintingError(null);
    
        try {
            const imageDataUrl = await captureWhiteboard();
            const imageBlob = await (await fetch(imageDataUrl)).blob();
    
            setMintingStep('Uploading to IPFS');
            const imageHash = await uploadToIPFS(imageBlob);
    
            setMintingStep('Minting NFT');
            
        // Purchase (mint) the NFT
        await writeContract({
            address: YOUR_CONTRACT_ADDRESS as Address,
            abi: erc721DropABI,
            functionName: 'purchase',
            args: [BigInt(1)], // Minting 1 NFT
            value: parseEther('0.000777'), // Adjust if there's a minting fee
        });
    
            // Wait for the transaction to be mined
            setMintingStep('Waiting for confirmation');
            const receipt = await useWaitForTransactionReceipt({ hash: writeData });
    
            if (receipt && receipt.status === 'success' && 'logs' in receipt) {
                const mintEvent = (receipt.logs as any[]).find((log: any) => 
                    log.eventName === 'Transfer' && 
                    log.args.from === '0x0000000000000000000000000000000000000000'
                );
                const tokenId = mintEvent ? mintEvent.args.tokenId : null;
    
    
                if (tokenId) {
                    setMintingStep('Updating Metadata');
                    
                    // Create and upload individual token metadata
                    const metadata = createMetadata(imageHash, tokenId);
                    const metadataHash = await uploadToIPFS(new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    
                    // Update the contract's metadata base to include the token ID
                    await writeContract({
                        address: DROP_METADATA_RENDERER_ADDRESS as Address,
                        abi: dropMetadataRendererABI,
                        functionName: 'updateMetadataBaseWithDetails',
                        args: [
                            YOUR_CONTRACT_ADDRESS as Address,
                            `ipfs://${(metadataHash as string).split('/').slice(0, -1).join('/')}/`, // metadataBase
                            '{id}.json', // metadataExtension
                            '', // newContractURI (empty string if not changing)
                            BigInt(0) // freezeAt (0 if you don't want to freeze metadata)
                        ],
                    });
    
                    setMintingSuccess(true);
                } else {
                    throw new Error('Failed to retrieve token ID from minting event');
                }
            } else {
                throw new Error('Minting transaction failed');
            }
    
        } catch (error) {
            console.error("Error while minting:", error);
            setMintingError(error instanceof Error ? error.message : String(error));
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

    useEffect(() => {
        if (receiptData) {
            console.log("Transaction confirmed:", receiptData);
            setMintingSuccess(true);
        }
    }, [receiptData]);

    useEffect(() => {
        if (writeError) {
            setMintingError(`Write error: ${writeError.message}`);
        }
    }, [writeError]);

    useEffect(() => {
        if (receiptError) {
            setMintingError(`Receipt error: ${receiptError.message}`);
        }
    }, [receiptError]);

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
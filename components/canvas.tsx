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

    const captureWhiteboard = async (): Promise<string> => {
        const canvas = document.querySelector('main');
        if (!canvas) throw new Error('Canvas element not found');

        try {
            const captureCanvas = await html2canvas(canvas, {
                scale: 2,
                useCORS: true,
                logging: true,
                backgroundColor: '#020817',
            });
            return captureCanvas.toDataURL('image/png');
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

    const createMetadata = (imageHash: string) => ({
        name: "Playground Pic",
        description: "Made with Playground by Playgotchi. (https://playground.playgotchi.com/)",
        image: `ipfs://${imageHash}`
    });

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

            const metadata = createMetadata(imageHash);
            const metadataHash = await uploadToIPFS(new Blob([JSON.stringify(metadata)], { type: 'application/json' }));

            setMintingStep('Preparing contract interaction');
            

            setMintingStep('Minting NFT');
            
            // Initiate minting transaction
            writeContract({
                address: YOUR_CONTRACT_ADDRESS as Address,
                abi: erc721DropABI,
                functionName: 'purchase',
                args: [BigInt(1)], // Minting 1 NFT
                value: parseEther('0.000777'), // Adjust if there's a minting fee
            });

            // Wait for the transaction to be mined
            setMintingStep('Waiting for confirmation');
            while (!receiptData && !receiptError) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            if (receiptError) {
                throw new Error(`Minting failed: ${receiptError.message}`);
            }

            if (receiptData?.status === 'success') {
                setMintingStep('Updating Metadata');
                
                // Update the metadata
                writeContract({
                    address: DROP_METADATA_RENDERER_ADDRESS as Address,
                    abi: dropMetadataRendererABI,
                    functionName: 'updateMetadataBaseWithDetails',
                    args: [
                        YOUR_CONTRACT_ADDRESS as Address,
                        `ipfs://${metadataHash}/`, // metadataBase
                        '', // metadataExtension (empty string if not needed)
                        '', // newContractURI (empty string since you're only updating a single token)
                        BigInt(0) // freezeAt (0 if you don't want to freeze metadata)
                    ],
                });

                // Wait for the metadata update transaction to be mined
                while (!receiptData && !receiptError) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }


                if (receiptData?.status === 'success') {
                    setMintingSuccess(true);
                } else {
                    throw new Error('Metadata update transaction failed');
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
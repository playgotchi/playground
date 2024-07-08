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
import { zoraNftCreatorV1Config } from "@zoralabs/zora-721-contracts";
import { base } from 'wagmi/chains';

import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import RightSidebar from "@/components/RightSidebar";

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
 

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

    const { address } = useAccount();
    const chainId = useChainId();
    const { writeContract } = useWriteContract();
    

   
    
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
                backgroundColor: '#f1f5f9',
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
        description: "Made with Playground by Playgotchi.(https://playground.playgotchi.com/)",
        image: `ipfs://${imageHash}`
    });

    const handleMint = async () => {
        if (!capturedImage) {
          alert('Please capture the whiteboard before minting.');
          return;
        }
      
        if (!address) {
          alert('Please connect your wallet');
          return;
        }
      
        if (chainId !== base.id) {
          alert('Please switch to Base network');
          return;
        }
      
        setIsMinting(true);
        setMintingStep('Preparing image...');
        setMintingError(null);
        setMintingSuccess(false);
      
        try {
            // Capture and upload image
            const imageDataUrl = await captureWhiteboard();
            const blob = await (await fetch(imageDataUrl)).blob();
            const imageHash = await uploadToIPFS(blob);
    
            // Create and upload metadata
            const metadata = createMetadata(imageHash);
            const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
            const metadataHash = await uploadToIPFS(metadataBlob);
            console.log(`Pinned image to IPFS: ${imageHash}`);
            console.log(`Pinned image to IPFS: ${metadataHash}`);

          setMintingStep('Creating metadata...');
      
        // Create Drop contract
        const args = [
            "Playground Pic", // name
            "PP", // symbol
            address as `0x${string}`, // defaultAdmin
            BigInt(100), // Edition size (1 for a single mint)
            3, // royaltyBPS (3%)
            address as `0x${string}`, // fundsRecipient
            {
                publicSalePrice: BigInt(0),
                maxSalePurchasePerAddress: 0,
                publicSaleStart: BigInt(0),
              publicSaleEnd: BigInt("0xFFFFFFFFFFFFFFFF"),
                presaleStart: BigInt(0),
                presaleEnd: BigInt(0),
                presaleMerkleRoot: "0x0000000000000000000000000000000000000000000000000000000000000000"
            },
            `ipfs://${metadataHash}/`, // metadataURIBase
            "", // metadataContractURI (optional)
            "0x124F3eB5540BfF243c2B57504e0801E02696920E" as `0x${string}`, // createReferral
        ] as const;

      
          setMintingStep('Minting Smart Contract...');
          await writeContract({
            address: zoraNftCreatorV1Config.address[base.id], 
            abi: zoraNftCreatorV1Config.abi,
            functionName: "createDropWithReferral",
            args,
          });
          setMintingSuccess(true);
        } catch (error) {
          console.error('Error minting token:', error);
          setMintingError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
          setIsMinting(false);
          setMintingStep('');
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
                    isEditingRef={isEditingRef}
                    activeObjectRef={activeObjectRef}
                    syncShapeInStorage={syncShapeInStorage}
                />
                <div className="flex flex-col space-y-2 p-4">
                    <button
                        onClick={handleCapture}
                        disabled={isExporting}
                        className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
                    >
                        {isExporting ? 'Capturing...' : 'Capture Whiteboard'}
                    </button>
                    <button
                        onClick={exportWhiteboard}
                        disabled={isExporting || !capturedImage}
                        className="bg-green-500 text-white p-2 rounded disabled:bg-gray-400"
                    >
                        {isExporting ? 'Exporting...' : 'Export'}
                    </button>
                    <button
                        onClick={handleMint}
                        disabled={isMinting || !capturedImage}
                        className="bg-purple-500 text-white p-2 rounded disabled:bg-gray-400"
                    >
                        {isMinting ? `Minting... (${mintingStep})` : 'Mint NFT'}
                    </button>
                    {mintingSuccess && <p className="text-green-500">NFT minted successfully!</p>}
                    {mintingError && <p className="text-red-500">Error: {mintingError}</p>}
                </div>
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
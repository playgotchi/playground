import React, { useRef, useState, useEffect } from 'react';
import { fabric } from "fabric";
import { useMutation, useRedo, useStorage, useUndo } from "@liveblocks/react/suspense";
import { handleCanvaseMouseMove, handleCanvasMouseDown, handleCanvasMouseUp, handleCanvasObjectModified, handleCanvasObjectMoving, handleCanvasObjectScaling, handleCanvasSelectionCreated, handleCanvasZoom, handlePathCreated, handleResize, initializeFabric, renderCanvas } from "@/lib/canvas";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import { handleImageUpload } from "@/lib/shapes";
import { defaultNavElement } from "@/constants";
import { ActiveElement, Attributes } from "@/types/type";
import html2canvas from 'html2canvas';

import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import RightSidebar from "@/components/RightSidebar";


const CanvasComponent = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
  
    const captureWhiteboard = async (): Promise<string> => {
      const canvas = document.querySelector('main');
      if (!canvas) throw new Error('Canvas element not found');
  
      try {
        const captureCanvas = await html2canvas(canvas, {
          scale: 2, // Increase scale for better quality
          useCORS: true, // This might help with cross-origin images if any
          logging: true, // For debugging
          backgroundColor: '#f1f5f9', // Match your bg-slate-100 color
        });
        return captureCanvas.toDataURL('image/png');
      } catch (error) {
        console.error('Failed to capture whiteboard:', error);
        throw error; // Re-throw for handling in calling functions
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
    // get the canvasObjects store
    const canvasObjects = storage.get("canvasObjects");

    // if the store doesn't exist or is empty, return
    if (!canvasObjects || canvasObjects.size === 0) return true;

    // return true if the store is empty
  return canvasObjects.size === 0;
  }, []);

  const syncShapeInStorage =useMutation(({ storage }, object) => {
    if(!object) return;
    const { objectId } = object
    const shapeData = object.toJSON();
    shapeData.objectId = objectId;

    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.set(objectId, shapeData);
  }, []);

  
  /**
   * Set the active element in the navbar and perform the action based
   * on the selected element.
   *
   * @param elem
   */
  const handleActiveElement = (elem: ActiveElement) => {
    setActiveElement(elem);

    switch (elem?.value) {
      // delete all the shapes from the canvas
      case "reset":
        // clear the storage
        deleteAllShapes();
        // clear the canvas
        fabricRef.current?.clear();
        // set "select" as the active element
        setActiveElement(defaultNavElement);
        break;

      // delete the selected shape from the canvas
      case "delete":
        // delete it from the canvas
        handleDelete(fabricRef.current as any, deleteShapeFromStorage);
        // set "select" as the active element
        setActiveElement(defaultNavElement);
        break;

      // upload an image to the canvas
      case "image":
        // trigger the click event on the input element which opens the file dialog
        imageInputRef.current?.click();

        isDrawing.current = false;

        if (fabricRef.current) {
          // disable the drawing mode of canvas
          fabricRef.current.isDrawingMode = false;
        }
        break;

      // for comments, do nothing
      case "comments":
        break;

      default:
        // set the selected shape to the selected element
        selectedShapeRef.current = elem?.value as string;
        break;
    }
  };

  useEffect(() => {
    // initialize the fabric canvas
    const canvas = initializeFabric({
      canvasRef,
      fabricRef,
    });

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
  
      
      canvas?.on("object:moving", (options) => {
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
  
      // dispose the canvas and remove the event listeners when the component unmounts
      return () => {
        /*
         * dispose: http://fabricjs.com/docs/fabric.Canvas.html#dispose
         */
        canvas.dispose();

        const handleCapture = () => {
            const canvasElement = canvasRef.current;
            if (!canvasElement) return;
        
            html2canvas(canvasElement)
              .then((canvasImage) => {
                const imageData = canvasImage.toDataURL('image/png'); // Adjust format if needed
                setCapturedImage(imageData);
              })
              .catch((error) => {
                console.error('Failed to capture canvas:', error);
                // Handle capture error (optional: display message to user)
              });
          };

           // remove the event listeners
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
  }, [canvasRef]); // run this effect only once when the component mounts and the canvasRef changes

  // render the canvas when the canvasObjects from live storage changes
  useEffect(() => {
    renderCanvas({
      fabricRef,
      canvasObjects,
      activeObjectRef,
    });
  }, [canvasObjects]);

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

  return (
    <main className='h-screen overflow-hidden'>
       <Navbar
          imageInputRef={imageInputRef}
          activeElement={activeElement}
          handleImageUpload={(e: any) => {
            // prevent the default behavior of the input element
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
         <button onClick={handleCapture}>Capture Whiteboard</button>
      <button
        onClick={exportWhiteboard}
        disabled={isExporting}
        className="bg-green-500 text-white p-2 rounded disabled:bg-gray-400"
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
        {capturedImage && <div>Captured Image: {capturedImage}</div>}
      </section>
    </main>
  );
};

export default CanvasComponent;
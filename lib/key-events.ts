import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";

import { CustomFabricObject } from "@/types/type";

export const handleCopy = (canvas: fabric.Canvas) => {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length > 0) {
    // Serialize the selected objects
    const serializedObjects = activeObjects.map((obj) => obj.toObject());
    // Store the serialized objects in the clipboard
    localStorage.setItem("clipboard", JSON.stringify(serializedObjects));
  }

  return activeObjects;
};

export const handlePaste = (
  canvas: fabric.Canvas,
  syncShapeInStorage: (shape: fabric.Object) => void
) => {
  if (!canvas || !(canvas instanceof fabric.Canvas)) {
    console.error("Invalid canvas object. Aborting paste operation.");
    return;
  }

  // Retrieve serialized objects from the clipboard
  const clipboardData = localStorage.getItem("clipboard");

  if (clipboardData) {
    try {
      const parsedObjects = JSON.parse(clipboardData);
      parsedObjects.forEach((objData: any) => {
        // convert the plain javascript objects retrieved from localStorage into fabricjs objects (deserialization)
        fabric.util.enlivenObjects(
          [objData],
          (enlivenedObjects: fabric.Object[]) => {
            enlivenedObjects.forEach((enlivenedObj) => {
              // Offset the pasted objects to avoid overlap with existing objects
              enlivenedObj.set({
                left: enlivenedObj.left || 0 + 20,
                top: enlivenedObj.top || 0 + 20,
                objectId: uuidv4(),
                fill: "#aabbcc",
              } as CustomFabricObject<any>);

              canvas.add(enlivenedObj);
              syncShapeInStorage(enlivenedObj);
            });
            canvas.renderAll();
          },
          "fabric"
        );
      });
    } catch (error) {
      console.error("Error parsing clipboard data:", error);
    }
  }
};

export const handleDelete = (
  canvas: fabric.Canvas,
  deleteShapeFromStorage: (id: string) => void
) => {
  const activeObjects = canvas.getActiveObjects();
  if (!activeObjects || activeObjects.length === 0) return;

  if (activeObjects.length > 0) {
    activeObjects.forEach((obj: CustomFabricObject<any>) => {
      if (!obj.objectId) return;
      canvas.remove(obj);
      deleteShapeFromStorage(obj.objectId);
    });
  }

  canvas.discardActiveObject();
  canvas.requestRenderAll();
};

// create a handleKeyDown function that listen to different keydown events
export const handleKeyDown = ({
  e,
  canvas,
  undo,
  redo,
  syncShapeInStorage,
  deleteShapeFromStorage,
}: {
  e: KeyboardEvent;
  canvas: fabric.Canvas | any;
  undo: () => void;
  redo: () => void;
  syncShapeInStorage: (shape: fabric.Object) => void;
  deleteShapeFromStorage: (id: string) => void;
}) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
    e.preventDefault();
    handleCopy(canvas);
  }

  // Check if the key pressed is ctrl/cmd + v (paste)
  if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
    e.preventDefault();
    handlePaste(canvas, syncShapeInStorage);
  }

  // Check if the key pressed is delete/backspace (delete)
  if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    handleDelete(canvas, deleteShapeFromStorage);
  }

  // Check if the key pressed is ctrl/cmd + x (cut)
  if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
    e.preventDefault();
    handleCopy(canvas);
    handleDelete(canvas, deleteShapeFromStorage);
  }

  // Check if the key pressed is ctrl/cmd + z (undo)
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    undo();
  }

  // Check if the key pressed is ctrl/cmd + y (redo)
  if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
    e.preventDefault();
    redo();
  }

  // Prevent default for '?' key
  if (e.key === '/' && !e.shiftKey) {
    e.preventDefault();
  }
};
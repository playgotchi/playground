// utils/canvasCapture.ts

import html2canvas from 'html2canvas';

export const captureCanvas = async (elementSelector: string = 'main'): Promise<HTMLCanvasElement> => {
  const element = document.querySelector(elementSelector);
  if (!element) {
    throw new Error(`Element not found: ${elementSelector}`);
  }
  if (!(element instanceof HTMLElement)) {
    throw new Error(`Selected element is not an HTMLElement: ${elementSelector}`);
  }
  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: true,
    backgroundColor: '#f1f5f9',
  });
};
import { BrowserQRCodeReader } from '@zxing/browser';

let codeReader = null;
let currentStream = null;

export async function startScanner(videoEl, onResult) {
  if (codeReader) {
    stopScanner();
  }
  
  codeReader = new BrowserQRCodeReader();
  
  try {
    // Request camera permissions first
    currentStream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    });
    
    videoEl.srcObject = currentStream;
    
    // Start continuous scanning
    const controls = await codeReader.decodeFromVideoDevice(
      undefined, 
      videoEl, 
      (result, error) => {
        if (result) {
          onResult(result.getText());
        }
        if (error) {
          // Only log non-NotFoundException errors
          if (error.name !== 'NotFoundException') {
            console.warn('QR scan error:', error);
          }
        }
      }
    );
    
    return controls;
  } catch (err) {
    console.error("Scanner initialization error:", err);
    throw new Error('Camera access denied or unavailable');
  }
}

export function stopScanner() {
  if (codeReader) {
    codeReader.reset();
    codeReader = null;
  }
  
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
}
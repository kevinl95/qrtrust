import { BrowserQRCodeReader } from '@zxing/browser';

let codeReader = null;
let currentStream = null;
let videoElement = null;

export async function startScanner(videoEl, onResult) {
  if (codeReader) {
    stopScanner();
  }
  
  codeReader = new BrowserQRCodeReader();
  videoElement = videoEl; // Store reference to video element
  
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
          // Filter out expected errors that occur during normal scanning
          const isExpectedError = error.name === 'NotFoundException' || 
                                 error.name === 'NotFoundException2' ||
                                 error.name === 'ChecksumException' ||
                                 error.name === 'ChecksumException2' ||
                                 error.constructor.name.includes('NotFoundException') ||
                                 error.constructor.name.includes('ChecksumException') ||
                                 error.message?.includes('No MultiFormat Readers') ||
                                 error.toString().includes('NotFoundException') ||
                                 error.toString().includes('ChecksumException');
          
          if (!isExpectedError) {
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
  console.log("Stopping scanner...");
  
  // Stop the camera stream first
  if (currentStream) {
    currentStream.getTracks().forEach(track => {
      console.log("Stopping track:", track.kind);
      track.stop();
    });
    currentStream = null;
  }
  
  // Clear the video element
  if (videoElement) {
    videoElement.srcObject = null;
    videoElement.load(); // Reset the video element
    videoElement = null;
  }
  
  // Clean up the code reader
  if (codeReader) {
    // The BrowserQRCodeReader doesn't have a reset() method
    // We just need to set it to null to allow garbage collection
    codeReader = null;
  }
  
  console.log("Scanner stopped successfully");
}
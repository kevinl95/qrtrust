import { BrowserQRCodeReader } from '@zxing/browser';

let codeReader = null;
let currentStream = null;
let videoElement = null;
let isProcessing = false; // Flag to prevent multiple simultaneous scans
let lastScannedUrl = null; // Track the last scanned URL to prevent duplicates
let scannerActive = false; // Flag to track if scanner is actively running

export async function startScanner(videoEl, onResult) {
  // Always stop any existing scanner first
  if (codeReader) {
    stopScanner();
  }
  
  // Completely reset all state for fresh scan
  resetScannerState();
  scannerActive = true; // Activate for new scan
  
  console.log("Starting fresh scanner session");
  
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
          const scannedUrl = result.getText();
          
          // Multiple checks to prevent processing
          if (!scannerActive || isProcessing || scannedUrl === lastScannedUrl) {
            return;
          }
          
          // Set processing flag and store the URL
          isProcessing = true;
          lastScannedUrl = scannedUrl;
          scannerActive = false; // Immediately deactivate to prevent more scans
          
          console.log("QR Code detected, processing...");
          onResult(scannedUrl);
        }
        if (error) {
          // Only log errors if scanner is still active
          if (!scannerActive) return;
          
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
  
  // Immediately deactivate scanner and reset all state
  resetScannerState();
  
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

// Function to reset all scanner state
function resetScannerState() {
  isProcessing = false;
  lastScannedUrl = null;
  scannerActive = false;
  console.log("Scanner state reset");
}
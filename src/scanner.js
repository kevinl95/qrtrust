import { BrowserQRCodeReader } from '@zxing/browser';

export async function startScanner(videoEl, onResult) {
  const codeReader = new BrowserQRCodeReader();
  try {
    const result = await codeReader.decodeOnceFromVideoDevice(undefined, videoEl);
    onResult(result.getText());
  } catch (err) {
    console.error("QR Scan error", err);
  }
}
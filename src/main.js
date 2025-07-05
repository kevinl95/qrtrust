import './style.css';
import { startScanner } from './scanner';
import { checkUrlWithPhishTank } from './phishtank';

const video = document.querySelector('video');
const resultBox = document.querySelector('#result');

startScanner(video, async (scannedUrl) => {
  const isPhishing = await checkUrlWithPhishTank(scannedUrl);
  resultBox.textContent = isPhishing
    ? `⚠️ Phishing Alert: ${scannedUrl}`
    : `✅ Safe: ${scannedUrl}`;
});

import './style.css';
import { startScanner, stopScanner } from './scanner';
import { checkUrlWithPhishTank } from './phishtank';

const video = document.querySelector('video');
const resultContainer = document.querySelector('#result');
const resultIcon = document.querySelector('.result-icon');
const resultText = document.querySelector('.result-text');
const resultUrl = document.querySelector('.result-url');
const startBtn = document.querySelector('#start-btn');
const stopBtn = document.querySelector('#stop-btn');

let isScanning = false;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
});

function setupEventListeners() {
  startBtn.addEventListener('click', handleStartScanning);
  stopBtn.addEventListener('click', handleStopScanning);
}

async function handleStartScanning() {
  if (isScanning) return;
  
  startBtn.classList.add('loading');
  startBtn.innerHTML = '<span class="btn-icon">⏳</span>Starting...';
  
  try {
    await startScanner(video, handleQRCodeDetected);
    isScanning = true;
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-flex';
    hideResult();
  } catch (error) {
    console.error('Failed to start scanner:', error);
    showError('Camera access denied or not available');
  } finally {
    startBtn.classList.remove('loading');
    startBtn.innerHTML = '<span class="btn-icon">📱</span>Start Scanning';
  }
}

function handleStopScanning() {
  if (!isScanning) return;
  
  stopScanner();
  isScanning = false;
  startBtn.style.display = 'inline-flex';
  stopBtn.style.display = 'none';
  hideResult();
}

async function handleQRCodeDetected(scannedUrl) {
  if (!scannedUrl) return;
  
  showLoadingResult();
  
  try {
    const isPhishing = await checkUrlWithPhishTank(scannedUrl);
    
    if (isPhishing) {
      showPhishingResult(scannedUrl);
    } else {
      showSafeResult(scannedUrl);
    }
  } catch (error) {
    console.error('Error checking URL:', error);
    showError('Unable to verify URL safety');
  }
}

function showLoadingResult() {
  resultContainer.className = 'result-container';
  resultContainer.style.display = 'block';
  resultIcon.textContent = '⏳';
  resultText.textContent = 'Checking URL safety...';
  resultUrl.textContent = '';
}

function showSafeResult(url) {
  resultContainer.className = 'result-container safe';
  resultIcon.textContent = '✅';
  resultText.textContent = 'Safe URL Detected';
  resultUrl.textContent = url;
}

function showPhishingResult(url) {
  resultContainer.className = 'result-container phishing';
  resultIcon.textContent = '⚠️';
  resultText.textContent = 'Phishing Alert!';
  resultUrl.textContent = url;
}

function showError(message) {
  resultContainer.className = 'result-container phishing';
  resultContainer.style.display = 'block';
  resultIcon.textContent = '❌';
  resultText.textContent = 'Error';
  resultUrl.textContent = message;
}

function hideResult() {
  resultContainer.style.display = 'none';
}

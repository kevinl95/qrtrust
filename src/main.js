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

// PWA Install functionality
let deferredPrompt;
let hasUsedApp = false;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  trackAppUsage(); // Start tracking app usage on load
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
  
  // Track that user has used the app (for install prompt timing)
  trackAppUsage();
  
  // Additional check to prevent multiple simultaneous processing
  if (!isScanning) {
    console.log("Ignoring QR detection - scanner already stopped");
    return;
  }
  
  console.log("Processing detected QR code...");
  
  // Stop scanning immediately when we detect a QR code
  stopScanner();
  isScanning = false;
  startBtn.style.display = 'inline-flex';
  stopBtn.style.display = 'none';
  
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
    showUnknownResult(scannedUrl, error.message);
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
  resultText.textContent = 'URL appears safe';
  resultUrl.textContent = url;
  
  // Add action buttons for safe URLs
  addActionButtons(url, 'safe');
}

function showPhishingResult(url) {
  resultContainer.className = 'result-container phishing';
  resultIcon.textContent = '⚠️';
  resultText.textContent = 'Suspicious URL detected!';
  resultUrl.textContent = url;
  
  // Add warning and action buttons for suspicious URLs
  addWarningMessage();
  addActionButtons(url, 'phishing');
}

function showUnknownResult(url, errorMessage) {
  resultContainer.className = 'result-container unknown';
  resultIcon.textContent = '❓';
  resultText.textContent = 'Unable to verify URL safety';
  resultUrl.textContent = url;
  
  // Add info message about the verification failure
  addInfoMessage(errorMessage);
  // Add action buttons for unknown URLs
  addActionButtons(url, 'unknown');
}

function addInfoMessage(errorMessage) {
  // Remove existing info message if any
  const existingInfo = resultContainer.querySelector('.info-message');
  if (existingInfo) {
    existingInfo.remove();
  }
  
  const infoDiv = document.createElement('div');
  infoDiv.className = 'info-message';
  infoDiv.innerHTML = `
    <div class="info-content">
      <strong>ℹ️ Verification Failed:</strong> We couldn't check this URL against our security database. 
      This could be due to network issues or service unavailability. Please exercise caution when proceeding.
      <details style="margin-top: 0.5rem;">
        <summary style="cursor: pointer; font-size: 0.8rem; opacity: 0.8;">Technical details</summary>
        <code style="font-size: 0.75rem; opacity: 0.7;">${errorMessage}</code>
      </details>
    </div>
  `;
  
  resultContainer.appendChild(infoDiv);
}

function addActionButtons(url, type) {
  // Remove any existing action container
  const existingActions = resultContainer.querySelector('.result-actions');
  if (existingActions) {
    existingActions.remove();
  }
  
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'result-actions';
  
  if (type === 'safe') {
    // For safe URLs, show a prominent "Open URL" button
    const openButton = document.createElement('button');
    openButton.className = 'primary-btn';
    openButton.innerHTML = '<span class="btn-icon">🌐</span>Open URL';
    openButton.onclick = () => openURL(url);
    actionsContainer.appendChild(openButton);
    
  } else if (type === 'phishing') {
    // For suspicious URLs, show a warning "Proceed Anyway" button
    const proceedButton = document.createElement('button');
    proceedButton.className = 'warning-btn';
    proceedButton.innerHTML = '<span class="btn-icon">⚠️</span>Proceed Anyway';
    proceedButton.onclick = () => proceedWithWarning(url);
    actionsContainer.appendChild(proceedButton);
    
  } else if (type === 'unknown') {
    // For unknown URLs, show a cautious "Proceed with Caution" button
    const proceedButton = document.createElement('button');
    proceedButton.className = 'caution-btn';
    proceedButton.innerHTML = '<span class="btn-icon">⚠️</span>Proceed with Caution';
    proceedButton.onclick = () => proceedWithCaution(url);
    actionsContainer.appendChild(proceedButton);
  }
  
  // Add a "Copy URL" button for all types
  const copyButton = document.createElement('button');
  copyButton.className = 'secondary-btn';
  copyButton.innerHTML = '<span class="btn-icon">📋</span>Copy URL';
  copyButton.onclick = () => copyURL(url);
  actionsContainer.appendChild(copyButton);
  
  resultContainer.appendChild(actionsContainer);
}

function addWarningMessage() {
  // Remove existing warning if any
  const existingWarning = resultContainer.querySelector('.warning-message');
  if (existingWarning) {
    existingWarning.remove();
  }
  
  const warningDiv = document.createElement('div');
  warningDiv.className = 'warning-message';
  warningDiv.innerHTML = `
    <div class="warning-content">
      <strong>⚠️ Security Warning:</strong> This URL shows suspicious patterns commonly used in phishing attacks. 
      Proceeding may put your personal information at risk.
    </div>
  `;
  
  resultContainer.appendChild(warningDiv);
}

function openURL(url) {
  // Open URL in new tab with security measures
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (!newWindow) {
    // Fallback if popup blocker prevents opening
    navigator.clipboard.writeText(url).then(() => {
      alert('Popup blocked. URL copied to clipboard: ' + url);
    }).catch(() => {
      alert('Could not open URL. Please copy manually: ' + url);
    });
  }
}

function proceedWithCaution(url) {
  // Show moderate warning for unknown URLs
  const confirmed = confirm(
    `⚠️ PROCEED WITH CAUTION ⚠️\n\n` +
    `We couldn't verify the safety of this URL:\n${url}\n\n` +
    `This could mean:\n` +
    `• Our security service is temporarily unavailable\n` +
    `• The URL is new and not yet in our database\n` +
    `• There may be network connectivity issues\n\n` +
    `While this doesn't necessarily mean the site is dangerous, please:\n` +
    `• Be cautious with personal information\n` +
    `• Avoid downloading files\n` +
    `• Close the page if anything seems suspicious\n\n` +
    `Do you want to proceed?`
  );
  
  if (confirmed) {
    openURL(url);
  }
}

function proceedWithWarning(url) {
  // Show additional confirmation for suspicious URLs
  const confirmed = confirm(
    `⚠️ SECURITY WARNING ⚠️\n\n` +
    `You are about to visit a potentially dangerous website:\n${url}\n\n` +
    `This site may:\n` +
    `• Steal your passwords or personal information\n` +
    `• Install malware on your device\n` +
    `• Attempt to scam you\n\n` +
    `Are you absolutely sure you want to continue?`
  );
  
  if (confirmed) {
    openURL(url);
  }
}

function copyURL(url) {
  navigator.clipboard.writeText(url).then(() => {
    // Show temporary feedback
    const copyButton = resultContainer.querySelector('.secondary-btn');
    const originalText = copyButton.innerHTML;
    copyButton.innerHTML = '<span class="btn-icon">✅</span>Copied!';
    copyButton.disabled = true;
    
    setTimeout(() => {
      copyButton.innerHTML = originalText;
      copyButton.disabled = false;
    }, 2000);
  }).catch(() => {
    alert('Could not copy URL. Please copy manually: ' + url);
  });
}

function showError(message, url = null) {
  resultContainer.className = 'result-container unknown';
  resultContainer.style.display = 'block';
  resultIcon.textContent = '❌';
  resultText.textContent = 'Error';
  resultUrl.textContent = message;
  
  // If we have a URL, show action buttons
  if (url) {
    addActionButtons(url, 'unknown');
  }
}

function hideResult() {
  resultContainer.style.display = 'none';
}

// Track app usage to show install prompt only after user sees value
function trackAppUsage() {
  if (!hasUsedApp) {
    hasUsedApp = true;
    // Show install prompt after a short delay if user hasn't dismissed it
    setTimeout(() => {
      showInstallPromptIfAppropriate();
    }, 3000); // 3 seconds after first use
  }
}

// Detect platform and show appropriate install method
function showInstallPromptIfAppropriate() {
  // Don't show if already dismissed or installed
  if (localStorage.getItem('installPromptDismissed') || isAppInstalled()) {
    return;
  }
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isInStandaloneMode = window.navigator.standalone;
  
  if (isIOS && !isInStandaloneMode) {
    showIOSInstallInstructions();
  } else if (deferredPrompt) {
    showInstallBanner();
  }
}

// Check if app is already installed
function isAppInstalled() {
  return window.navigator.standalone || // iOS
         window.matchMedia('(display-mode: standalone)').matches; // Other platforms
}

// Show install banner for browsers that support beforeinstallprompt
function showInstallBanner() {
  const banner = document.getElementById('install-banner');
  const installBtn = document.getElementById('install-btn');
  const dismissBtn = document.getElementById('dismiss-btn');
  
  banner.style.display = 'block';
  
  installBtn.onclick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Install prompt result:', outcome);
      deferredPrompt = null;
      banner.style.display = 'none';
    }
  };
  
  dismissBtn.onclick = () => {
    banner.style.display = 'none';
    localStorage.setItem('installPromptDismissed', 'true');
  };
}

// Show iOS-specific install instructions
function showIOSInstallInstructions() {
  const banner = document.getElementById('install-banner');
  banner.innerHTML = `
    <div class="ios-install-instructions">
      <strong>📱 Install QRTrust</strong>
      Tap the Share button <span class="ios-share-icon">□↗</span> then "Add to Home Screen" for quick access
      <button onclick="this.parentElement.style.display='none'; localStorage.setItem('installPromptDismissed', 'true');" 
              style="position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: none; font-size: 1.2rem; cursor: pointer; opacity: 0.6;">×</button>
    </div>
  `;
  banner.style.display = 'block';
}

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Save the event so it can be triggered later
  deferredPrompt = e;
  console.log('Install prompt available');
});

// Listen for successful app installation
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  deferredPrompt = null;
  const banner = document.getElementById('install-banner');
  if (banner) banner.style.display = 'none';
});

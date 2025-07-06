# QRTrust

[![Netlify Status](https://api.netlify.com/api/v1/badges/b6e5435d-23a4-40d8-8397-17f60b803dc8/deploy-status)](https://app.netlify.com/projects/qrtrust/deploys)

A privacy-focused Progressive Web App (PWA) that scans QR codes and checks if they lead to known phishing sites before you visit them.

## 🚀 Features

- **Real-time QR Code Scanning** - Uses your device's camera to scan QR codes
- **Phishing Detection** - Checks URLs against PhishTank's database of known phishing sites
- **Privacy-First** - No URLs or personal data are logged
- **Progressive Web App** - Install on your device like a native app
- **Mobile-Optimized** - Responsive design for all devices
- **Security-Focused** - Clear warnings and safe browsing recommendations

## 🔍 How It Works

1. **Scan QR Code** - Point your camera at any QR code
2. **URL Analysis** - The app extracts the URL and checks it against [PhishTank's database](https://phishtank.org)
3. **Safety Assessment** - Get instant feedback:
   - ✅ **Safe** - URL appears clean, safe to visit
   - ⚠️ **Suspicious** - URL found in phishing database
   - ❓ **Unknown** - Unable to verify (service unavailable)
4. **Informed Decision** - Choose how to proceed with clear warnings and options

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **QR Scanner**: ZXing JavaScript library
- **Build Tool**: Vite
- **Deployment**: Netlify (with Functions)
- **Security API**: PhishTank
- **PWA**: Service Worker, Web App Manifest

## 📱 Installation

### Use the Live App
Visit [qrtrust.fyi](https://qrtrust.fyi) and install it as a PWA on your device.

### Deploy Your Own

#### Prerequisites
- Node.js 18+ 
- npm or yarn
- Netlify account (for deployment)

#### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/kevinl95/qrtrust.git
   cd qrtrust
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

#### Deploy to Netlify

1. **Fork this repository** to your GitHub account

2. **Connect to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub account
   - Select your forked repository

3. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

4. **Deploy**
   - Click "Deploy site"
   - Your app will be available at `https://your-site-name.netlify.app`


## 🔧 Configuration


### Customization
- **Styling**: Edit `src/style.css`
- **App Info**: Update `index.html` and `public/manifest.json`
- **Build Config**: Modify `vite.config.js`

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   QR Scanner    │──▶│   Main App       │──▶│  Netlify Func   │
│   (ZXing)       │    │   (JavaScript)   │    │   (CORS Proxy)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   User Interface │    │   PhishTank API │
                       │   (Results/UI)   │    │   (Threat DB)   │
                       └──────────────────┘    └─────────────────┘
```

### Key Components

- **Scanner Module** (`src/scanner.js`) - Camera access and QR code detection
- **PhishTank Module** (`src/phishtank.js`) - API communication
- **Main App** (`src/main.js`) - UI logic and user interactions
- **Netlify Function** (`netlify/functions/checkurl.js`) - CORS proxy for API calls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [PhishTank](https://phishtank.org/) - Community-driven phishing database
- [ZXing](https://github.com/zxing-js/library) - QR code scanning library
- [Netlify](https://netlify.com/) - Hosting and serverless functions

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/qrtrust/issues) page
2. Create a new issue with detailed information
3. Include your browser/device information and steps to reproduce
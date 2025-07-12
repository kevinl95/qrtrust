import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'QRTrust',
        short_name: 'QRTrust',
        description: 'Privacy-first QR code scanner with phishing protection',
        id: 'qrtrust-scanner',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ff5757',
        lang: 'en',
        dir: 'ltr',
        scope: '/',
        launch_handler: {
          client_mode: 'navigate-existing'
        },
        orientation: 'any',
        prefer_related_applications: false,
        icons: [
          // Android
          {
            src: 'android/android-launchericon-512-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'android/android-launchericon-192-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'android/android-launchericon-144-144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: 'android/android-launchericon-96-96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: 'android/android-launchericon-72-72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: 'android/android-launchericon-48-48.png',
            sizes: '48x48',
            type: 'image/png'
          },
          // iOS
          {
            src: 'ios/180.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'ios/192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'ios/512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'ios/1024.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any'
          }
        ],
        shortcuts: [
          {
            name: 'Scan QR code',
            url: '/',
            description: 'Scan a QR code'
          }
        ],
        screenshots: [
          {
            src: 'screenshots/desktop-screenshot.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'QRTrust desktop view'
          },
          {
            src: 'screenshots/mobile-screenshot.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'QRTrust mobile view'
          }
        ],
        categories: [
          'security',
          'utilities'
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      }
    })
  ]
});

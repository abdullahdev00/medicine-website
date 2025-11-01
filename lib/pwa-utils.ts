/**
 * PWA Detection Utilities
 * Simple functions to check PWA installation status
 */

export interface PWADetectionResult {
  isInstalled: boolean;
  isStandalone: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  displayMode: 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen';
  canInstall: boolean;
  installMethod: 'prompt' | 'manual' | 'none';
}

// Global variable to track install prompt availability
let installPromptAvailable = false;
let installPromptChecked = false;

/**
 * Check if beforeinstallprompt event is available (indicates app can be installed)
 */
export function checkInstallPromptAvailability(): Promise<boolean> {
  return new Promise((resolve) => {
    if (installPromptChecked) {
      resolve(installPromptAvailable);
      return;
    }

    const timeout = setTimeout(() => {
      installPromptChecked = true;
      installPromptAvailable = false;
      console.log('PWA: No install prompt available - likely already installed');
      resolve(false);
    }, 1000);

    const handleBeforeInstallPrompt = (e: Event) => {
      clearTimeout(timeout);
      installPromptChecked = true;
      installPromptAvailable = true;
      console.log('PWA: Install prompt available - app not installed');
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      resolve(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  });
}

/**
 * Check if PWA is currently installed - 100% browser-dependent
 * Uses multiple browser APIs to detect installation state
 */
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  // Method 1: Check if running in standalone mode (most reliable)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (isStandalone) {
    console.log('PWA: Detected via standalone mode');
    return true;
  }
  
  // Method 2: iOS Safari standalone check
  const isIOSStandalone = (window.navigator as any).standalone === true;
  if (isIOSStandalone) {
    console.log('PWA: Detected via iOS standalone');
    return true;
  }
  
  // Method 3: Android app referrer check
  if (document.referrer && document.referrer.includes('android-app://')) {
    console.log('PWA: Detected via Android app referrer');
    return true;
  }
  
  // Method 4: Check if install prompt is NOT available (reverse logic)
  // If beforeinstallprompt doesn't fire, app might be installed
  if (installPromptChecked && !installPromptAvailable) {
    const platform = detectPlatform();
    if (platform === 'desktop' || platform === 'android') {
      console.log('PWA: No install prompt available - likely installed');
      return true;
    }
  }
  
  console.log('PWA: Not detected as installed');
  return false;
}

/**
 * Check if PWA is running in standalone mode
 */
export function isPWAStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

/**
 * Detect user's platform
 */
export function detectPlatform(): 'ios' | 'android' | 'desktop' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  } else if (/android/.test(userAgent)) {
    return 'android';
  } else if (/windows|mac|linux/.test(userAgent)) {
    return 'desktop';
  }
  
  return 'unknown';
}

/**
 * Get current display mode
 */
export function getDisplayMode(): 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen' {
  if (typeof window === 'undefined') return 'browser';
  
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen';
  }
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui';
  }
  return 'browser';
}

/**
 * Check if PWA can be installed - purely browser-dependent
 */
export function canInstallPWA(): boolean {
  if (typeof window === 'undefined') return false;
  
  // If already installed, cannot install again
  if (isPWAInstalled()) {
    console.log('PWA: Cannot install - already installed');
    return false;
  }
  
  const platform = detectPlatform();
  
  // iOS can always manually install via Safari menu
  if (platform === 'ios') {
    console.log('PWA: Can install on iOS via manual method');
    return true;
  }
  
  // For other platforms, assume installable (will be refined by beforeinstallprompt)
  console.log('PWA: Potentially installable on', platform);
  return true;
}

/**
 * Get install method for current platform
 */
export function getInstallMethod(): 'prompt' | 'manual' | 'none' {
  if (isPWAInstalled()) return 'none';
  
  const platform = detectPlatform();
  
  if (platform === 'ios') return 'manual';
  if (platform === 'android' || platform === 'desktop') return 'prompt';
  
  return 'none';
}

/**
 * Get comprehensive PWA detection result (browser-dependent)
 */
export async function detectPWAStatus(): Promise<PWADetectionResult> {
  // First check if install prompt is available
  await checkInstallPromptAvailability();
  
  const isInstalled = isPWAInstalled();
  
  return {
    isInstalled,
    isStandalone: isPWAStandalone(),
    platform: detectPlatform(),
    displayMode: getDisplayMode(),
    canInstall: !isInstalled, // Can install only if not already installed
    installMethod: getInstallMethod(),
  };
}

/**
 * Mark PWA as installed in localStorage (only if actually installed)
 */
export function markPWAInstalled(): void {
  if (typeof window !== 'undefined' && isPWAInstalled()) {
    localStorage.setItem('pwa-installed', 'true');
    localStorage.setItem('pwa-install-date', new Date().toISOString());
  }
}

/**
 * Check if PWA was installed recently (within last 24 hours)
 */
export function isPWARecentlyInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  
  const installDate = localStorage.getItem('pwa-install-date');
  if (!installDate) return false;
  
  const installed = new Date(installDate);
  const now = new Date();
  const hoursDiff = (now.getTime() - installed.getTime()) / (1000 * 60 * 60);
  
  return hoursDiff < 24;
}

/**
 * Get PWA installation instructions for current platform
 */
export function getPWAInstructions(): { platform: string; steps: string[]; icon: string } {
  const platform = detectPlatform();
  
  switch (platform) {
    case 'ios':
      return {
        platform: 'iOS Safari',
        steps: [
          'Tap the Share button (⬆️) at the bottom of the screen',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to confirm installation',
          'The app will appear on your home screen'
        ],
        icon: '📱'
      };
    
    case 'android':
      return {
        platform: 'Android Chrome',
        steps: [
          'Tap the menu button (⋮) in the top right',
          'Select "Add to Home screen" or "Install app"',
          'Tap "Add" or "Install" to confirm',
          'The app will appear on your home screen'
        ],
        icon: '🤖'
      };
    
    case 'desktop':
      return {
        platform: 'Desktop Browser',
        steps: [
          'Look for the install icon (⬇️) in the address bar',
          'Click the install button when it appears',
          'Click "Install" in the confirmation dialog',
          'The app will open in its own window'
        ],
        icon: '💻'
      };
    
    default:
      return {
        platform: 'Unknown',
        steps: ['Installation method varies by browser and device'],
        icon: '🌐'
      };
  }
}

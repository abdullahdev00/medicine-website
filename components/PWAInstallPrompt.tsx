'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Download, Smartphone, Zap, WifiOff, Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isPWAInstalled, detectPlatform, checkInstallPromptAvailability } from "@/lib/pwa-utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [language, setLanguage] = useState<"en" | "ur">("ur");
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check PWA status with prompt availability
    const initializePWACheck = async () => {
      await checkInstallPromptAvailability();
      
      if (isPWAInstalled()) {
        console.log('PWA: Already installed, not showing prompt');
        return;
      }
      
      console.log('PWA: Not installed, proceeding with setup');
    };
    
    initializePWACheck();

    // Check last dismissal time
    const lastDismissed = localStorage.getItem("pwa-last-dismissed");
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    // If dismissed recently (within 5 minutes), don't show
    if (lastDismissed && (now - parseInt(lastDismissed)) < fiveMinutes) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      console.log('PWA: Install prompt available');
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA: App installed event fired');
      setShowPrompt(false);
      setDeferredPrompt(null);
      // Don't manually set localStorage, let isPWAInstalled() handle it
    };

    // Listen for manual install request from settings
    const handleManualInstallRequest = () => {
      if (deferredPrompt || detectPlatform() === 'ios') {
        setShowPrompt(true);
      }
    };

    // Check install status periodically and sync with browser
    const checkInstallStatus = async () => {
      await checkInstallPromptAvailability();
      const currentlyInstalled = isPWAInstalled();
      console.log('PWA: Periodic check - installed:', currentlyInstalled);
      
      if (currentlyInstalled) {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    };

    // Show prompt after 5 seconds if conditions are met
    const showPromptTimer = setTimeout(() => {
      console.log('PWA: Checking conditions after 5 seconds');
      console.log('PWA: isPWAInstalled():', isPWAInstalled());
      console.log('PWA: deferredPrompt:', !!deferredPrompt);
      console.log('PWA: platform:', detectPlatform());
      
      if (!isPWAInstalled()) {
        if (deferredPrompt || detectPlatform() === 'ios') {
          setShowPrompt(true);
          console.log('PWA: Showing install prompt');
        } else {
          console.log('PWA: No deferredPrompt available yet, will show when available');
          // For desktop browsers, show anyway after a delay
          setTimeout(() => {
            if (!isPWAInstalled() && !showPrompt) {
              setShowPrompt(true);
              console.log('PWA: Showing prompt anyway (desktop fallback)');
            }
          }, 2000);
        }
      }
    }, 5000);

    const installCheckInterval = setInterval(checkInstallStatus, 2000);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("pwa-install-requested", handleManualInstallRequest);

    return () => {
      clearTimeout(showPromptTimer);
      clearInterval(installCheckInterval);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("pwa-install-requested", handleManualInstallRequest);
    };
  }, []);

  const handleInstallClick = async () => {
    const platform = detectPlatform();
    
    if (platform === 'ios') {
      // For iOS, just show instructions and dismiss
      setShowPrompt(false);
      localStorage.setItem("pwa-last-dismissed", Date.now().toString());
      return;
    }
    
    if (!deferredPrompt) {
      // If no deferredPrompt, just dismiss and let user use browser button
      setShowPrompt(false);
      localStorage.setItem("pwa-last-dismissed", Date.now().toString());
      return;
    }

    setIsInstalling(true);
    
    try {
      // Show native install prompt
      await deferredPrompt.prompt();
      
      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('PWA: User choice:', outcome);
      // Don't manually set localStorage, let browser state detection handle it
    } catch (error) {
      console.error('Install failed:', error);
    }
    
    setIsInstalling(false);
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    // Store current timestamp for 5-minute cooldown
    localStorage.setItem("pwa-last-dismissed", Date.now().toString());
    setShowPrompt(false);
  };

  const content = {
    en: {
      title: "Install App",
      subtitle: "Get better experience",
      benefits: [
        { icon: Zap, text: "Faster & Smooth" },
        { icon: WifiOff, text: "Works Offline" },
        { icon: Smartphone, text: "Easy Access" },
      ],
      installButton: isInstalling ? "Installing..." : (detectPlatform() === 'ios' ? "Add to Home" : (deferredPrompt ? "Install" : "Install")),
      laterButton: "Later",
    },
    ur: {
      title: "App Install",
      subtitle: "Better experience hasil karein",
      benefits: [
        { icon: Zap, text: "Fast & Smooth" },
        { icon: WifiOff, text: "Offline Works" },
        { icon: Smartphone, text: "Easy Access" },
      ],
      installButton: isInstalling ? "Installing..." : (detectPlatform() === 'ios' ? "Home Screen Add" : (deferredPrompt ? "Install" : "Install")),
      laterButton: "Later",
    },
  };

  const currentContent = content[language];

  // Don't show if PWA is already installed or prompt not active
  if (isPWAInstalled() || !showPrompt) {
    return null;
  }

  // Show for iOS always, and for desktop even without deferredPrompt
  const platform = detectPlatform();
  console.log('PWA: Render check - platform:', platform, 'deferredPrompt:', !!deferredPrompt, 'showPrompt:', showPrompt);

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleDismiss}
          />

          {/* Install Prompt Card - Centered */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
          >
            <div className="w-full max-w-md pointer-events-auto">
              <Card className="p-6 shadow-2xl border-2 border-primary/20 rounded-3xl bg-background/95 backdrop-blur-lg">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Download className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" data-testid="text-install-title">
                        {currentContent.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {currentContent.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setLanguage(language === "en" ? "ur" : "en")}
                    data-testid="button-toggle-language"
                  >
                    <Languages className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={handleDismiss}
                    data-testid="button-dismiss"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2 mb-6">
                {currentContent.benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-sm font-medium">{benefit.text}</p>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={handleDismiss}
                  data-testid="button-later"
                >
                  {currentContent.laterButton}
                </Button>
                <Button
                  className="flex-1 rounded-full bg-primary hover:bg-primary/90"
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  data-testid="button-install"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {currentContent.installButton}
                </Button>
              </div>
              </Card>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

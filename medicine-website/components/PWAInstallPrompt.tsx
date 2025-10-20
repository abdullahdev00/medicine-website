import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Download, Smartphone, Zap, WifiOff, Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    // Check if user already dismissed the prompt
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    const installed = localStorage.getItem("pwa-installed");
    
    if (dismissed === "true" || installed === "true") {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 5 seconds of user interaction
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      localStorage.setItem("pwa-installed", "true");
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    // Listen for manual install request from settings
    const handleManualInstallRequest = () => {
      if (deferredPrompt) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("pwa-install-requested", handleManualInstallRequest);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("pwa-install-requested", handleManualInstallRequest);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    
    // Show native install prompt
    await deferredPrompt.prompt();
    
    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      localStorage.setItem("pwa-installed", "true");
    }
    
    setIsInstalling(false);
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-install-dismissed", "true");
    setShowPrompt(false);
  };

  const content = {
    en: {
      title: "Install MediSwift App",
      subtitle: "Get the best experience with our mobile app",
      benefits: [
        { icon: Zap, text: "Faster & Smoother Experience" },
        { icon: WifiOff, text: "Works Offline" },
        { icon: Smartphone, text: "Easy Access from Home Screen" },
      ],
      installButton: isInstalling ? "Installing..." : "Install Now",
      laterButton: "Maybe Later",
    },
    ur: {
      title: "MediSwift App Install Karein",
      subtitle: "Hamari mobile app ke saath behtar tajurba hasil karein",
      benefits: [
        { icon: Zap, text: "Tez aur Smooth Experience" },
        { icon: WifiOff, text: "Offline Kaam Karta Hai" },
        { icon: Smartphone, text: "Home Screen Se Aasan Access" },
      ],
      installButton: isInstalling ? "Install Ho Raha Hai..." : "Abhi Install Karein",
      laterButton: "Baad Mein",
    },
  };

  const currentContent = content[language];

  // Don't show if no install prompt available or already dismissed
  if (!deferredPrompt || !showPrompt) {
    return null;
  }

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

          {/* Install Prompt Card */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
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

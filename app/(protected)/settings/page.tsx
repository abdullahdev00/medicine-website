'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Languages, Download, Sun, Moon, Monitor } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { isPWAInstalled, detectPlatform, checkInstallPromptAvailability } from "@/lib/pwa-utils";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState<"en" | "ur">("en");
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("app-language") as "en" | "ur";
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
      
      // Check PWA installation status with prompt availability
      const checkPWAStatus = async () => {
        // First check if install prompt is available
        await checkInstallPromptAvailability();
        // Then check installation status
        const installed = isPWAInstalled();
        console.log('Settings: Initial PWA status:', installed);
        setPwaInstalled(installed);
      };
      
      checkPWAStatus();
      
      // Listen for beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };
      
      // Listen for app installed event
      const handleAppInstalled = () => {
        console.log('Settings: App installed event');
        setPwaInstalled(true);
        setDeferredPrompt(null);
      };
      
      // Check install status periodically and sync with browser
      const checkInstallStatus = async () => {
        // Re-check prompt availability periodically
        await checkInstallPromptAvailability();
        const currentStatus = isPWAInstalled();
        console.log('Settings: PWA status check:', currentStatus);
        setPwaInstalled(currentStatus);
      };
      
      const interval = setInterval(checkInstallStatus, 1500);
      
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
      
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
        clearInterval(interval);
      };
    }
  }, []);

  const handleLanguageChange = (lang: "en" | "ur") => {
    setLanguage(lang);
    localStorage.setItem("app-language", lang);
    toast({
      title: "Language Updated",
      description: `Language changed to ${lang === "en" ? "English" : "Roman Urdu"}`,
    });
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${newTheme === "system" ? "system default" : newTheme}`,
    });
  };

  const handleInstallApp = async () => {
    if (pwaInstalled) {
      toast({
        title: "Already Installed",
        description: "The app is already installed on your device",
      });
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          toast({
            title: "Installing...",
            description: "App is being installed",
          });
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Install failed:', error);
      }
    } else {
      // For iOS or when no prompt is available
      const platform = detectPlatform();
      if (platform === 'ios') {
        toast({
          title: "Install on iOS",
          description: "Tap Share button → Add to Home Screen",
        });
      } else {
        const event = new CustomEvent("pwa-install-requested");
        window.dispatchEvent(event);
        
        toast({
          title: "Install Prompt",
          description: "If install is available, the dialog will appear",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={() => router.push("/profile")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="font-serif text-2xl font-bold">
                Settings
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your app preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-lg rounded-3xl border-none">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Languages className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    Language
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred language
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={language === "en" ? "default" : "outline"}
                  className="h-14 rounded-full font-semibold"
                  onClick={() => handleLanguageChange("en")}
                  data-testid="button-language-english"
                >
                  English
                </Button>
                <Button
                  variant={language === "ur" ? "default" : "outline"}
                  className="h-14 rounded-full font-semibold"
                  onClick={() => handleLanguageChange("ur")}
                  data-testid="button-language-urdu"
                >
                  Roman Urdu
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg rounded-3xl border-none">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  {theme === "light" ? (
                    <Sun className="w-6 h-6 text-purple-500" />
                  ) : theme === "dark" ? (
                    <Moon className="w-6 h-6 text-purple-500" />
                  ) : (
                    <Monitor className="w-6 h-6 text-purple-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    Theme
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  className="h-14 rounded-full font-semibold flex flex-col gap-1 py-2"
                  onClick={() => handleThemeChange("light")}
                  data-testid="button-theme-light"
                >
                  <Sun className="w-5 h-5" />
                  <span className="text-xs">
                    Light
                  </span>
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  className="h-14 rounded-full font-semibold flex flex-col gap-1 py-2"
                  onClick={() => handleThemeChange("dark")}
                  data-testid="button-theme-dark"
                >
                  <Moon className="w-5 h-5" />
                  <span className="text-xs">
                    Dark
                  </span>
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  className="h-14 rounded-full font-semibold flex flex-col gap-1 py-2"
                  onClick={() => handleThemeChange("system")}
                  data-testid="button-theme-system"
                >
                  <Monitor className="w-5 h-5" />
                  <span className="text-xs">
                    System
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-lg rounded-3xl border-none">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Download className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    Install App
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Install MediSwift on your device
                  </p>
                </div>
              </div>

              <Button
                className={`w-full h-14 rounded-full font-semibold ${
                  pwaInstalled 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                }`}
                onClick={handleInstallApp}
                data-testid="button-install-app"
              >
                <Download className="w-5 h-5 mr-2" />
                {pwaInstalled 
                  ? "App Installed"
                  : "Install MediSwift App"
                }
              </Button>

              <div className="bg-accent/50 rounded-2xl p-4">
                <p className="text-sm text-muted-foreground">
                  Installing the app gives you faster access, offline support, and a better experience.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

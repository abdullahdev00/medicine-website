'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Languages, Download, Sun, Moon, Monitor } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState<"en" | "ur">("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("app-language") as "en" | "ur";
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    }
  }, []);

  const handleLanguageChange = (lang: "en" | "ur") => {
    setLanguage(lang);
    localStorage.setItem("app-language", lang);
    toast({
      title: lang === "en" ? "Language Updated" : "زبان تبدیل ہو گئی",
      description: lang === "en" ? "Language changed to English" : "زبان اردو میں تبدیل ہو گئی",
    });
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    toast({
      title: language === "en" ? "Theme Updated" : "تھیم تبدیل ہو گیا",
      description: language === "en" 
        ? `Theme changed to ${newTheme === "system" ? "system default" : newTheme}` 
        : `تھیم ${newTheme === "system" ? "سسٹم ڈیفالٹ" : newTheme === "light" ? "روشن" : "تاریک"} میں تبدیل ہو گیا`,
    });
  };

  const handleInstallApp = () => {
    const event = new CustomEvent("pwa-install-requested");
    window.dispatchEvent(event);
    
    toast({
      title: language === "en" ? "Install Prompt" : "انسٹال کریں",
      description: language === "en" 
        ? "If install is available, the dialog will appear" 
        : "اگر انسٹال دستیاب ہے تو ڈائیلاگ ظاہر ہوگا",
    });
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
                {language === "en" ? "Settings" : "ترتیبات"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {language === "en" ? "Manage your app preferences" : "اپنی ایپ کی ترجیحات کا انتظام کریں"}
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
                    {language === "en" ? "Language" : "زبان"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Choose your preferred language" : "اپنی پسندیدہ زبان منتخب کریں"}
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
                  اردو
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
                    {language === "en" ? "Theme" : "تھیم"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Choose your preferred theme" : "اپنا پسندیدہ تھیم منتخب کریں"}
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
                    {language === "en" ? "Light" : "روشن"}
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
                    {language === "en" ? "Dark" : "تاریک"}
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
                    {language === "en" ? "System" : "سسٹم"}
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
                    {language === "en" ? "Install App" : "ایپ انسٹال کریں"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" 
                      ? "Install MediSwift on your device" 
                      : "MediSwift کو اپنے آلے پر انسٹال کریں"}
                  </p>
                </div>
              </div>

              <Button
                className="w-full h-14 rounded-full font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                onClick={handleInstallApp}
                data-testid="button-install-app"
              >
                <Download className="w-5 h-5 mr-2" />
                {language === "en" ? "Install MediSwift App" : "MediSwift ایپ انسٹال کریں"}
              </Button>

              <div className="bg-accent/50 rounded-2xl p-4">
                <p className="text-sm text-muted-foreground">
                  {language === "en" 
                    ? "Installing the app gives you faster access, offline support, and a better experience." 
                    : "ایپ انسٹال کرنے سے آپ کو تیز رفتار رسائی، آف لائن سپورٹ، اور بہتر تجربہ ملتا ہے۔"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

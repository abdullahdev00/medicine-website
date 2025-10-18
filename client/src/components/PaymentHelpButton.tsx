import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { HelpCircle, Youtube, CreditCard, Upload, CheckCircle, Languages } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PaymentHelpButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  youtubeVideoId?: string;
}

const paymentInstructions = {
  en: {
    title: "How to Complete Online Payment",
    steps: [
      {
        icon: CreditCard,
        title: "Choose Payment Method",
        description: "Select your preferred bank account or mobile wallet (JazzCash, EasyPaisa, Bank Transfer)."
      },
      {
        icon: Upload,
        title: "Make Payment & Upload Receipt",
        description: "Transfer the exact amount to our account and take a screenshot or photo of the payment receipt."
      },
      {
        icon: CheckCircle,
        title: "Wait for Verification",
        description: "Our team will verify your payment within 24 hours. You'll receive a confirmation once approved."
      }
    ],
    importantNotes: [
      "Make sure the payment amount matches exactly with your order total",
      "Upload a clear image of your payment receipt",
      "Keep your transaction ID safe for reference",
      "Payment verification may take up to 24 hours",
    ],
    bankDetails: {
      title: "Our Bank Details",
      accounts: [
        { bank: "Bank Account", details: "Will be shown on checkout page" },
        { bank: "JazzCash", details: "Will be shown on checkout page" },
        { bank: "EasyPaisa", details: "Will be shown on checkout page" },
      ]
    }
  },
  ur: {
    title: "Online Payment Kaise Karein",
    steps: [
      {
        icon: CreditCard,
        title: "Payment Method Choose Karein",
        description: "Apna pasandida bank account ya mobile wallet (JazzCash, EasyPaisa, Bank Transfer) select karein."
      },
      {
        icon: Upload,
        title: "Payment Karein aur Receipt Upload Karein",
        description: "Exact amount hamari account mein transfer karein aur payment receipt ka screenshot ya photo lein."
      },
      {
        icon: CheckCircle,
        title: "Verification Ka Wait Karein",
        description: "Hamari team 24 ghanton mein aapki payment verify karegi. Approve hone par aapko confirmation milegi."
      }
    ],
    importantNotes: [
      "Payment amount order total se bilkul match hona chahiye",
      "Payment receipt ki clear image upload karein",
      "Apna transaction ID safe rakhein reference ke liye",
      "Payment verification mein 24 ghante lag sakte hain",
    ],
    bankDetails: {
      title: "Hamari Bank Details",
      accounts: [
        { bank: "Bank Account", details: "Checkout page par dikhaya jayega" },
        { bank: "JazzCash", details: "Checkout page par dikhaya jayega" },
        { bank: "EasyPaisa", details: "Checkout page par dikhaya jayega" },
      ]
    }
  }
};

export function PaymentHelpButton({ 
  variant = "outline", 
  size = "sm", 
  className = "",
  youtubeVideoId = "dQw4w9WgXcQ"
}: PaymentHelpButtonProps) {
  const [language, setLanguage] = useState<"en" | "ur">("ur");
  const content = paymentInstructions[language];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          data-testid="button-payment-help"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Payment Help
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-800"
        data-testid="sheet-payment-help"
      >
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {content.title}
            </SheetTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "ur" : "en")}
              className="flex items-center gap-2"
              data-testid="button-toggle-language"
            >
              <Languages className="w-4 h-4" />
              {language === "en" ? "Roman Urdu" : "English"}
            </Button>
          </div>
          <SheetDescription className="text-gray-600 dark:text-gray-400">
            {language === "en" 
              ? "Follow these simple steps to complete your online payment securely" 
              : "Online payment safely complete karne ke liye in simple steps ko follow karein"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Video Tutorial */}
          <Card className="p-6 border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2 mb-4">
              <Youtube className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === "en" ? "Video Tutorial" : "Video Tutorial"}
              </h3>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                title="Payment Tutorial Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="border-0"
                data-testid="iframe-youtube-video"
              />
            </div>
          </Card>

          {/* Step by Step Instructions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === "en" ? "Step by Step Guide" : "Step by Step Guide"}
            </h3>
            <div className="space-y-4">
              {content.steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card key={index} className="p-4 border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {index + 1}. {step.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-800" />

          {/* Important Notes */}
          <Card className="p-6 border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {language === "en" ? "⚠️ Important Notes" : "⚠️ Zaroori Batein"}
            </h3>
            <ul className="space-y-2">
              {content.importantNotes.map((note, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Bank Details Preview */}
          <Card className="p-6 border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {content.bankDetails.title}
            </h3>
            <div className="space-y-2">
              {content.bankDetails.accounts.map((account, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{account.bank}:</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 italic">{account.details}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { HelpCircle, Youtube, CreditCard, Upload, CheckCircle, Languages, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PaymentHelpButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
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
  variant = "ghost", 
  size = "icon", 
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
          <HelpCircle className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] overflow-y-auto rounded-t-[2rem] border-t-2 p-0"
        data-testid="sheet-payment-help"
      >
        {/* Header - Filter Style */}
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Guideline</h2>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    data-testid="button-language-dropdown"
                  >
                    <Languages className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => setLanguage("en")}
                    data-testid="menu-item-english"
                  >
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setLanguage("ur")}
                    data-testid="menu-item-urdu"
                  >
                    Roman Urdu
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  data-testid="button-close-sheet"
                >
                  <X className="w-5 h-5" />
                </Button>
              </SheetClose>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Video Tutorial */}
          <Card className="p-6 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-4">
              <Youtube className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-semibold">
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
            <h3 className="text-lg font-semibold mb-4">
              {language === "en" ? "Step by Step Guide" : "Step by Step Guide"}
            </h3>
            <div className="space-y-4">
              {content.steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card key={index} className="p-4 rounded-2xl hover:border-primary/50 transition-colors">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">
                          {index + 1}. {step.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Important Notes */}
          <Card className="p-6 rounded-2xl border-amber-500/30 bg-amber-500/5">
            <h3 className="text-lg font-semibold mb-3">
              {language === "en" ? "⚠️ Important Notes" : "⚠️ Zaroori Batein"}
            </h3>
            <ul className="space-y-2">
              {content.importantNotes.map((note, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Bank Details Preview */}
          <Card className="p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-3">
              {content.bankDetails.title}
            </h3>
            <div className="space-y-2">
              {content.bankDetails.accounts.map((account, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="font-medium">{account.bank}:</span>
                  <span className="text-sm text-muted-foreground italic">{account.details}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}

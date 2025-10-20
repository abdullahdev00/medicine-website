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
import { HelpCircle, Share2, DollarSign, Users, Languages, TrendingUp, X, Youtube } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AffiliateHelpButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  youtubeVideoId?: string;
}

const affiliateGuidelines = {
  en: {
    title: "Affiliate Program Guidelines",
    subtitle: "Learn how to maximize your earnings",
    steps: [
      {
        icon: Share2,
        title: "Share Your Code",
        description: "Share your unique affiliate code with friends, family, and on social media to reach more people."
      },
      {
        icon: Users,
        title: "Get Referrals",
        description: "When someone uses your code to place an order, they become your referral and you earn commission."
      },
      {
        icon: DollarSign,
        title: "Earn Commission",
        description: "Earn 10% commission on every order placed using your referral code. Commission is added to your wallet."
      },
      {
        icon: TrendingUp,
        title: "Track Performance",
        description: "Monitor your referrals, total orders, and earnings in real-time from your affiliate dashboard."
      }
    ],
    tips: [
      "Share your code on WhatsApp groups, Facebook, and Instagram",
      "Explain the benefits of ordering from MediSwift to your referrals",
      "Commission is paid when the order is delivered",
      "You can withdraw your earnings anytime from your wallet",
      "Higher referrals = higher earnings potential",
    ],
    commissionInfo: {
      title: "Commission Structure",
      details: [
        { label: "Standard Commission", value: "10% of order value" },
        { label: "Minimum Order", value: "Rs. 100" },
        { label: "Payment Time", value: "After delivery" },
        { label: "Withdrawal", value: "Anytime from wallet" },
      ]
    }
  },
  ur: {
    title: "Affiliate Program Guidelines",
    subtitle: "Apni kamai kaise barhayein",
    steps: [
      {
        icon: Share2,
        title: "Apna Code Share Karein",
        description: "Apna unique affiliate code doston, family aur social media par share karein."
      },
      {
        icon: Users,
        title: "Referrals Hasil Karein",
        description: "Jab koi aapka code use karke order karega, wo aapka referral ban jayega aur aapko commission milegi."
      },
      {
        icon: DollarSign,
        title: "Commission Kamayein",
        description: "Har order par 10% commission kamayein jo aapke code se place ho. Commission aapke wallet mein add hoga."
      },
      {
        icon: TrendingUp,
        title: "Performance Track Karein",
        description: "Apne referrals, total orders, aur earnings ko real-time mein apne affiliate dashboard se monitor karein."
      }
    ],
    tips: [
      "Apna code WhatsApp groups, Facebook, aur Instagram par share karein",
      "Apne referrals ko MediSwift se order karne ke fayde batayein",
      "Commission tab milta hai jab order deliver ho jata hai",
      "Aap apni earnings kabhi bhi wallet se withdraw kar sakte hain",
      "Zyada referrals = zyada kamayi",
    ],
    commissionInfo: {
      title: "Commission Structure",
      details: [
        { label: "Standard Commission", value: "Order ki 10%" },
        { label: "Minimum Order", value: "Rs. 100" },
        { label: "Payment Time", value: "Delivery ke baad" },
        { label: "Withdrawal", value: "Wallet se kabhi bhi" },
      ]
    }
  }
};

export function AffiliateHelpButton({ 
  variant = "ghost", 
  size = "icon", 
  className = "",
  youtubeVideoId = "dQw4w9WgXcQ"
}: AffiliateHelpButtonProps) {
  const [language, setLanguage] = useState<"en" | "ur">("ur");
  const content = affiliateGuidelines[language];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          data-testid="button-affiliate-help"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] overflow-y-auto rounded-t-[2rem] border-t-2 p-0"
        data-testid="sheet-affiliate-help"
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
          <Card className="p-6 rounded-2xl border-2 border-chart-5/30 bg-chart-5/5">
            <div className="flex items-center gap-2 mb-4">
              <Youtube className="w-5 h-5 text-chart-5" />
              <h3 className="text-lg font-semibold">
                {language === "en" ? "Video Tutorial" : "Video Tutorial"}
              </h3>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                title="Affiliate Tutorial Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="border-0"
                data-testid="iframe-youtube-video"
              />
            </div>
          </Card>

          {/* Step by Step Guide */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {language === "en" ? "How It Works" : "Kaise Kaam Karta Hai"}
            </h3>
            <div className="space-y-4">
              {content.steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card key={index} className="p-4 rounded-2xl hover:border-primary/50 transition-colors">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-chart-5/20 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-chart-5" />
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

          {/* Commission Info */}
          <Card className="p-6 rounded-2xl border-chart-5/30 bg-chart-5/5">
            <h3 className="text-lg font-semibold mb-4">
              {content.commissionInfo.title}
            </h3>
            <div className="space-y-3">
              {content.commissionInfo.details.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <span className="font-medium text-muted-foreground">{item.label}</span>
                  <span className="font-semibold text-chart-5">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Separator />

          {/* Tips */}
          <Card className="p-6 rounded-2xl border-amber-500/30 bg-amber-500/5">
            <h3 className="text-lg font-semibold mb-3">
              {language === "en" ? "💡 Pro Tips" : "💡 Khaas Tips"}
            </h3>
            <ul className="space-y-2">
              {content.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}

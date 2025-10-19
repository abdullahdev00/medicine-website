import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 shadow-xl rounded-3xl border-none">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="flex mb-6 gap-4 items-center">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif">404 - Page Not Found</h1>
              <p className="text-sm text-muted-foreground mt-1">
                The page you're looking for doesn't exist
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-muted-foreground mb-6">
            The page you are trying to access could not be found. It may have been moved or deleted.
          </p>

          <Link href="/">
            <Button className="w-full rounded-full h-12 text-base font-semibold" data-testid="button-go-home">
              Go to Home Page
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

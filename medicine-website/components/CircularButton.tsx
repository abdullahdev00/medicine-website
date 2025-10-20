import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface CircularButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  testId?: string;
  className?: string;
}

export function CircularButton({ icon: Icon, onClick, testId, className = "" }: CircularButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`rounded-full w-10 h-10 bg-background border border-border hover:bg-accent ${className}`}
      data-testid={testId}
    >
      <Icon className="w-5 h-5" />
    </Button>
  );
}

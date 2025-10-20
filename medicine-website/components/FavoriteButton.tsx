import { Heart } from "lucide-react";

interface FavoriteButtonProps {
  isWishlisted?: boolean;
  onClick: (e: React.MouseEvent) => void;
  testId?: string;
}

export function FavoriteButton({ isWishlisted, onClick, testId }: FavoriteButtonProps) {
  return (
    <button
      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all shadow-lg"
      onClick={onClick}
      data-testid={testId}
    >
      <Heart
        className={`w-4 h-4 ${
          isWishlisted 
            ? "fill-primary text-primary" 
            : "text-white"
        }`}
      />
    </button>
  );
}

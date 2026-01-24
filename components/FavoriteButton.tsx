import { Heart, Loader2 } from "lucide-react";

interface FavoriteButtonProps {
  isWishlisted?: boolean;
  onClick: (e: React.MouseEvent) => void;
  testId?: string;
  isLoading?: boolean;
}

export function FavoriteButton({ isWishlisted, onClick, testId, isLoading }: FavoriteButtonProps) {
  return (
    <button
      className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all shadow-lg ${
        isLoading ? "cursor-not-allowed opacity-75" : ""
      }`}
      onClick={onClick}
      data-testid={testId}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 text-white animate-spin" />
      ) : (
        <Heart
          className={`w-4 h-4 ${
            isWishlisted 
              ? "fill-primary text-primary" 
              : "text-white"
          }`}
        />
      )}
    </button>
  );
}

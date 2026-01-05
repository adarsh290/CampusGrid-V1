import { Badge } from "@/components/ui/badge";
import { Game } from "@/types";
import { cn } from "@/lib/utils";

interface GameCardProps {
  game: Game;
  onViewDetails: (game: Game) => void;
  userOwnedGames?: string[];
  onPurchaseSuccess?: () => void;
}

export function GameCard({ game, onViewDetails }: GameCardProps) {

  return (
    <div
      className={cn(
        "group relative glass-card overflow-hidden cursor-pointer",
        "transition-all duration-500 ease-out",
        "hover:scale-[1.02] hover:border-primary/50",
        "hover:shadow-[0_8px_40px_hsl(263,70%,66%/0.2)]"
      )}
      onClick={() => onViewDetails(game)}
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant={game.price === 0 ? "default" : "secondary"}
            className={cn(
              "text-sm font-bold px-3 py-1",
              game.price === 0 ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
            )}
          >
            {game.price === 0 ? "FREE" : `₹${game.price}`}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {game.title}
        </h3>
      </div>
    </div>
  );
}
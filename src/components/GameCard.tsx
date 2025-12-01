import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HardDrive, Star } from "lucide-react";
import { Game } from "@/data/games";
import { cn } from "@/lib/utils";

interface GameCardProps {
  game: Game;
  onViewDetails: (game: Game) => void;
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
        {/* Overlay */}
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

        {/* Rating */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm">
          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-medium">{game.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Genre */}
        <Badge variant="outline" className="mb-2 text-xs border-border/50 text-muted-foreground">
          {game.genre}
        </Badge>

        {/* Title */}
        <h3 className="font-display font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {game.title}
        </h3>

        {/* File Size */}
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <HardDrive className="h-4 w-4" />
          <span className="text-sm font-medium">{game.fileSize}</span>
        </div>

        {/* CTA */}
        <Button
          variant="glass"
          className="w-full group-hover:bg-primary/20 group-hover:border-primary/50 transition-all duration-300"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(game);
          }}
        >
          View Details
        </Button>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 blur-xl" />
      </div>
    </div>
  );
}

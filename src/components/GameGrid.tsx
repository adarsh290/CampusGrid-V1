import { Game } from "@/types";
import { GameCard } from "./GameCard";

interface GameGridProps {
  games: Game[];
  onViewDetails: (game: Game) => void;
}

export function GameGrid({ games, onViewDetails }: GameGridProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold mb-2">
              Game <span className="text-gradient-purple">Catalog</span>
            </h2>
            <p className="text-muted-foreground">
              Browse and download games over the campus LAN
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <div
              key={game.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <GameCard game={game} onViewDetails={onViewDetails} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

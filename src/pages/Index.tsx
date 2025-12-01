import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { GameGrid } from "@/components/GameGrid";
import { GameDetailModal } from "@/components/GameDetailModal";
import { games, Game } from "@/data/games";

const Index = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const featuredGame = games[1]; // Cyberpunk 2077 as featured

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero */}
        <HeroSection game={featuredGame} onViewDetails={setSelectedGame} />

        {/* Game Grid */}
        <GameGrid games={games} onViewDetails={setSelectedGame} />

        {/* Footer */}
        <footer className="border-t border-border/50 py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 CampusGrid • IIT Ropar Intranet Game Distribution
            </p>
            <p className="text-muted-foreground/60 text-xs mt-2">
              Download speeds up to 1 Gbps over campus LAN
            </p>
          </div>
        </footer>
      </main>

      {/* Game Detail Modal */}
      <GameDetailModal
        game={selectedGame}
        open={!!selectedGame}
        onClose={() => setSelectedGame(null)}
      />
    </div>
  );
};

export default Index;

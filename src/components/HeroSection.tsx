import { Button } from "@/components/ui/button";
import { Play, Download, Star } from "lucide-react";
import { Game } from "@/data/games";

interface HeroSectionProps {
  game: Game;
  onViewDetails: (game: Game) => void;
}

export function HeroSection({ game, onViewDetails }: HeroSectionProps) {
  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${game.heroImage || game.coverImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        {/* Animated grid overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="max-w-2xl">
          {/* Featured Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 animate-float">
            <Star className="h-4 w-4 text-accent fill-accent" />
            <span className="text-sm font-medium text-accent">Featured Game</span>
          </div>

          {/* Title */}
          <h1 className="font-display text-5xl md:text-7xl font-black mb-4 leading-tight">
            <span className="text-gradient-purple">{game.title}</span>
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-muted-foreground">
            <span className="px-3 py-1 rounded-full bg-secondary text-sm">{game.genre}</span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              {game.rating}
            </span>
            <span>{game.releaseYear}</span>
            <span className="font-semibold text-accent">{game.fileSize}</span>
          </div>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {game.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button
              variant="neonPurple"
              size="xl"
              onClick={() => onViewDetails(game)}
              className="group"
            >
              <Download className="h-5 w-5 transition-transform group-hover:scale-110" />
              Get Now - ₹{game.price}
            </Button>
            <Button variant="glass" size="xl" className="group">
              <Play className="h-5 w-5 transition-transform group-hover:scale-110" />
              Watch Trailer
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
    </section>
  );
}

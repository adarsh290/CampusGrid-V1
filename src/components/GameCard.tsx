import { motion } from "framer-motion";
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
    <motion.div
      className={cn(
        "group relative glass-card overflow-hidden cursor-pointer",
        "border border-white/5"
      )}
      onClick={() => onViewDetails(game)}
      // Entry animation — driven by the parent's stagger container
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      // Hover & tap micro-interactions
      whileHover={{
        scale: 1.025,
        borderColor: "hsl(263 70% 66% / 0.5)",
        boxShadow: "0 8px 40px hsl(263 70% 66% / 0.18)",
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <motion.img
          src={game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.07 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant={game.price === 0 ? "default" : "secondary"}
            className={cn(
              "text-sm font-bold px-3 py-1",
              game.price === 0
                ? "bg-accent text-accent-foreground"
                : "bg-primary text-primary-foreground"
            )}
          >
            {game.price === 0 ? "FREE" : `₹${game.price}`}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <motion.h3
          className="font-display font-bold text-lg mb-2 line-clamp-1 text-foreground"
          whileHover={{ color: "hsl(263 70% 66%)" }}
          transition={{ duration: 0.2 }}
        >
          {game.title}
        </motion.h3>
      </div>

      {/* Subtle shine effect on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0, background: "linear-gradient(135deg, hsl(263 70% 66% / 0) 0%, hsl(263 70% 66% / 0.06) 50%, hsl(263 70% 66% / 0) 100%)" }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
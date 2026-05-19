import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { GameCard } from "@/components/GameCard";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";
import { Game } from "@/types";

// ── Data fetcher ───────────────────────────────────────────────────────────────
const fetchGames = async (): Promise<Game[]> => {
  const res = await fetch("/api/games");
  if (!res.ok) throw new Error("Failed to load games");
  const data = await res.json();
  return data.map((game: Record<string, unknown>) => ({
    ...game,
    id: game._id,
    rating: (game.rating as number) || 4.5,
    fileSize: "N/A",
  }));
};

// ── Stagger container for the game grid ───────────────────────────────────────
const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

// ── Skeleton card for loading state ──────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-white/5" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
      </div>
    </div>
  );
}

const Index = () => {
  const navigate = useNavigate();

  const {
    data: games = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["games"],
    queryFn: fetchGames,
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0a0a0a] text-foreground selection:bg-primary/20">
        <Navbar />

        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

          <div className="container relative z-10">
            {/* Hero heading */}
            <motion.div
              className="text-center max-w-3xl mx-auto mb-16 space-y-4"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/50">
                CampusGrid
              </h1>
              <p className="text-muted-foreground text-lg">
                Your campus game store
              </p>
            </motion.div>

            {/* Error state */}
            {isError && (
              <div className="text-center col-span-3 text-destructive py-12">
                Failed to load games. Please try again.
              </div>
            )}

            {/* Skeleton loading state */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Staggered game grid */}
            {!isLoading && !isError && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={gridVariants}
                initial="hidden"
                animate="visible"
              >
                {games.map((game) => (
                  <GameCard
                    key={game.id || game._id}
                    game={game}
                    onViewDetails={() => {
                      const gameSlug = game.title.toLowerCase().replace(/ /g, "-");
                      navigate(`/explore/${gameSlug}`);
                    }}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Index;
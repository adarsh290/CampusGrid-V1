import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GameCard } from "@/components/GameCard";
import { Navbar } from "@/components/Navbar";
import { Game, User } from "@/types";

const Index = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("/api/games");
        const data = await response.json();
        
        const formattedGames = data.map((game: any) => ({
          ...game,
          id: game._id,
          rating: game.rating || 4.5,
          fileSize: "N/A", 
        }));

        setGames(formattedGames);
      } catch (error) {
        console.error("Failed to fetch games:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCurrentUser(null);
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data);
          // Update localStorage
          localStorage.setItem("user", JSON.stringify(data));
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        setCurrentUser(null);
      }
    };

    fetchGames();
    fetchCurrentUser();
  }, []);

  const handlePurchaseSuccess = async () => {
    // Refresh user data after purchase
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground selection:bg-primary/20">
      
      {/* 1. HERE IS THE NAVBAR */}
      <Navbar /> 

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        
        <div className="container relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/50">
              CampusGrid
            </h1>
          </div>

          {/* GAME GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="text-white text-center col-span-3">Loading Store...</div>
            ) : (
              games.map((game) => (
                <div key={game.id || game._id} className="animate-fade-in">
                  <GameCard 
                    game={game} 
                    onViewDetails={() => {
                      const gameSlug = game.title.toLowerCase().replace(/ /g, '-');
                      navigate(`/explore/${gameSlug}`);
                    }}
                    userOwnedGames={currentUser?.library?.map((g: any) => g._id || g) || []}
                    onPurchaseSuccess={handlePurchaseSuccess}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
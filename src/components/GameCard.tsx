import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HardDrive, Star, Download, Lock, ShoppingCart, IndianRupee } from "lucide-react";
import { Game } from "@/types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface GameCardProps {
  game: Game;
  onViewDetails: (game: Game) => void;
  userOwnedGames?: string[];
  onPurchaseSuccess?: () => void;
}

export function GameCard({ game, onViewDetails, userOwnedGames = [], onPurchaseSuccess }: GameCardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const gameId = game._id || game.id;
  const isOwned = userOwnedGames.includes(gameId || "");

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 1. Check for Login (We need an Auth Token to request a Download Token)
    const authToken = localStorage.getItem('token');
    
    if (!authToken) {
      toast({
        title: "Login Required",
        description: "You must be logged in to download games.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // 2. Step 1: Request the "One-Time Ticket" (Download Token)
      // Note: We send the Auth Token in the header to prove who we are
      const response = await fetch(`http://localhost:5000/api/games/${gameId}/token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get download token");
      }

      // 3. Step 2: Use the Ticket to start the Download
      console.log("🎟️ Ticket Received:", data.token);
      toast({ title: "Download Starting", description: "Your secure stream is initializing..." });
      
      // Redirect browser to the secure stream
      window.location.href = `http://localhost:5000/api/games/download?token=${data.token}`;

    } catch (error: any) {
      console.error("Download Error:", error);
      toast({
        title: "Access Denied",
        description: error.message, // e.g., "You do not own this game"
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const authToken = localStorage.getItem('token');
    
    if (!authToken) {
      toast({
        title: "Login Required",
        description: "You must be logged in to purchase games.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/orders/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ gameId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message === "Insufficient Funds") {
          toast({
            title: "Insufficient Funds",
            description: "You don't have enough balance to purchase this game.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.message || "Purchase failed");
        }
        return;
      }

      // Update local storage with new balance
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.walletBalance = data.walletBalance;
        user.library = data.library.map((g: any) => g._id || g.id);
        localStorage.setItem("user", JSON.stringify(user));
      }

      toast({
        title: "Purchase Successful",
        description: "Game added to your library!",
      });

      // Call callback to refresh parent component
      if (onPurchaseSuccess) {
        onPurchaseSuccess();
      }

    } catch (error: any) {
      console.error("Purchase Error:", error);
      toast({
        title: "Purchase Failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

        <div className="flex gap-2 mt-4">
            <Button
              variant="glass"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(game);
              }}
            >
              Details
            </Button>

            {isOwned ? (
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                onClick={handleDownload}
                disabled={loading}
              >
                {loading ? "Verifying..." : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </>
                )}
              </Button>
            ) : (
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-0"
                onClick={handleBuy}
                disabled={loading}
              >
                {loading ? "Processing..." : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Buy for <IndianRupee className="h-3 w-3 mx-1" />{game.price}
                  </>
                )}
              </Button>
            )}
        </div>
      </div>
    </div>
  );
}
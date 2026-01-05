import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Download, ArrowLeft, IndianRupee, Calendar, User as UserIcon } from "lucide-react";
import { Game, User } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const ExplorePage = () => {
  const { gameSlug } = useParams<{ gameSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [game, setGame] = useState<Game | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        // Fetch all games and find the one matching the slug
        const response = await fetch("/api/games");
        const games = await response.json();
        
        const foundGame = games.find((g: Game) => {
          const slug = g.title.toLowerCase().replace(/ /g, '-');
          return slug === gameSlug;
        });

        if (foundGame) {
          setGame({
            ...foundGame,
            id: foundGame._id,
          });
        } else {
          toast({
            title: "Game not found",
            description: "The game you're looking for doesn't exist.",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Failed to fetch game:", error);
        toast({
          title: "Error",
          description: "Failed to load game details.",
          variant: "destructive",
        });
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
          localStorage.setItem("user", JSON.stringify(data));
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    if (gameSlug) {
      fetchGame();
      fetchCurrentUser();
    }
  }, [gameSlug, navigate, toast]);

  const isOwned = currentUser?.library?.some((g: any) => {
    const gameId = typeof g === 'string' ? g : (g._id || g.id);
    return gameId === (game?._id || game?.id);
  }) || false;

  const handleBuy = async () => {
    const authToken = localStorage.getItem('token');
    
    if (!authToken) {
      toast({
        title: "Login Required",
        description: "You must be logged in to purchase games.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!game) return;

    const gameId = game._id || game.id;
    if (!gameId) return;

    // Check wallet balance
    if (currentUser && currentUser.walletBalance < game.price) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance to purchase this game.",
        variant: "destructive",
      });
      return;
    }

    setPurchasing(true);

    try {
      const response = await fetch("/api/orders/buy", {
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

      // Update local storage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.walletBalance = data.walletBalance;
        user.library = data.library.map((g: any) => g._id || g.id);
        localStorage.setItem("user", JSON.stringify(user));
        setCurrentUser(user);
      }

      toast({
        title: "Purchase Successful",
        description: "Game added to your library!",
      });
    } catch (error: any) {
      console.error("Purchase Error:", error);
      toast({
        title: "Purchase Failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-muted-foreground">Loading game details...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-muted-foreground">Game not found</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Store
          </Button>
        </div>
      </div>
    );
  }

  // Check if screenshots exist and are valid
  const hasScreenshots = game.screenshots && Array.isArray(game.screenshots) && game.screenshots.length > 0;
  const screenshots = hasScreenshots ? game.screenshots : [];

  // Check if systemRequirements exist and have at least one non-empty field
  const hasSystemRequirements = game.systemRequirements && 
    typeof game.systemRequirements === 'object' &&
    Object.values(game.systemRequirements).some((val: any) => val && typeof val === 'string' && val.trim() !== '');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Store
          </Button>

          <div className="grid grid-cols-12 gap-8">
            {/* Main Column - 8 columns */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* Screenshot Carousel - Only show if screenshots exist */}
              {hasScreenshots && (
                <div className="glass-card p-4">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {screenshots.map((screenshot, index) => (
                        <CarouselItem key={index}>
                          <img
                            src={screenshot}
                            alt={`${game.title} screenshot ${index + 1}`}
                            className="w-full h-[500px] object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = game.coverImage;
                            }}
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {screenshots.length > 1 && (
                      <>
                        <CarouselPrevious />
                        <CarouselNext />
                      </>
                    )}
                  </Carousel>
                </div>
              )}

              {/* About Section */}
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {game.description}
                </p>
              </div>

              {/* System Requirements - Only show if requirements exist */}
              {hasSystemRequirements && (
                <div className="glass-card p-6">
                  <h2 className="text-2xl font-bold mb-4">System Requirements</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <tbody className="text-sm">
                        {game.systemRequirements?.os && game.systemRequirements.os.trim() && (
                          <tr className="border-b border-border/50">
                            <td className="py-3 px-4 font-semibold text-muted-foreground w-1/3">OS</td>
                            <td className="py-3 px-4">{game.systemRequirements.os}</td>
                          </tr>
                        )}
                        {game.systemRequirements?.processor && game.systemRequirements.processor.trim() && (
                          <tr className="border-b border-border/50">
                            <td className="py-3 px-4 font-semibold text-muted-foreground w-1/3">Processor</td>
                            <td className="py-3 px-4">{game.systemRequirements.processor}</td>
                          </tr>
                        )}
                        {game.systemRequirements?.memory && game.systemRequirements.memory.trim() && (
                          <tr className="border-b border-border/50">
                            <td className="py-3 px-4 font-semibold text-muted-foreground w-1/3">Memory</td>
                            <td className="py-3 px-4">{game.systemRequirements.memory}</td>
                          </tr>
                        )}
                        {game.systemRequirements?.graphics && game.systemRequirements.graphics.trim() && (
                          <tr className="border-b border-border/50">
                            <td className="py-3 px-4 font-semibold text-muted-foreground w-1/3">Graphics</td>
                            <td className="py-3 px-4">{game.systemRequirements.graphics}</td>
                          </tr>
                        )}
                        {game.systemRequirements?.storage && game.systemRequirements.storage.trim() && (
                          <tr>
                            <td className="py-3 px-4 font-semibold text-muted-foreground w-1/3">Storage</td>
                            <td className="py-3 px-4">{game.systemRequirements.storage}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - 4 columns */}
            <div className="col-span-12 lg:col-span-4">
              <div className="glass-card p-6 sticky top-24">
                <div className="space-y-6">
                  {/* Cover Image */}
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    className="w-full rounded-lg mb-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x400?text=No+Image";
                    }}
                  />

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">
                      {game.price === 0 ? "FREE" : `₹${game.price}`}
                    </span>
                    <Badge variant="outline" className="text-sm">
                      {game.genre}
                    </Badge>
                  </div>

                  {/* Buy Now Button */}
                  {!isOwned && (
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg"
                      onClick={handleBuy}
                      disabled={purchasing}
                    >
                      {purchasing ? (
                        "Processing..."
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Buy Now
                        </>
                      )}
                    </Button>
                  )}

                  {isOwned && (
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg"
                      onClick={() => navigate("/library")}
                    >
                      <Download className="mr-2 h-5 w-5" />
                      In Library
                    </Button>
                  )}

                  {/* Metadata */}
                  <div className="space-y-3 pt-4 border-t border-border/50">
                    {game.developer && (
                      <div className="flex items-center gap-2 text-sm">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Developer:</span>
                        <span className="font-medium">{game.developer}</span>
                      </div>
                    )}
                    {game.createdAt && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Release Date:</span>
                        <span className="font-medium">
                          {new Date(game.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExplorePage;


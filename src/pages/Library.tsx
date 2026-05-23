import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { LibraryCard } from "@/components/LibraryCard";
import { Loader2, Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

const Library = () => {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingGameId, setDownloadingGameId] = useState<string | null>(null);
  const { toast } = useToast();
  // Bug 16/21 fixed: use AuthContext for token instead of manual localStorage reads
  const { token } = useAuth();

  // Bug 21 fixed: use the dedicated /api/orders/library endpoint
  useEffect(() => {
    const fetchLibrary = async () => {
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const response = await fetch("/api/orders/library", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          // Transform DB data — localFilePath is already stripped by the endpoint
          const formattedGames = data.library.map((game: any) => ({
            ...game,
            id: game._id,
          }));
          setGames(formattedGames);
        } else if (response.status === 401) {
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Failed to fetch library:", error);
        toast({
          title: "Error",
          description: "Failed to load your library. Please refresh.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [token]);

  const handleDownload = async (gameId: string) => {
    if (!gameId) {
      toast({
        title: "Error",
        description: "Game ID is missing. Cannot download.",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: "Login Required",
        description: "You must be logged in to download games.",
        variant: "destructive",
      });
      return;
    }

    setDownloadingGameId(gameId);
    toast({ title: "Preparing Download...", description: "Please wait." });

    try {
      // Step 1: Get download token from backend
      const tokenResponse = await fetch(`/api/download/token/${gameId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({ message: "Failed to generate download token" }));
        throw new Error(errorData.message || "Failed to generate download token");
      }

      const { executionUrl } = await tokenResponse.json();

      if (!executionUrl) {
        throw new Error("No execution URL received from server");
      }

      // Step 2: Trigger browser download using window.location.href
      toast({ title: "Download Starting", description: "Your download will begin shortly..." });
      window.location.href = executionUrl;

    } catch (err: any) {
      console.error("Download error:", err);
      toast({
        title: "Error",
        description: err.message || "Could not start download.",
        variant: "destructive",
      });
    } finally {
      setDownloadingGameId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="font-display text-4xl font-bold mb-2">
              My <span className="text-primary">Library</span>
            </h1>
            <p className="text-muted-foreground">
              {games.length} games in your collection
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : games.length === 0 ? (
            /* EMPTY STATE */
            <div className="text-center py-20 border border-border/50 rounded-xl bg-secondary/10">
              <Gamepad2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-foreground">Your library is empty</h3>
              <p className="text-muted-foreground mb-6">Visit the Store to add games!</p>
              <Link to="/">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Browse Store
                </Button>
              </Link>
            </div>
          ) : (
            /* LIBRARY GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {games.map((game, index) => (
                <div key={game.id || game._id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <LibraryCard
                    game={game}
                    onDownload={handleDownload}
                    loading={downloadingGameId === (game.id || game._id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Library;
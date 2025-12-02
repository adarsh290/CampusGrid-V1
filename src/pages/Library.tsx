import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle2, HardDrive, Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Library = () => {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // 1. FETCH REAL DATA
  useEffect(() => {
    const fetchLibrary = async () => {
      const token = localStorage.getItem('token');
      if (!token) { window.location.href = "/login"; return; }

      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const user = await response.json();
            // Transform DB data to match your UI structure
            const formattedGames = user.library.map((game: any) => ({
              ...game,
              id: game._id,
              // We create a "Fake" part so your UI layout stays perfect
              downloadParts: [
                { name: "Base Game Installer", size: "Unknown GB", downloaded: false }
              ]
            }));
            setGames(formattedGames);
        }
      } catch (error) {
        console.error("Failed to fetch library:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  // 2. REAL DOWNLOAD LOGIC
  const handleDownload = async (gameId: string) => {
    try {
        const token = localStorage.getItem('token');
        toast({ title: "Requesting Secure Link...", description: "Please wait." });
        
        const res = await fetch(`http://localhost:5000/api/games/${gameId}/token`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if(!res.ok) throw new Error("Failed to get token");
        
        const data = await res.json();
        window.location.href = `http://localhost:5000/api/games/download?token=${data.token}`;
        
        toast({ title: "Download Started", description: "Check your browser downloads." });
    } catch(err) {
        toast({ title: "Error", description: "Could not start download.", variant: "destructive" });
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
                <HardDrive className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-2xl font-bold mb-2">Library Empty</h3>
                <Link to="/">
                  <Button className="mt-4 bg-primary hover:bg-primary/90 text-white">Browse Store</Button>
                </Link>
             </div>
          ) : (
             /* LIBRARY GRID */
             <div className="space-y-6">
                {games.map((game, index) => {
                  // Default progress logic (since we don't track real parts yet)
                  const progress = 0; 
                  const isComplete = false;

                  return (
                    <div
                      key={game.id}
                      className={cn(
                        "glass-card p-6 animate-fade-in",
                        "hover:border-primary/30 transition-all duration-300"
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Cover */}
                        <div className="shrink-0">
                          <img
                            src={game.coverImage}
                            alt={game.title}
                            className="w-32 h-44 object-cover rounded-lg shadow-lg"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                              <h3 className="font-display text-xl font-bold mb-1">{game.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <HardDrive className="h-4 w-4" />
                                  {game.fileSize || "N/A"}
                                </span>
                                <Badge variant="outline" className="text-xs">{game.genre}</Badge>
                              </div>
                            </div>

                            {/* MAIN ACTION BUTTON */}
                            <Button 
                                className="shrink-0 bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                                onClick={() => handleDownload(game.id)}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download Installer
                            </Button>
                          </div>

                          {/* Progress Bar (Visual Only for now) */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Installation Status</span>
                              <span className="font-medium text-primary">Not Installed</span>
                            </div>
                            <Progress value={0} className="h-2 bg-secondary" />
                          </div>

                          {/* Parts List (Visual Only) */}
                          <div className="space-y-2">
                            {game.downloadParts.map((part: any, partIndex: number) => (
                              <div
                                key={partIndex}
                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                                  <div>
                                    <p className="font-medium text-sm">{part.name}</p>
                                    <p className="text-xs text-muted-foreground">Single File Archive</p>
                                  </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-primary hover:text-primary hover:bg-primary/10"
                                    onClick={() => handleDownload(game.id)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Get
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Library;
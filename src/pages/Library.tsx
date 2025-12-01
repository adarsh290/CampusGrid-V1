import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { userLibrary } from "@/data/games";
import { Download, CheckCircle2, Pause, HardDrive, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const Library = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold mb-2">
              My <span className="text-gradient-green">Library</span>
            </h1>
            <p className="text-muted-foreground">
              {userLibrary.length} games in your collection
            </p>
          </div>

          {/* Library Grid */}
          <div className="space-y-6">
            {userLibrary.map((game, index) => {
              const downloadedParts = game.downloadParts.filter(p => p.downloaded).length;
              const totalParts = game.downloadParts.length;
              const progress = (downloadedParts / totalParts) * 100;
              const isComplete = progress === 100;

              return (
                <div
                  key={game.id}
                  className={cn(
                    "glass-card p-6 animate-fade-in",
                    "hover:border-accent/50 transition-all duration-300"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Cover */}
                    <div className="shrink-0">
                      <img
                        src={game.coverImage}
                        alt={game.title}
                        className="w-32 h-44 object-cover rounded-lg"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-display text-xl font-bold">{game.title}</h3>
                            {isComplete && (
                              <Badge className="bg-accent text-accent-foreground">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Ready to Play
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <HardDrive className="h-4 w-4" />
                              {game.fileSize}
                            </span>
                            <span>{game.genre}</span>
                          </div>
                        </div>

                        {isComplete ? (
                          <Button variant="neonGreen" size="lg" className="shrink-0">
                            <Play className="h-5 w-5" />
                            Launch
                          </Button>
                        ) : (
                          <Button variant="neonPurple" size="lg" className="shrink-0 animate-glow">
                            <Download className="h-5 w-5" />
                            Continue
                          </Button>
                        )}
                      </div>

                      {/* Overall Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Download Progress</span>
                          <span className="font-medium text-accent">{downloadedParts}/{totalParts} parts</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* Download Parts */}
                      <div className="space-y-2">
                        {game.downloadParts.map((part, partIndex) => (
                          <div
                            key={partIndex}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg",
                              part.downloaded ? "bg-accent/10 border border-accent/30" : "bg-secondary/50 border border-border/50"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              {part.downloaded ? (
                                <CheckCircle2 className="h-5 w-5 text-accent" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                              )}
                              <div>
                                <p className="font-medium text-sm">{part.name}</p>
                                <p className="text-xs text-muted-foreground">{part.size}</p>
                              </div>
                            </div>

                            {!part.downloaded && (
                              <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {userLibrary.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
                <HardDrive className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">No games yet</h3>
              <p className="text-muted-foreground mb-6">
                Browse the catalog and add games to your library
              </p>
              <Button variant="neonPurple" asChild>
                <a href="/">Browse Games</a>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Library;

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Bug 13 fixed: import Game from @/types (live API type), not from @/data/games (old mock type)
import { Game } from "@/types";
import { HardDrive, Calendar, Building, Monitor, Cpu, MemoryStick, CircuitBoard, X } from "lucide-react";

interface GameDetailModalProps {
  game: Game | null;
  open: boolean;
  onClose: () => void;
}

export function GameDetailModal({ game, open, onClose }: GameDetailModalProps) {
  if (!game) return null;

  // The live Game type uses a flat systemRequirements object (not min/recommended split).
  // Render it accordingly.
  const hasSystemRequirements =
    game.systemRequirements &&
    typeof game.systemRequirements === "object" &&
    Object.values(game.systemRequirements).some(
      (v: any) => v && typeof v === "string" && v.trim() !== ""
    );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-border/50 p-0">
        {/* Hero Image */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={game.coverImage}
            alt={game.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Title Overlay */}
          <div className="absolute bottom-4 left-6 right-6">
            <Badge className="mb-2 bg-primary/90">{game.genre}</Badge>
            <h2 className="font-display text-3xl font-black text-foreground">{game.title}</h2>
          </div>
        </div>

        <div className="p-6">
          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 mb-6">
            {game.developer && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{game.developer}</span>
              </div>
            )}
            {game.createdAt && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">{new Date(game.createdAt).getFullYear()}</span>
              </div>
            )}
          </div>

          <Tabs defaultValue="about" className="w-full">
            <TabsList className="w-full bg-secondary/50 mb-4">
              <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
              {hasSystemRequirements && (
                <TabsTrigger value="requirements" className="flex-1">Requirements</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="about" className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{game.description}</p>
              </div>
            </TabsContent>

            {hasSystemRequirements && (
              <TabsContent value="requirements" className="space-y-4">
                {/* Flat system requirements (API format) */}
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <h4 className="font-semibold text-primary mb-4">System Requirements</h4>
                  <div className="space-y-3">
                    {game.systemRequirements?.os && (
                      <RequirementRow icon={Monitor} label="OS" value={game.systemRequirements.os} />
                    )}
                    {game.systemRequirements?.processor && (
                      <RequirementRow icon={Cpu} label="CPU" value={game.systemRequirements.processor} />
                    )}
                    {game.systemRequirements?.memory && (
                      <RequirementRow icon={MemoryStick} label="RAM" value={game.systemRequirements.memory} />
                    )}
                    {game.systemRequirements?.graphics && (
                      <RequirementRow icon={CircuitBoard} label="GPU" value={game.systemRequirements.graphics} />
                    )}
                    {game.systemRequirements?.storage && (
                      <RequirementRow icon={HardDrive} label="Storage" value={game.systemRequirements.storage} />
                    )}
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RequirementRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

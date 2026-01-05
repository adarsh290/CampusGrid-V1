import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface LibraryCardProps {
  game: {
    _id?: string;
    id?: string;
    title: string;
    coverImage: string;
    genre?: string;
  };
  onDownload: (gameId: string) => void;
  loading?: boolean;
}

export function LibraryCard({ game, onDownload, loading }: LibraryCardProps) {
  const gameId = game._id || game.id || "";

  return (
    <div
      className={cn(
        "group relative glass-card overflow-hidden",
        "transition-all duration-500 ease-out",
        "hover:scale-[1.02] hover:border-primary/50",
        "hover:shadow-[0_8px_40px_hsl(263,70%,66%/0.2)]"
      )}
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/300x400?text=No+Image";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-bold text-lg mb-4 line-clamp-2 group-hover:text-primary transition-colors">
          {game.title}
        </h3>

        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]"
          onClick={() => onDownload(gameId)}
          disabled={loading}
        >
          <Download className="h-4 w-4 mr-2" />
          {loading ? "Preparing..." : "Download Now"}
        </Button>
      </div>
    </div>
  );
}


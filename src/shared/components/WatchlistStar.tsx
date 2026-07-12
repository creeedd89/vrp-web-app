"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";

interface WatchlistStarProps {
  contractId: string;
  initialIsWatchlisted: boolean;
}

export default function WatchlistStar({ contractId, initialIsWatchlisted }: WatchlistStarProps) {
  const { data: session } = useSession();
  const [isWatchlisted, setIsWatchlisted] = useState(initialIsWatchlisted);
  const [isLoading, setIsLoading] = useState(false);

  const toggleWatchlist = async () => {
    if (!session?.user) {
      alert("Please sign in to save contracts to your watchlist.");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contractId }),
      });
      
      const data = await res.json();
      if (data.status === "added") {
        setIsWatchlisted(true);
      } else if (data.status === "removed") {
        setIsWatchlisted(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleWatchlist} 
      disabled={isLoading}
      className={`p-1.5 rounded-lg transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"}`}
      title={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
    >
      <Star 
        size={14} 
        fill={isWatchlisted ? "#EAB308" : "transparent"} 
        stroke={isWatchlisted ? "#EAB308" : "var(--text-muted)"} 
      />
    </button>
  );
}

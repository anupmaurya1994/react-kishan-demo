import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface StatusBadgeProps {
  status: "Verified" | "Unverified";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isVerified = status === "Verified";
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors",
      isVerified 
        ? "bg-primary/10 text-primary border-primary/20" 
        : "bg-muted text-muted-foreground border-white/5"
    )}>
      {isVerified ? (
        <Check className="w-3 h-3" />
      ) : (
        <X className="w-3 h-3" />
      )}
      {status}
    </div>
  );
}

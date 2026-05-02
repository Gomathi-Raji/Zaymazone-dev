import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const LoadingSpinner = ({ 
  size = "md", 
  text = "Loading...", 
  className = "" 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <motion.div 
      className={cn("flex items-center justify-center gap-2", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
    </motion.div>
  );
};

interface InfiniteLoadingProps {
  isLoading: boolean;
  hasMore: boolean;
}

export const InfiniteLoading = ({ isLoading, hasMore }: InfiniteLoadingProps) => {
  if (!isLoading && !hasMore) {
    return (
      <motion.div 
        className="text-center py-8 text-muted-foreground"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p>You've reached the end of our collection</p>
        <p className="text-sm mt-1">Discover more amazing crafts by adjusting your filters</p>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <motion.div 
        className="flex justify-center py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <LoadingSpinner text="Loading more products..." />
      </motion.div>
    );
  }

  return null;
};
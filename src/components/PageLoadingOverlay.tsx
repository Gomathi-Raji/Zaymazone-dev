import { usePageLoading } from '@/contexts/PageLoadingContext';
import { Loader2 } from 'lucide-react';

export function PageLoadingOverlay() {
  const { isLoading } = usePageLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999] flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-24 h-24">
          <Loader2 className="w-24 h-24 text-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20"></div>
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Loading...</p>
          <p className="text-sm text-muted-foreground mt-2">Please wait</p>
        </div>
      </div>
    </div>
  );
}

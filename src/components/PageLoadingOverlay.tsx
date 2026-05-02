import { usePageLoading } from '@/contexts/PageLoadingContext';
import LoadingSpinner from './LoadingSpinner';

export function PageLoadingOverlay() {
  const { isLoading } = usePageLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto">
        <LoadingSpinner size="lg" text="" />
      </div>
    </div>
  );
}

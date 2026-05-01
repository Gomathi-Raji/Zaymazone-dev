import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface PageLoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const PageLoadingContext = createContext<PageLoadingContextType | undefined>(undefined);

export function PageLoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return (
    <PageLoadingContext.Provider value={{ isLoading, setIsLoading: setLoading }}>
      {children}
    </PageLoadingContext.Provider>
  );
}

export function usePageLoading() {
  const context = useContext(PageLoadingContext);
  if (!context) {
    throw new Error('usePageLoading must be used within PageLoadingProvider');
  }
  return context;
}

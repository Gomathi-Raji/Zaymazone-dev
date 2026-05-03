import { useState, useCallback } from "react";
import type { Product as ApiProduct } from "@/lib/api";
import type { Product as MockProduct } from "@/data/products";
import { toast } from "sonner";

type ComparisonProduct = ApiProduct | MockProduct;

export const useProductComparison = () => {
  const [comparisonProducts, setComparisonProducts] = useState<ComparisonProduct[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const addToComparison = useCallback((product: ComparisonProduct) => {
    setComparisonProducts(prev => {
      // Check if already in comparison
      if (prev.find(p => p.id === product.id)) {
        toast.error("Product already in comparison");
        return prev;
      }

      // Limit to 4 products
      if (prev.length >= 4) {
        toast.error("Maximum 4 products can be compared at once");
        return prev;
      }

      toast.success(`${product.name} added to comparison`);
      return [...prev, product];
    });
  }, []);

  const removeFromComparison = useCallback((productId: string) => {
    setComparisonProducts(prev => {
      const updated = prev.filter(p => p.id !== productId);
      if (updated.length === 0) {
        setIsComparisonOpen(false);
      }
      return updated;
    });
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonProducts([]);
    setIsComparisonOpen(false);
  }, []);

  const openComparison = useCallback(() => {
    if (comparisonProducts.length === 0) {
      toast.error("No products to compare. Add some products first.");
      return;
    }
    setIsComparisonOpen(true);
  }, [comparisonProducts.length]);

  const closeComparison = useCallback(() => {
    setIsComparisonOpen(false);
  }, []);

  return {
    comparisonProducts,
    isComparisonOpen,
    addToComparison,
    removeFromComparison,
    clearComparison,
    openComparison,
    closeComparison,
    comparisonCount: comparisonProducts.length
  };
};
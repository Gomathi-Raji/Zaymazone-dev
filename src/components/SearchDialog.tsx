import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Star, MapPin } from "lucide-react";
import { api, getImageUrl, type Product } from "@/lib/api";
import { Link } from "react-router-dom";

export const SearchDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const recentSearches = ["pottery", "handwoven textiles", "brass items", "wooden toys"];

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const handle = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await api.getProducts({ q: query, limit: 8, page: 1 });
        setResults(data.products || []);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(handle);
  }, [searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="hidden sm:flex">
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Search Products</DialogTitle>
          <DialogDescription>Find your perfect handcrafted item</DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for products, artisans, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {!searchQuery && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <Badge
                    key={search}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setSearchQuery(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {searchQuery && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                  Search Results ({results.length})
                </h3>
                {results.length > 0 && (
                  <Link to={`/shop?q=${encodeURIComponent(searchQuery)}`} onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {isSearching ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Searching...</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No products found for "{searchQuery}"</p>
                    <p className="text-sm">Try different keywords or browse our categories</p>
                  </div>
                ) : (
                  results.slice(0, 5).map((product) => (
                    <Link 
                      key={product.id} 
                      to={`/product/${product.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <img 
                        src={getImageUrl(product.images[0])} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground line-clamp-1">{product.name}</h4>
                        {product.artisan && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <MapPin className="w-3 h-3" />
                            <span>{product.artisan.name}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">₹{product.price.toLocaleString()}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{product.rating}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
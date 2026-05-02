import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Filter } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductComparison } from "@/components/ProductComparison";
import { ComparisonFloatingButton } from "@/components/ComparisonFloatingButton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProductComparison } from "@/hooks/useProductComparison";
import { useProducts } from "@/hooks/useProducts";
import { sortOptions } from "@/data/products";
import { Product } from "@/lib/api";

const Shop = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [handmadeFilter, setHandmadeFilter] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const {
    comparisonProducts,
    isComparisonOpen,
    addToComparison,
    removeFromComparison,
    clearComparison,
    openComparison,
    closeComparison,
    comparisonCount
  } = useProductComparison();

  // Fetch products from API
  const { data: productsData, isLoading, error } = useProducts({
    limit: 100, // Get a reasonable amount for client-side filtering
  });

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    if (!productsData?.products) return [];
    
    const filtered = productsData.products.filter(product => {
      // Search query
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(product.artisan?.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      
      // Category filter
      if (categoryFilter !== "all" && product.category !== categoryFilter) {
        return false;
      }
      
      // Price filter
      if (priceFilter !== "all") {
        if (priceFilter === "under-1000" && product.price >= 1000) return false;
        if (priceFilter === "1000-5000" && (product.price < 1000 || product.price > 5000)) return false;
        if (priceFilter === "5000-10000" && (product.price < 5000 || product.price > 10000)) return false;
        if (priceFilter === "above-10000" && product.price <= 10000) return false;
      }
      
      // Handmade filter
      if (handmadeFilter && !product.isHandmade) {
        return false;
      }
      
      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "popular":
          return b.reviewCount - a.reviewCount;
        case "newest":
        default:
          return 0; // Keep original order for newest
      }
    });

    return filtered;
  }, [productsData?.products, searchQuery, sortBy, categoryFilter, priceFilter, handmadeFilter]);

  const handleQuickView = (product: Product) => {
    // Open product in modal or redirect to product page
    const productId = (product as any)._id || product.id;
    window.location.href = `/product/${productId}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Search */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Shop Artisan Crafts
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Discover authentic handcrafted treasures from skilled artisans across India
            </p>
          </div>

          {/* Main Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search products, artisans, or materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg rounded-xl border-2 border-transparent focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Main Content Layout - 4 Section Structure */}
                {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full bg-card border rounded-lg p-4 flex items-center justify-between hover:bg-muted transition-colors"
          >
            <div className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              <span className="font-medium">Filters & Sort</span>
            </div>
            <SlidersHorizontal className={`w-5 h-5 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>

          {showMobileFilters && (
            <div className="mt-4 bg-card rounded-lg p-4 border space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="pottery">Pottery</SelectItem>
                      <SelectItem value="textiles">Textiles</SelectItem>
                      <SelectItem value="crafts">Crafts</SelectItem>
                      <SelectItem value="jewelry">Jewelry</SelectItem>
                      <SelectItem value="woodwork">Woodwork</SelectItem>
                      <SelectItem value="metalwork">Metalwork</SelectItem>
                      <SelectItem value="paintings">Paintings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Price Range</label>
                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under-1000">Under ₹1,000</SelectItem>
                      <SelectItem value="1000-5000">₹1,000 - ₹5,000</SelectItem>
                      <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
                      <SelectItem value="above-10000">Above ₹10,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(option => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Handmade Filter */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="handmade-mobile"
                    checked={handmadeFilter}
                    onChange={(e) => setHandmadeFilter(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="handmade-mobile" className="text-sm font-medium cursor-pointer">
                    Handmade Only
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Layout - True 3 Column Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Column 1: Filters Sidebar */}
          <div className="hidden lg:block lg:col-span-1 order-2 lg:order-1">
            <div className="bg-card rounded-xl p-4 lg:p-6 border shadow-sm sticky top-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h3>

              <div className="space-y-4 lg:space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="pottery">Pottery</SelectItem>
                      <SelectItem value="textiles">Textiles</SelectItem>
                      <SelectItem value="crafts">Crafts</SelectItem>
                      <SelectItem value="jewelry">Jewelry</SelectItem>
                      <SelectItem value="woodwork">Woodwork</SelectItem>
                      <SelectItem value="metalwork">Metalwork</SelectItem>
                      <SelectItem value="paintings">Paintings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Price Range</label>
                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under-1000">Under ₹1,000</SelectItem>
                      <SelectItem value="1000-5000">₹1,000 - ₹5,000</SelectItem>
                      <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
                      <SelectItem value="above-10000">Above ₹10,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Handmade Filter */}
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={handmadeFilter}
                      onChange={(e) => setHandmadeFilter(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">Handmade Only</span>
                  </label>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(option => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Products Grid - Main Content */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <div>
                <h2 className="text-xl lg:text-2xl font-semibold text-foreground">Products</h2>
                <p className="text-sm lg:text-base text-muted-foreground">
                  {filteredAndSortedProducts.length} of {productsData?.pagination?.total || 0} products
                  {searchQuery && (
                    <span> for "<span className="font-medium">{searchQuery}</span>"</span>
                  )}
                </p>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="text-center py-12 lg:py-16">
                <div className="animate-spin rounded-full h-10 w-10 lg:h-12 lg:w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 lg:py-16">
                <div className="bg-red-50 rounded-lg p-6 lg:p-8">
                  <h3 className="text-lg lg:text-xl font-semibold text-red-800 mb-2">Error loading products</h3>
                  <p className="text-red-600 text-sm lg:text-base">
                    {error instanceof Error ? error.message : 'Failed to load products'}
                  </p>
                </div>
              </div>
            ) : filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 lg:gap-6">
                {filteredAndSortedProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={handleQuickView}
                    onAddToComparison={addToComparison}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 lg:py-16">
                <div className="bg-gray-50 rounded-lg p-6 lg:p-8">
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4 text-sm lg:text-base">
                    Try adjusting your search terms or filters
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
                      setPriceFilter("all");
                      setHandmadeFilter(false);
                    }}
                    className="text-primary hover:underline text-sm lg:text-base"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Additional Features Sidebar */}
          <div className="hidden lg:block lg:col-span-1 order-3">
            <div className="space-y-4 lg:space-y-6">
              {/* Quick Stats */}
              <div className="bg-card rounded-xl p-4 lg:p-6 border shadow-sm">
                <h3 className="font-semibold text-base lg:text-lg mb-3 lg:mb-4">Quick Stats</h3>
                <div className="space-y-2 lg:space-y-3">
                  <div className="flex justify-between text-sm lg:text-base">
                    <span className="text-muted-foreground">Total Products</span>
                    <span className="font-medium">{productsData?.pagination?.total || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm lg:text-base">
                    <span className="text-muted-foreground">Categories</span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex justify-between text-sm lg:text-base">
                    <span className="text-muted-foreground">Artisans</span>
                    <span className="font-medium">50+</span>
                  </div>
                </div>
              </div>

              {/* Product Comparison */}
              {comparisonCount > 0 && (
                <div className="bg-card rounded-xl p-4 lg:p-6 border shadow-sm">
                  <h3 className="font-semibold text-base lg:text-lg mb-3 lg:mb-4">Compare Products</h3>
                  <p className="text-sm text-muted-foreground mb-3 lg:mb-4">
                    {comparisonCount} product{comparisonCount > 1 ? 's' : ''} selected
                  </p>
                  <button
                    onClick={openComparison}
                    className="w-full bg-primary text-primary-foreground px-3 lg:px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm lg:text-base"
                  >
                    Compare Now
                  </button>
                </div>
              )}

              {/* Popular Categories */}
              <div className="bg-card rounded-xl p-4 lg:p-6 border shadow-sm">
                <h3 className="font-semibold text-base lg:text-lg mb-3 lg:mb-4">Popular Categories</h3>
                <div className="space-y-2">
                  {[
                    { name: 'Pottery', count: '25 items' },
                    { name: 'Textiles', count: '32 items' },
                    { name: 'Woodwork', count: '18 items' },
                    { name: 'Jewelry', count: '15 items' }
                  ].map(category => (
                    <button
                      key={category.name}
                      onClick={() => setCategoryFilter(category.name.toLowerCase())}
                      className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="font-medium text-sm lg:text-base">{category.name}</div>
                      <div className="text-xs lg:text-sm text-muted-foreground">{category.count}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Pagination & Footer Actions */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredAndSortedProducts.length} products
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
                Previous
              </button>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                1
              </button>
              <button className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Comparison Components */}
      <ComparisonFloatingButton
        count={comparisonCount}
        onOpen={openComparison}
        onClear={clearComparison}
      />

      <ProductComparison
        products={comparisonProducts}
        isOpen={isComparisonOpen}
        onClose={closeComparison}
        onRemoveProduct={removeFromComparison}
      />

      <Footer />
    </div>
  );
};

export default Shop;
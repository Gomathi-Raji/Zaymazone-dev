import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useProductComparison } from "@/hooks/useProductComparison";
import { motion } from "framer-motion";
import { Star, MapPin, Award, Sparkles, Users, Heart } from "lucide-react";

export const FeaturedProducts = () => {
  const { addToComparison } = useProductComparison();

  // Get products from API - show first 6 as featured since backend doesn't support featured filtering
  const { data: productsData, isLoading, error } = useProducts({ limit: 6 });
  let featuredProducts = productsData?.products || [];

  // Development logging
  if (import.meta.env.DEV) {
    console.log('Featured Products State:', { isLoading, error, count: featuredProducts.length, productsData });
  }

  // Show loading state
  if (isLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Featured Artisan Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-80 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Featured Artisan Products</h2>
          <div className="text-center text-red-600">
            <p>Failed to load products. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  // Show empty state
  if (!isLoading && featuredProducts.length === 0) {
    if (import.meta.env.DEV) {
      console.warn('No products loaded from API');
    }
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Featured Artisan Products</h2>
          <div className="text-center text-gray-500">
            <p>No featured products available yet.</p>
          </div>
        </div>
      </section>
    );
  }

  // Use mock data only in development for testing
  if (import.meta.env.DEV && (!isLoading && featuredProducts.length === 0)) {
    console.warn('DEV MODE: Using mock data for testing');
    featuredProducts = [
      {
        id: "1",
        name: "Handwoven Silk Scarf",
        description: "Beautiful handwoven silk scarf with intricate traditional patterns",
        price: 2500,
        originalPrice: 3000,
        images: ["/assets/silk-scarf.jpg"],
        rating: 4.5,
        reviewCount: 24,
        inStock: true,
        stockCount: 10,
        category: "Textiles",
        subcategory: "Scarves",
        materials: ["Silk"],
        dimensions: "180cm x 45cm x 0.1cm",
        weight: "0.2kg",
        colors: ["Red", "Blue", "Green"],
        artisan: {
          id: "1",
          name: "Priya Kumar",
          location: "Varanasi, India",
          bio: "Master weaver with 20 years experience in traditional silk weaving techniques",
          avatar: "/assets/artisan-avatar-1.jpg",
          rating: 4.8,
          totalProducts: 25
        },
        tags: ["handwoven", "silk", "traditional"],
        isHandmade: true,
        shippingTime: "5-7 days",
        featured: true
      },
      {
        id: "2",
        name: "Blue Pottery Vase",
        description: "Traditional blue pottery vase with hand-painted floral motifs",
        price: 1800,
        originalPrice: 2200,
        images: ["/assets/blue-pottery-set.jpg"],
        rating: 4.3,
        reviewCount: 18,
        inStock: true,
        stockCount: 5,
        category: "Pottery",
        subcategory: "Vases",
        materials: ["Clay", "Glaze"],
        dimensions: "15cm x 15cm x 25cm",
        weight: "1.2kg",
        colors: ["Blue", "White"],
        artisan: {
          id: "2",
          name: "Rajesh Mehra",
          location: "Jaipur, India",
          bio: "Traditional pottery artisan specializing in Rajasthani blue pottery",
          avatar: "/assets/artisan-avatar-2.jpg",
          rating: 4.6,
          totalProducts: 18
        },
        tags: ["pottery", "traditional", "blue"],
        isHandmade: true,
        shippingTime: "3-5 days",
        featured: true
      },
      {
        id: "3",
        name: "Brass Decorative Bowl",
        description: "Handcrafted brass decorative bowl with intricate engraving",
        price: 1200,
        originalPrice: 1500,
        images: ["/assets/brass-bowl.jpg"],
        rating: 4.7,
        reviewCount: 32,
        inStock: true,
        stockCount: 8,
        category: "Metal Craft",
        subcategory: "Decorative",
        materials: ["Brass"],
        dimensions: "20cm x 20cm x 8cm",
        weight: "0.8kg",
        colors: ["Gold", "Brass"],
        artisan: {
          id: "3",
          name: "Anita Sharma",
          location: "Moradabad, India",
          bio: "Expert in metal craft with specialization in brass work",
          avatar: "/assets/artisan-avatar-3.jpg",
          rating: 4.9,
          totalProducts: 40
        },
        tags: ["brass", "decorative", "metal"],
        isHandmade: true,
        shippingTime: "4-6 days",
        featured: true
      }
    ];
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <section className="relative py-12 md:py-20 bg-gradient-subtle dark:bg-gradient-to-br dark:from-background/98 dark:via-background/95 dark:to-accent/10 overflow-hidden">
      {/* Enhanced dark mode background with subtle patterns */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.01] via-transparent to-primary-glow/[0.01] dark:from-primary/[0.02] dark:via-transparent dark:to-primary-glow/[0.03] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0%,transparent_50%)] opacity-[0.02] dark:opacity-[0.04] pointer-events-none"></div>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <Badge variant="secondary" className="px-4 py-2 bg-primary/10 text-primary border-primary/20">
              Featured Collection
            </Badge>
            <Sparkles className="w-5 h-5 text-primary" />
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight"
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Curated Masterpieces
            <span className="block text-primary-glow">by Skilled Artisans</span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed px-4"
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            Discover our handpicked selection of exceptional handcrafted treasures,
            each telling a unique story of tradition, craftsmanship, and cultural heritage.
          </motion.p>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-6 md:gap-8 mb-8"
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4 text-primary" />
              <span>50+ Artisans</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="w-4 h-4 text-primary" />
              <span>Premium Quality</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-primary" />
              <span>Handcrafted</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}>
            <div className="w-32 h-1 bg-gradient-primary mx-auto rounded-full"></div>
          </motion.div>
        </motion.div>

        {/* Products Grid with Enhanced Layout */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {isLoading ? (
            <motion.div
              variants={itemVariants}
              className="col-span-full text-center py-16"
            >
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
              <p className="text-muted-foreground text-lg">Discovering exceptional crafts...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              variants={itemVariants}
              className="col-span-full text-center py-16"
            >
              <div className="text-red-500 text-lg mb-4">Unable to load featured products</div>
              <p className="text-muted-foreground">{error?.message || 'Please try again later'}</p>
            </motion.div>
          ) : featuredProducts.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="col-span-full text-center py-16"
            >
              <div className="text-muted-foreground text-lg mb-4">No featured products available</div>
              <p className="text-sm text-muted-foreground">Check back soon for new arrivals</p>
            </motion.div>
          ) : (
            featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className="w-full group"
                transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
              >
                {/* Enhanced Product Card Wrapper */}
                <Card className="overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-500 bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/20">
                  <CardContent className="p-0">
                    {/* Artisan Spotlight Banner */}
                    {product.artisan && (
                      <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-3 border-b border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <Award className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {product.artisan.name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{product.artisan.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{product.artisan.rating}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Product Card */}
                    <div className="relative">
                      <ProductCard
                        product={product}
                        onAddToComparison={addToComparison}
                      />

                      {/* Enhanced Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                        {product.featured && (
                          <Badge className="bg-gradient-primary text-white shadow-lg animate-pulse">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {product.isHandmade && (
                          <Badge variant="secondary" className="bg-accent/90 text-accent-foreground shadow-lg">
                            <Heart className="w-3 h-3 mr-1" />
                            Handmade
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Enhanced Call to Action */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-card to-card/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-elegant border border-border/50">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Explore Our Complete Collection
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              From traditional textiles to contemporary metal crafts, discover thousands of unique pieces
              crafted by India's finest artisans across every region and tradition.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                className="btn-hero px-8 py-4 text-lg font-semibold shadow-glow hover:shadow-xl transition-all duration-300"
                asChild
              >
                <Link to="/shop">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Browse All Products
                </Link>
              </Button>

              <Button
                variant="outline"
                className="px-8 py-4 text-lg font-semibold border-2 hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                asChild
              >
                <Link to="/artisans">
                  <Users className="w-5 h-5 mr-2" />
                  Meet the Artisans
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
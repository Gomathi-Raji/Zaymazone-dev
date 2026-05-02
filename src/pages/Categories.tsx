import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Palette, 
  Lightbulb, 
  ShirtIcon, 
  Gift, 
  Sparkles, 
  Scissors, 
  Hammer, 
  Crown,
  LucideIcon
} from "lucide-react";
import { getImageUrl } from "@/lib/api";
import { pageContentApi } from "@/services/api";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

// Icon mapping for database strings to React components
const iconMap: Record<string, LucideIcon> = {
  'Palette': Palette,
  'Lightbulb': Lightbulb,
  'ShirtIcon': ShirtIcon,
  'Gift': Gift,
  'Sparkles': Sparkles,
  'Scissors': Scissors,
  'Hammer': Hammer,
  'Crown': Crown,
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [pageContent, setPageContent] = useState({ title: "Craft Categories", description: "Explore our diverse collection of traditional Indian crafts, each representing centuries of cultural heritage and artistic excellence passed down through generations of skilled artisans." });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesData, contentData] = await Promise.all([
          pageContentApi.getCategories(),
          pageContentApi.getPageContent('categories')
        ]);
        
        setCategories(categoriesData.categories);
        setPageContent(contentData);
      } catch (error) {
        console.warn('Failed to fetch categories or page content:', error);
        // Keep default data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const featuredCategories = categories.filter(cat => cat.featured);
  const otherCategories = categories.filter(cat => !cat.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">{pageContent.title}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {pageContent.description}
          </p>
        </div>

        {/* Featured Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-8">Featured Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCategories.map(category => {
              const IconComponent = iconMap[category.icon] || Gift; // Default to Gift icon if not found
              return (
                <Card key={category.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  <div className="aspect-video bg-muted overflow-hidden relative">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Category icon */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-card/90 p-2 rounded-full">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    
                    {/* Product count badge */}
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-card/90 text-card-foreground">
                        {category.productCount} Products
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {category.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Subcategories */}
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.slice(0, 3).map((sub, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {sub}
                        </Badge>
                      ))}
                      {category.subcategories.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{category.subcategories.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{category.artisanCount} Artisans</span>
                      <span>{category.productCount} Products</span>
                    </div>

                    {/* Action button */}
                    <Button className="w-full" asChild>
                      <Link to={`/shop?category=${category.id}`}>
                        Explore {category.name}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Other Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">More Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherCategories.map(category => {
              const IconComponent = iconMap[category.icon] || Gift; // Default to Gift icon if not found
              return (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>{category.artisanCount} Artisans</span>
                      <span>{category.productCount} Products</span>
                    </div>

                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to={`/shop?category=${category.id}`}>
                        View Products
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We're constantly adding new products and categories. If you're looking for something specific, 
            let us know and we'll help you find the perfect handcrafted item.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/shop">Browse All Products</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Categories;

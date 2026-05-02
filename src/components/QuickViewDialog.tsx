import { useState } from "react";
import { DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, Star, MapPin, Truck, Shield, ArrowLeft, ArrowRight } from "lucide-react";
import { Product, getImageUrl } from "@/lib/api";
import { toast } from "sonner";
import { AnimatedDialog } from "./AnimatedDialog";

interface QuickViewDialogProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewDialog = ({ product, isOpen, onClose }: QuickViewDialogProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const addToCart = () => {
    toast.success(`Added ${selectedQuantity} ${product.name} to cart`);
    onClose();
  };

  const addToWishlist = () => {
    toast.success("Added to wishlist");
  };

  return (
    <AnimatedDialog
      open={isOpen}
      onOpenChange={onClose}
      title={product.name}
      description={`Product details for ${product.name}`}
      className="max-w-4xl max-h-[90vh] overflow-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <img 
              src={getImageUrl(product.images[currentImageIndex])} 
              alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card"
                    onClick={prevImage}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card"
                    onClick={nextImage}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.featured && (
                  <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                )}
                {discountPercentage > 0 && (
                  <Badge variant="destructive">{discountPercentage}% OFF</Badge>
                )}
                {product.isHandmade && (
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    Handmade
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    aria-label={`Select image ${index + 1} of ${product.images.length}`}
                    className={`flex-1 aspect-square rounded-md overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={getImageUrl(image)} 
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{product.name}</h1>
              
              {/* Artisan Info */}
              {product.artisan && (
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{product.artisan.name}</span>
                  <span>•</span>
                  <span>{product.artisan.location}</span>
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.rating}</span>
                </div>
                <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-foreground">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {discountPercentage > 0 && (
                <p className="text-green-600 font-medium">You save ₹{(product.originalPrice! - product.price).toLocaleString()}</p>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Materials:</span>
                <p className="text-muted-foreground">{product.materials.join(", ")}</p>
              </div>
              <div>
                <span className="font-medium">Dimensions:</span>
                <p className="text-muted-foreground">{product.dimensions}</p>
              </div>
              <div>
                <span className="font-medium">Weight:</span>
                <p className="text-muted-foreground">{product.weight}</p>
              </div>
              <div>
                <span className="font-medium">Colors:</span>
                <p className="text-muted-foreground">{product.colors?.join(", ") || "N/A"}</p>
              </div>
            </div>

            <Separator />

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center">{selectedQuantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedQuantity(Math.min(product.stockCount, selectedQuantity + 1))}
                >
                  +
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                {product.stockCount} available
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-gradient-primary hover:shadow-glow"
                onClick={addToCart}
                disabled={!product.inStock}
              >
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={addToWishlist}
              >
                <Heart className="w-4 h-4" />
              </Button>
            </div>

            {/* Features */}
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Truck className="w-4 h-4" />
                <span>Free shipping on orders over ₹2,000</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Authentic handcrafted guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>📦</span>
                <span>Delivery in {product.shippingTime}</span>
              </div>
            </div>
          </div>
        </div>
      </AnimatedDialog>
  );
};
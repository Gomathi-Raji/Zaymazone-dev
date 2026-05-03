import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProductCard } from "@/components/ProductCard";
import { api, getImageUrl, type Artisan, type Product } from "@/lib/api";
import { 
  MapPin, 
  Star, 
  Users, 
  Calendar,
  Heart,
  Share2,
  MessageCircle,
  Package,
  Verified,
  Clock,
  ArrowLeft,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ArtisanDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (id) {
      loadArtisanData();
    }
  }, [id]);

  const loadArtisanData = async () => {
    setLoading(true);
    try {
      const [artisanData, productsData] = await Promise.all([
        api.getArtisan(id!),
        api.getProducts({ artisanId: id!, limit: 24, page: 1 })
      ]);

      setArtisan(artisanData);
      setProducts(productsData.products || []);
      setReviews([]);
    } catch (error) {
      toast({
        title: "Error loading artisan",
        description: "Failed to load artisan information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: isFollowing ? `Unfollowed ${artisan?.name}` : `Now following ${artisan?.name}`,
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Artisan profile link copied to clipboard",
    });
  };

  const coverImageUrl = artisan?.coverImage ? getImageUrl(artisan.coverImage) : "";
  const avatarUrl = artisan?.avatar ? getImageUrl(artisan.avatar) : "";
  const specialties = artisan?.specialties || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Loading artisan profile...</h2>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Artisan not found</h2>
            <p className="text-muted-foreground mb-6">The artisan you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/artisans">Browse All Artisans</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-16">
        {/* Cover Image & Header */}
        <div className="relative h-80 bg-gradient-to-r from-primary/20 to-secondary/20 overflow-hidden">
          {coverImageUrl && (
            <img 
              src={coverImageUrl} 
              alt={artisan.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Navigation Breadcrumb */}
          <div className="absolute top-6 left-6 z-10">
            <Button variant="ghost" size="sm" asChild className="text-white hover:text-white/80">
              <Link to="/artisans">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Artisans
              </Link>
            </Button>
          </div>

          {/* Artisan Info Overlay */}
          <div className="absolute bottom-6 left-6 right-6 z-10">
            <div className="flex items-end gap-6">
              <Avatar className="w-24 h-24 border-4 border-white">
                <AvatarImage src={avatarUrl} alt={artisan.name} />
                <AvatarFallback className="text-2xl font-bold">
                  {artisan.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-white">{artisan.name}</h1>
                  {artisan.verification?.isVerified && (
                    <Verified className="w-6 h-6 text-blue-400" />
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-white/90 mb-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{artisan.location.city}, {artisan.location.state}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                    <span>{artisan.rating}</span>
                    <span>({artisan.totalRatings} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{artisan.experience} years experience</span>
                  </div>
                </div>
                
                <p className="text-white/80 text-sm max-w-2xl">{artisan.bio}</p>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant={isFollowing ? "secondary" : "default"} 
                  onClick={handleFollow}
                  className="min-w-[100px]"
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare} aria-label="Share artisan profile">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Send message">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Package className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{artisan.totalProducts}</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{artisan.rating}</div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{artisan.totalRatings}</div>
                <div className="text-sm text-muted-foreground">Reviews</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{artisan.experience}</div>
                <div className="text-sm text-muted-foreground">Years</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {products.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No products yet</h3>
                  <p className="text-muted-foreground">This artisan hasn't listed any products yet.</p>
                </div>
              )}
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Story */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Artisan Story</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {artisan.bio || "No story has been provided yet."}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Specializations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Specializations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {specialties.length > 0 ? (
                        <div className="space-y-2">
                          {specialties.map((spec) => (
                            <Badge key={spec} className="mr-2 mb-2">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No specializations listed.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Experience</span>
                        <span className="font-medium">{artisan.experience} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Joined</span>
                        <span className="font-medium">
                          {new Date(artisan.joinedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium">{artisan.location.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Products</span>
                        <span className="font-medium">{artisan.totalProducts}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                <p className="text-muted-foreground">Be the first to review this artisan's work!</p>
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact">
              <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Contact details are not available for this artisan yet.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Send Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Subject</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border rounded-md" 
                          placeholder="Enter subject"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Message</label>
                        <textarea 
                          rows={4}
                          className="w-full p-2 border rounded-md" 
                          placeholder="Type your message here..."
                        />
                      </div>
                      <Button className="w-full">Send Message</Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
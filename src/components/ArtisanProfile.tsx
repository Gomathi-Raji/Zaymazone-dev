import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, Award, Package, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { VerificationBadge } from "./VerificationBadge";
import { getImageUrl } from "@/lib/api";

interface ArtisanProfileProps {
  artisan: {
    id: string;
    name: string;
    specialty: string;
    location: string;
    experience: string;
    rating: number;
    products: number;
    image: string;
    avatar?: string;
    description: string;
    achievements: string[];
    joinedYear?: string;
    specialties?: string[];
    isVerified?: boolean;
  };
}

export const ArtisanProfile = ({ artisan }: ArtisanProfileProps) => {
  const coverImage = getImageUrl(artisan.image);
  const avatarImage = getImageUrl(artisan.avatar || artisan.image);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Hero Image */}
      <div className="aspect-video bg-muted overflow-hidden relative">
        <img 
          src={coverImage} 
          alt={`${artisan.name} at work`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Avatar positioned over the hero image */}
        <div className="absolute bottom-4 left-4">
          <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
            <AvatarImage src={avatarImage} alt={artisan.name} />
            <AvatarFallback className="text-lg font-semibold">
              {artisan.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Rating badge */}
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-card/90 text-card-foreground">
            <Star className="w-3 h-3 mr-1 fill-current text-yellow-500" />
            {artisan.rating}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{artisan.name}</CardTitle>
              {artisan.isVerified && <VerificationBadge isVerified={true} variant="icon-only" />}
            </div>
            <CardDescription className="font-medium text-primary">
              {artisan.specialty}
            </CardDescription>
          </div>
        </div>
        
        {/* Location and stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {artisan.location}
          </div>
          <div className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            {artisan.products} products
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {artisan.experience} exp.
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {artisan.description}
        </p>

        {/* Specialties */}
        {artisan.specialties && (
          <div className="flex flex-wrap gap-2">
            {artisan.specialties.map((specialty, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>
        )}

        {/* Achievements */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Achievements</h4>
          <div className="flex flex-wrap gap-2">
            {artisan.achievements.map((achievement, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Award className="w-3 h-3 mr-1" />
                {achievement}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to={`/artisan/${artisan.id}`}>
              View Profile
            </Link>
          </Button>
          <Button size="sm" className="flex-1" asChild>
            <Link to={`/shop?artisan=${artisan.id}`}>
              View Products
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
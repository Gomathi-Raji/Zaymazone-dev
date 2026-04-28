import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";
import { getImageUrl } from "@/lib/api";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          {/* Illustration */}
          <div className="mb-8">
            <img 
              src="/assets/404-illustration.jpg" 
              alt="Scattered craft tools illustration"
              className="w-full max-w-md mx-auto mb-6 rounded-2xl shadow-soft"
            />
            <div className="text-8xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              404
            </div>
            <div className="w-32 h-1 bg-gradient-primary mx-auto rounded-full opacity-50"></div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            The page you're looking for seems to have wandered off like a craft piece finding its perfect home. 
            Don't worry, let's get you back on track!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild className="btn-hero w-full sm:w-auto">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/shop">
                <Search className="w-4 h-4 mr-2" />
                Browse Products
              </Link>
            </Button>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Or try one of these popular pages:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/about" className="text-primary hover:text-primary/80 transition-colors">
                About Us
              </Link>
              <Link to="/artisans" className="text-primary hover:text-primary/80 transition-colors">
                Meet Artisans
              </Link>
              <Link to="/contact" className="text-primary hover:text-primary/80 transition-colors">
                Contact Support
              </Link>
              <Link to="/seller-onboarding" className="text-primary hover:text-primary/80 transition-colors">
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
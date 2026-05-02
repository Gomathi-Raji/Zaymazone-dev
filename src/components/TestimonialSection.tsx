import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const TestimonialSection = () => {
  return (
    <section className="relative py-20 bg-gradient-subtle dark:bg-gradient-to-br dark:from-background/95 dark:via-primary/5 dark:to-primary-glow/10 overflow-hidden">
      {/* Dramatic dark mode overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.08] via-transparent to-primary-glow/[0.05] dark:from-primary/[0.12] dark:via-primary/[0.06] dark:to-primary-glow/[0.08] pointer-events-none"></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <blockquote className="text-3xl sm:text-4xl font-bold text-foreground mb-8 leading-relaxed">
            "Zaymazone lets my story and heritage 
            shine through every product sold."
          </blockquote>
          
          <cite className="text-lg text-muted-foreground font-medium">
            Renu, Rajasthan
          </cite>
        </div>
        
        <div className="mt-16 bg-card rounded-3xl p-8 sm:p-12 shadow-elegant">
          <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Join as a Seller
          </h3>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Empower your craft, reach new customers.
          </p>
          
          <Button className="btn-hero" asChild>
            <Link to="/seller-onboarding">Start Selling</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
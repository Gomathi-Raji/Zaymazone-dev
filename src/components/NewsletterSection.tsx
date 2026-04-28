import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      toast.success("Successfully subscribed to newsletter!");
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail("");
      }, 3000);
    }
  };

  return (
    <section className="relative py-16 md:py-20 bg-gradient-subtle dark:bg-gradient-to-br dark:from-background dark:via-accent/5 dark:to-primary/8 overflow-hidden">
      {/* Newsletter light mode enhancement */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-glow/[0.03] to-transparent pointer-events-none"></div>
      
      {/* Newsletter dark mode enhancement - enhanced */}
      <div className="absolute inset-0 bg-gradient-to-r dark:from-transparent dark:via-primary-glow/[0.06] dark:to-transparent pointer-events-none"></div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <Mail className="w-16 h-16 mx-auto mb-6 text-primary dark:text-primary-300" />
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground dark:text-foreground mb-4">
            Stay Connected with Artisan Stories
          </h2>
          <p className="text-xl text-muted-foreground dark:text-muted-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Get weekly updates about new artisan products, behind-the-scenes stories, 
            and exclusive offers delivered to your inbox.
          </p>

          {!isSubscribed ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 dark:bg-background dark:border-border/30 dark:text-foreground dark:placeholder:text-muted-foreground/60 dark:focus:border-primary/50"
                  required
                />
                <Button 
                  type="submit" 
                  className="bg-gradient-primary dark:from-primary dark:to-primary-glow hover:shadow-glow dark:hover:shadow-glow px-8 transition-all duration-300"
                >
                  Subscribe
                </Button>
              </div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground/70 mt-3">
                No spam, unsubscribe at any time. We respect your privacy.
              </p>
            </form>
          ) : (
            <div className="animate-scale-in">
              <div className="bg-card dark:bg-card/60 dark:border-primary/20 rounded-xl p-6 max-w-md mx-auto shadow-soft dark:shadow-glow border border-border/50 backdrop-blur-sm">
                <CheckCircle2 className="w-12 h-12 text-primary dark:text-primary-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground dark:text-foreground mb-2">
                  Welcome to our community!
                </h3>
                <p className="text-muted-foreground dark:text-muted-foreground/90">
                  Check your email for a confirmation message.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
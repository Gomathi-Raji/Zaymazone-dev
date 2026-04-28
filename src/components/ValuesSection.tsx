import { Hand, Heart, MapPin, Handshake } from "lucide-react";

const values = [
  {
    icon: Hand,
    title: "Curated Finds",
    description: "Carefully selected authentic pieces from skilled artisans"
  },
  {
    icon: Heart,
    title: "Made With Love",
    description: "Every product crafted with passion and cultural pride"
  },
  {
    icon: MapPin,
    title: "Local Impact",
    description: "Supporting communities and preserving traditional crafts"
  },
  {
    icon: Handshake,
    title: "Fair Trade",
    description: "Ensuring artisans receive fair compensation for their work"
  }
];

export const ValuesSection = () => {
  return (
    <section className="relative py-20 md:py-28 bg-gradient-subtle dark:bg-gradient-to-br dark:from-background dark:via-muted/10 dark:to-background overflow-hidden">
      {/* Subtle pattern overlay for light mode */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,hsl(var(--primary))_1px,transparent_1px),linear-gradient(-45deg,hsl(var(--primary))_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.01] pointer-events-none"></div>
      
      {/* Subtle pattern overlay for dark mode */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,hsl(var(--primary))_1px,transparent_1px),linear-gradient(-45deg,hsl(var(--primary))_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.02] dark:opacity-[0.03] pointer-events-none"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="value-card group animate-scale-in dark:bg-card/50 dark:hover:bg-card/70 dark:border-primary/20"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-primary dark:from-primary dark:to-primary-glow rounded-2xl flex items-center justify-center shadow-soft dark:shadow-glow group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-8 h-8 text-white dark:text-primary-foreground" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-foreground dark:text-foreground mb-3">
                {value.title}
              </h3>
              
              <p className="text-muted-foreground dark:text-muted-foreground/90 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
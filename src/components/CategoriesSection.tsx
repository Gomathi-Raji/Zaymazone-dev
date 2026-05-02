import { Link } from "react-router-dom";

const categories = [
  {
    title: "Pottery mastery.",
    subtitle: "Handcrafted ceramics reflecting tradition and artistry.",
    image: '/assets/pottery-hero.jpg',
    href: "/shop?category=pottery"
  },
  {
    title: "Textile tales.",
    subtitle: "Vibrant fabrics woven with heritage and skill.",
    image: '/assets/textiles-hero.jpg',
    href: "/shop?category=textiles"
  },
  {
    title: "Playful crafts.",
    subtitle: "Ethical toys and decor that spark creativity.",
    image: '/assets/crafts-hero.jpg',
    href: "/shop?category=crafts"
  }
];

export const CategoriesSection = () => {
  return (
    <section className="relative py-20 bg-gradient-subtle dark:bg-gradient-to-br dark:from-background dark:via-background/95 dark:to-primary/5 overflow-hidden">
      {/* Dark mode overlay for enhanced depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-primary/[0.05] dark:from-primary/[0.03] dark:via-primary/[0.08] dark:to-primary/[0.12] pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Explore Our Collections
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Each piece tells a story of cultural heritage and masterful craftsmanship
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.title}
              to={category.href}
              className="category-card group block"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {category.title}
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {category.subtitle}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
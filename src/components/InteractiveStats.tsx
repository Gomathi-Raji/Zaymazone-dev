import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Package, MapPin, Star } from "lucide-react";

const stats = [
  {
    icon: Users,
    label: "Master Artisans",
    value: 150,
    suffix: "+",
    description: "Skilled craftspeople from across India"
  },
  {
    icon: Package,
    label: "Handcrafted Products",
    value: 2500,
    suffix: "+",
    description: "Unique pieces made with love"
  },
  {
    icon: MapPin,
    label: "Regions Covered",
    value: 28,
    suffix: "",
    description: "States and territories represented"
  },
  {
    icon: Star,
    label: "Customer Rating",
    value: 4.9,
    suffix: "/5",
    description: "Average satisfaction score"
  }
];

interface CounterProps {
  end: number;
  duration: number;
  suffix: string;
}

const Counter = ({ end, duration, suffix }: CounterProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const startValue = 0;
    const endValue = end;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const currentValue = startValue + (endValue - startValue) * easeOutCubic(progress);
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-bold text-primary">
      {count.toLocaleString(undefined, { 
        maximumFractionDigits: end < 10 ? 1 : 0 
      })}
      <span className="text-primary/80">{suffix}</span>
    </div>
  );
};

export const InteractiveStats = () => {
  return (
    <section className="relative py-16 bg-gradient-subtle dark:bg-gradient-to-br dark:from-background dark:via-background/98 dark:to-accent/8 overflow-hidden">
      {/* Interactive stats dark mode enhancement */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--primary-glow))_0%,transparent_70%)] opacity-[0.01] dark:opacity-[0.03] pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            
            return (
              <Card 
                key={index} 
                className="group hover:shadow-elegant hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      <Icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  
                  <Counter 
                    end={stat.value} 
                    duration={2000} 
                    suffix={stat.suffix}
                  />
                  
                  <h3 className="text-lg font-semibold text-foreground mt-2 mb-1">
                    {stat.label}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
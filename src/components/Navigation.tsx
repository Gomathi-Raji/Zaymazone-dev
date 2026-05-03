import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Menu, 
  User, 
  Heart, 
  Palette, 
  ShoppingBag, 
  Sparkles,
  ChevronDown,
  Crown,
  Moon,
  Sun
} from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { CartDrawer } from "./CartDrawer";
import { SearchDialog } from "./SearchDialog";
import { WishlistDrawer } from "./WishlistDrawer";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { scrollToTop } from "@/lib/scrollUtils";
import { getImageUrl } from "@/lib/api";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const navigationItems = [
    { 
      to: "/", 
      label: "Home", 
      icon: <Sparkles className="h-4 w-4" />,
      onClick: scrollToTop 
    },
    { 
      to: "/shop", 
      label: "Shop", 
      icon: <ShoppingBag className="h-4 w-4" />
    },
    { 
      to: "/artisans", 
      label: "Artisans", 
      icon: <Crown className="h-4 w-4" />
    },
    { 
      to: "/about", 
      label: "About", 
      icon: <Heart className="h-4 w-4" /> 
    },
    { 
      to: "/contact", 
      label: "Contact", 
      icon: <User className="h-4 w-4" /> 
    },
  ];

  const NavLinks = () => (
    <>
      {navigationItems.map((item) => (
        <motion.div
          key={item.to}
          className="relative"
          onHoverStart={() => setHoveredItem(item.to)}
          onHoverEnd={() => setHoveredItem(null)}
        >
          <Link
            to={item.to}
            className="group relative flex items-center gap-2 px-3 py-2 rounded-lg text-foreground hover:text-primary dark:text-foreground dark:hover:text-primary font-medium transition-all duration-300 hover:bg-primary/5 dark:hover:bg-primary/10 dark:hover:shadow-dark-glow"
            onClick={item.onClick}
          >
            <span className="group-hover:scale-110 transition-transform duration-300 drop-shadow-sm dark:drop-shadow-lg">
              {item.icon}
            </span>
            <span className="relative drop-shadow-sm dark:drop-shadow-lg">
              {item.label}
              <motion.div
                className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-primary-glow dark:shadow-dark-glow"
                initial={{ width: 0 }}
                animate={{ width: hoveredItem === item.to ? "100%" : 0 }}
                transition={{ duration: 0.3 }}
              />
            </span>
          </Link>
        </motion.div>
      ))}
    </>
  );

  return (
    <>
      {/* Top promotional bar */}
      <motion.div 
        className="bg-gradient-to-r from-primary via-primary-glow to-primary text-white dark:bg-gradient-to-r dark:from-primary/95 dark:via-primary-glow/95 dark:to-primary/95 dark:text-foreground text-center py-2 text-sm font-medium shadow-lg dark:shadow-dark-soft backdrop-blur-sm"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="drop-shadow-sm">Free shipping on orders over ₹999 • Handcrafted with love</span>
          <Sparkles className="h-4 w-4 animate-pulse" />
        </div>
      </motion.div>

      <motion.nav
        className={`sticky top-0 z-50 border-b border-border/50 transition-[background-color,backdrop-filter,box-shadow] duration-300 ease-in-out ${
          isScrolled
            ? "bg-background/98 backdrop-blur-xl shadow-lg shadow-primary/5 dark:bg-background/95 dark:backdrop-blur-2xl dark:shadow-dark-elegant dark:border-border/40"
            : "bg-background/95 backdrop-blur-lg shadow-md shadow-primary/5 dark:bg-background/90 dark:backdrop-blur-xl dark:shadow-dark-soft dark:border-border/40"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20">
            {/* Logo */}
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to="/"
                className="flex items-center group relative"
                onClick={scrollToTop}
              >
                <div className="relative">
                  <img
                    src="/logo.png"
                    alt="ZAYMAZONE Logo"
                    className="h-12 sm:h-20 md:h-28 w-auto object-contain group-hover:scale-110 transition-all duration-500 drop-shadow-xl filter group-hover:brightness-110 dark:group-hover:brightness-125 dark:drop-shadow-2xl"
                  />
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <NavLinks />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle — hidden on mobile to reduce icon crowding */}
              <div className="hidden sm:block">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleTheme}
                  className="bg-gradient-to-r from-primary/5 to-primary-glow/5 hover:from-primary/10 hover:to-primary-glow/10 border border-primary/20 hover:border-primary/30 transition-all duration-300 dark:from-primary/10 dark:to-primary-glow/10 dark:hover:from-primary/20 dark:hover:to-primary-glow/20 dark:border-primary/30 dark:hover:shadow-dark-glow"
                >
                  {theme === 'light' ? (
                    <Moon className="h-5 w-5 text-primary dark:text-primary drop-shadow-sm dark:drop-shadow-lg" />
                  ) : (
                    <Sun className="h-5 w-5 text-primary dark:text-primary drop-shadow-sm dark:drop-shadow-lg" />
                  )}
                </Button>
              </motion.div>
              </div>

              {/* Search */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <SearchDialog />
              </motion.div>

              {/* Wishlist */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <WishlistDrawer />
              </motion.div>

              {/* Cart */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <CartDrawer />
              </motion.div>

              {/* User Authentication */}
              {isAuthenticated ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <UserMenu />
                </motion.div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="relative bg-gradient-to-r from-primary/5 to-primary-glow/5 hover:from-primary/10 hover:to-primary-glow/10 border border-primary/20 hover:border-primary/30 transition-all duration-300 dark:from-primary/10 dark:to-primary-glow/10 dark:hover:from-primary/20 dark:hover:to-primary-glow/20 dark:border-primary/30 dark:hover:shadow-dark-glow"
                      >
                        <User className="h-5 w-5 text-primary dark:text-primary drop-shadow-sm dark:drop-shadow-lg" />
                        <ChevronDown className="h-3 w-3 ml-1 text-primary dark:text-primary drop-shadow-sm dark:drop-shadow-lg" />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2 bg-background/98 backdrop-blur-xl border-primary/20 shadow-xl z-[100] dark:bg-background/98 dark:backdrop-blur-2xl dark:border-primary/30 dark:shadow-dark-floating" align="end" sideOffset={8}>
                    <DropdownMenuLabel className="text-primary font-semibold dark:text-primary drop-shadow-sm dark:drop-shadow-lg">Welcome to Zaymazone</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-primary/20 dark:bg-primary/30" />
                    <DropdownMenuItem asChild>
                      <Link to="/sign-in" className="cursor-pointer flex items-center py-3 px-2 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 dark:hover:shadow-dark-glow transition-colors">
                        <User className="mr-3 h-4 w-4 text-primary dark:text-primary drop-shadow-sm dark:drop-shadow-lg" />
                        <div>
                          <p className="font-medium text-foreground dark:text-foreground drop-shadow-sm dark:drop-shadow-lg">Sign in as Customer</p>
                          <p className="text-xs text-muted-foreground dark:text-muted-foreground drop-shadow-sm">Access your orders & wishlist</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/sign-in-artisan" className="cursor-pointer flex items-center py-3 px-2 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 dark:hover:shadow-dark-glow transition-colors">
                        <Palette className="mr-3 h-4 w-4 text-primary dark:text-primary drop-shadow-sm dark:drop-shadow-lg" />
                        <div>
                          <p className="font-medium text-foreground dark:text-foreground drop-shadow-sm dark:drop-shadow-lg">Sign in as Artisan</p>
                          <p className="text-xs text-muted-foreground dark:text-muted-foreground drop-shadow-sm">Manage your craft business</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-primary/20 dark:bg-primary/30" />
                    <DropdownMenuItem asChild>
                      <Link to="/sign-up" className="cursor-pointer flex items-center py-2 px-2 rounded-lg hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary-glow/10 dark:hover:from-primary/20 dark:hover:to-primary-glow/20 dark:hover:shadow-dark-glow transition-all">
                        <span className="font-medium text-primary dark:text-primary drop-shadow-sm dark:drop-shadow-lg">Create New Account</span>
                        <Sparkles className="ml-auto h-4 w-4 text-primary dark:text-primary drop-shadow-sm dark:drop-shadow-lg" />
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="lg:hidden bg-gradient-to-r from-primary/5 to-primary-glow/5 hover:from-primary/10 hover:to-primary-glow/10 border border-primary/20 hover:border-primary/30 dark:from-primary/10 dark:to-primary-glow/10 dark:hover:from-primary/20 dark:hover:to-primary-glow/20 dark:border-primary/30 dark:hover:shadow-dark-glow"
                    >
                      <Menu className="h-5 w-5 text-primary dark:text-primary drop-shadow-sm dark:drop-shadow-lg" />
                    </Button>
                  </motion.div>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background/98 backdrop-blur-xl border-primary/20 dark:bg-background/98 dark:backdrop-blur-2xl dark:border-primary/30 dark:shadow-dark-floating overflow-y-auto">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <motion.div
                    className="flex flex-col space-y-6 mt-6 pb-6"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.08,
                          delayChildren: 0.15,
                        },
                      },
                    }}
                  >
                    {/* Browse Section */}
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground px-3 mb-3">Browse</p>
                      <div className="space-y-1">
                        {navigationItems.map((item) => (
                          <motion.div
                            key={item.to}
                            variants={{
                              hidden: { x: 50, opacity: 0 },
                              visible: {
                                x: 0,
                                opacity: 1,
                                transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
                              },
                            }}
                          >
                            <Link
                              to={item.to}
                              className="flex items-center gap-3 p-3 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 dark:text-foreground dark:hover:text-primary dark:hover:bg-primary/10 dark:hover:shadow-dark-glow font-medium transition-all duration-300 group"
                              onClick={() => {
                                if (item.onClick) item.onClick();
                                setIsOpen(false);
                              }}
                            >
                              <span className="group-hover:scale-110 transition-transform duration-300 drop-shadow-sm dark:drop-shadow-lg">
                                {item.icon}
                              </span>
                              <span className="drop-shadow-sm dark:drop-shadow-lg">{item.label}</span>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Resources Section */}
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground px-3 mb-3">Resources</p>
                      <div className="space-y-1">
                        {[
                          { to: "/help", label: "Help & Support", icon: <Heart className="h-4 w-4" /> },
                          { to: "/sustainability", label: "Sustainability", icon: <Sparkles className="h-4 w-4" /> },
                          { to: "/start-selling", label: "Start Selling", icon: <Crown className="h-4 w-4" /> },
                        ].map((item) => (
                          <motion.div
                            key={item.to}
                            variants={{
                              hidden: { x: 50, opacity: 0 },
                              visible: {
                                x: 0,
                                opacity: 1,
                                transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
                              },
                            }}
                          >
                            <Link
                              to={item.to}
                              className="flex items-center gap-3 p-3 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 dark:text-foreground dark:hover:text-primary dark:hover:bg-primary/10 dark:hover:shadow-dark-glow font-medium transition-all duration-300 group"
                              onClick={() => setIsOpen(false)}
                            >
                              <span className="group-hover:scale-110 transition-transform duration-300 drop-shadow-sm dark:drop-shadow-lg">
                                {item.icon}
                              </span>
                              <span className="drop-shadow-sm dark:drop-shadow-lg">{item.label}</span>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Account Section - Only show if authenticated */}
                    {isAuthenticated && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground px-3 mb-3">Account</p>
                        <div className="space-y-1">
                          {[
                            { to: user?.role === 'artisan' ? '/artisan/profile' : '/profile', label: "My Profile", icon: <User className="h-4 w-4" /> },
                            { to: "/orders", label: "My Orders", icon: <ShoppingBag className="h-4 w-4" /> },
                            { to: "/wishlist", label: "Wishlist", icon: <Heart className="h-4 w-4" /> },
                          ].map((item) => (
                            <motion.div
                              key={item.to}
                              variants={{
                                hidden: { x: 50, opacity: 0 },
                                visible: {
                                  x: 0,
                                  opacity: 1,
                                  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
                                },
                              }}
                            >
                              <Link
                                to={item.to}
                                className="flex items-center gap-3 p-3 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 dark:text-foreground dark:hover:text-primary dark:hover:bg-primary/10 dark:hover:shadow-dark-glow font-medium transition-all duration-300 group"
                                onClick={() => setIsOpen(false)}
                              >
                                <span className="group-hover:scale-110 transition-transform duration-300 drop-shadow-sm dark:drop-shadow-lg">
                                  {item.icon}
                                </span>
                                <span className="drop-shadow-sm dark:drop-shadow-lg">{item.label}</span>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.nav>
    </>
  );
};
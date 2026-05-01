import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PageLoadingProvider } from "@/contexts/PageLoadingContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import ScrollRestoration from "@/components/ScrollRestoration";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { PageLoadingOverlay } from "@/components/PageLoadingOverlay";
import { Suspense, lazy, useEffect } from "react";
import { usePageLoading } from "@/contexts/PageLoadingContext";

// Lazy load all page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Shop = lazy(() => import("./pages/Shop"));
const ShopWithBackend = lazy(() => import("./pages/ShopWithBackend"));
const Artisans = lazy(() => import("./pages/Artisans"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Categories = lazy(() => import("./pages/Categories"));
const Profile = lazy(() => import("./pages/Profile"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Help = lazy(() => import("./pages/Help"));
const Sustainability = lazy(() => import("./pages/Sustainability"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const StartSelling = lazy(() => import("./pages/StartSelling"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const SellerSuccess = lazy(() => import("./pages/SellerSuccess"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const SellerOnboarding = lazy(() => import("./pages/SellerOnboarding"));
const ArtisanDetail = lazy(() => import("./pages/ArtisanDetail"));
const ArtisanDetailWithBackend = lazy(() => import("./pages/ArtisanDetailWithBackend"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const APITestPage = lazy(() => import("./pages/APITestPage"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const SignInArtisan = lazy(() => import("./pages/SignInArtisan"));
const SignUpArtisan = lazy(() => import("./pages/SignUpArtisan"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ArtisanDashboard = lazy(() => import("./pages/ArtisanDashboard"));
const ArtisanProducts = lazy(() => import("./pages/ArtisanProducts"));
const ArtisanOrders = lazy(() => import("./pages/ArtisanOrders"));
const ArtisanProfile = lazy(() => import("./pages/ArtisanProfile"));
const MockPayment = lazy(() => import("./pages/MockPayment"));
const MockPaytmPayment = lazy(() => import("./pages/MockPaytmPayment"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Addresses = lazy(() => import("./pages/Addresses"));
const ArtisanAnalytics = lazy(() => import("./pages/ArtisanAnalytics"));
const ArtisanCustomers = lazy(() => import("./pages/ArtisanCustomers"));
const ArtisanReviews = lazy(() => import("./pages/ArtisanReviews"));
const AdminRoute = lazy(() => import("./components/AdminRoute").then(module => ({ default: module.AdminRoute })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// Component to listen for route changes and trigger loading
const RouteChangeListener = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { setIsLoading } = usePageLoading();

  useEffect(() => {
    // Show loading overlay on route change
    setIsLoading(true);
    
    // Hide loading after a short delay (allow time for page content to render)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location, setIsLoading]);

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <PageLoadingProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <TooltipProvider>
              <Toaster />
            <Sonner />
            <GoogleAnalytics />
            <PageLoadingOverlay />
            <BrowserRouter>
              <ScrollRestoration />
              <MobileBottomNav />
              <RouteChangeListener>
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}>
                  <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<ShopWithBackend />} />
            <Route path="/shop-mock" element={<Shop />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/artisans" element={<Artisans />} />
            <Route path="/artisan/:id" element={<ArtisanDetailWithBackend />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/help" element={<Help />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/start-selling" element={<StartSelling />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/seller-success" element={<SellerSuccess />} />
            <Route path="/seller-onboarding" element={<SellerOnboarding />} />
            <Route path="/account" element={<UserDashboard />} />
            <Route path="/account/orders" element={<UserDashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/admin" element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } />
            <Route path="/api-test" element={<APITestPage />} />
            <Route path="/mock-payment" element={<MockPayment />} />
            <Route path="/mock-payment/paytm" element={<MockPaytmPayment />} />

            {/* Authentication Routes */}
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/sign-in-artisan" element={<SignInArtisan />} />
            <Route path="/sign-up-artisan" element={<SellerOnboarding />} />
            <Route path="/sign-up-artisan" element={<SellerOnboarding />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/artisan-dashboard" element={<ArtisanDashboard />} />
            <Route path="/artisan/products" element={<ArtisanProducts />} />
            <Route path="/artisan/orders" element={<ArtisanOrders />} />
            <Route path="/artisan/profile" element={<ArtisanProfile />} />
            <Route path="/artisan/analytics" element={<ArtisanAnalytics />} />
            <Route path="/artisan/customers" element={<ArtisanCustomers />} />
            <Route path="/artisan/reviews" element={<ArtisanReviews />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/addresses" element={<Addresses />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </RouteChangeListener>
            </BrowserRouter>
          </TooltipProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
      </PageLoadingProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

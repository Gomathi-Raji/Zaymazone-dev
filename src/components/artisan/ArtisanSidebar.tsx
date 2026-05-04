// ── Module 8: Admin-style Sidebar for Artisan Dashboard ──────────────────────
// Module 14: added onClose for mobile drawer, keyboard arrow-nav, ARIA attrs
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  Star,
  MessageSquare,
  UserCircle,
  Store,
  TrendingUp,
  ChevronsLeft,
  ChevronsRight,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { ENV } from '@/config/env';

// ── Section type ─────────────────────────────────────────────────────────────
export type ArtisanSection =
  | 'overview'
  | 'orders'
  | 'products'
  | 'analytics'
  | 'customers'
  | 'reviews'
  | 'messages';

// ── Props ─────────────────────────────────────────────────────────────────────
interface ArtisanSidebarProps {
  activeSection: ArtisanSection;
  onNavigate: (s: ArtisanSection) => void;
  pendingOrders?: number;
  lowStockCount?: number;
  totalProducts?: number;
  totalReviews?: number;
  compact?: boolean;
  onToggleCompact?: () => void;
  /** Module 14: callback to close the mobile drawer */
  onClose?: () => void;
}

// ── Sidebar nav item definition ───────────────────────────────────────────────
interface NavItem {
  id: ArtisanSection;
  label: string;
  icon: React.ElementType;
  badge?: number | null;
  badgeVariant?: 'warning' | 'info';
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ArtisanSidebar({
  activeSection,
  onNavigate,
  pendingOrders = 0,
  lowStockCount = 0,
  totalProducts = 0,
  totalReviews = 0,
  compact = false,
  onToggleCompact,
  onClose,
}: ArtisanSidebarProps) {
  // Module 14: keyboard arrow-navigation between all nav buttons
  const handleNavKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    allIds: ArtisanSection[],
    currentId: ArtisanSection,
  ) => {
    const idx = allIds.indexOf(currentId);
    if (e.key === 'ArrowDown' && idx < allIds.length - 1) {
      e.preventDefault();
      const next = e.currentTarget.closest('nav')?.querySelectorAll<HTMLButtonElement>('[data-nav-item]');
      next?.[idx + 1]?.focus();
    }
    if (e.key === 'ArrowUp' && idx > 0) {
      e.preventDefault();
      const prev = e.currentTarget.closest('nav')?.querySelectorAll<HTMLButtonElement>('[data-nav-item]');
      prev?.[idx - 1]?.focus();
    }
  };
  const { user } = useAuth();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'A';

  const primaryNav: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      badge: pendingOrders || null,
      badgeVariant: 'warning',
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      badge: lowStockCount || null,
      badgeVariant: 'warning',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
  ];

  const secondaryNav: NavItem[] = [
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: Star,
      badge: totalReviews || null,
      badgeVariant: 'info',
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
    },
  ];

  const allNavIds = [
    ...primaryNav.map((n) => n.id),
    ...secondaryNav.map((n) => n.id),
  ];

  const renderNavButton = (item: NavItem) => {
    const isActive = activeSection === item.id;
    return (
      <Button
        key={item.id}
        data-nav-item="true"
        variant={isActive ? 'default' : 'ghost'}
        size="sm"
        className={`w-full h-9 font-normal ${compact ? 'justify-center px-2' : 'justify-start gap-2.5 px-3'} ${
          isActive
            ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
            : 'hover:bg-primary/5 text-foreground'
        }`}
        aria-label={item.label}
        title={item.label}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => onNavigate(item.id)}
        onKeyDown={(e) => handleNavKeyDown(e, allNavIds, item.id)}
      >
        <item.icon className="w-4 h-4 shrink-0" />
        {!compact && <span className="flex-1 text-left text-sm">{item.label}</span>}
        {!compact && item.badge != null && item.badge > 0 && (
          <Badge
            className={`text-[10px] px-1.5 min-w-[18px] h-4 flex items-center justify-center leading-none ${
              isActive
                ? 'bg-white/20 text-white border-white/30'
                : item.badgeVariant === 'warning'
                ? 'bg-amber-100 text-amber-700 border-amber-200'
                : 'bg-blue-100 text-blue-700 border-blue-200'
            }`}
          >
            {item.badge > 99 ? '99+' : item.badge}
          </Badge>
        )}
      </Button>
    );
  };

  return (
    <aside
      id="artisan-sidebar"
      className={`min-h-screen shrink-0 relative z-20 bg-card/90 backdrop-blur-2xl border-r border-border/70 shadow-[0_0_0_1px_hsl(var(--border)/0.35),0_24px_60px_-20px_rgba(0,0,0,0.55)] dark:bg-card/80 dark:border-white/10 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_60px_-20px_rgba(0,0,0,0.7)] animate-fade-in-left hidden lg:flex lg:order-first flex-col ${compact ? 'w-20' : 'w-64'}`}
      aria-label="Artisan dashboard sidebar"
    >

      {/* ── Brand ─────────────────────────────────────────────────────────── */}
      <div className={`border-b border-border ${compact ? 'px-3 py-4' : 'px-5 py-4'}`}>
        <div className={`flex items-center ${compact ? 'justify-center gap-2' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shrink-0 shadow-sm">
            <Store className="w-4 h-4 text-white" />
          </div>
          {!compact && (
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-foreground">Artisan Panel</p>
              <p className="text-[11px] text-muted-foreground">Zaymazone Marketplace</p>
            </div>
          )}
          <div className="flex items-center gap-1 shrink-0">
            {onToggleCompact && (
              <button
                type="button"
                onClick={onToggleCompact}
                aria-label={compact ? 'Expand sidebar' : 'Collapse sidebar'}
                title={compact ? 'Expand sidebar' : 'Collapse sidebar'}
                className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary transition-colors shrink-0"
              >
                {compact ? <ChevronsRight className="w-4 h-4" aria-hidden="true" /> : <ChevronsLeft className="w-4 h-4" aria-hidden="true" />}
              </button>
            )}
            {/* Module 14: Close button shown only in mobile drawer mode */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary transition-colors lg:hidden shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── User info ─────────────────────────────────────────────────────── */}
      <div className={`border-b border-border ${compact ? 'px-3 py-3' : 'px-4 py-3'}`}>
        <div className={`flex items-center ${compact ? 'justify-center gap-2' : 'gap-2.5'}`}>
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!compact && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate leading-tight">
                {user?.name || 'Artisan'}
              </p>
              {user?.email || ENV.artisanEmail ? (
                <p className="text-[11px] text-muted-foreground truncate leading-tight">
                  {user?.email || ENV.artisanEmail}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* ── Primary nav ───────────────────────────────────────────────────── */}
      <nav className={`flex-1 pt-4 pb-2 space-y-0.5 overflow-y-auto ${compact ? 'px-2' : 'px-3'}`} aria-label="Dashboard sections">
        {!compact && (
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2">
            Dashboard
          </p>
        )}
        {primaryNav.map(renderNavButton)}

        {!compact && (
          <div className="py-2">
            <Separator />
          </div>
        )}

        {!compact && (
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2">
            Engagement
          </p>
        )}
        {secondaryNav.map(renderNavButton)}
      </nav>

      {/* ── Stats summary ─────────────────────────────────────────────────── */}
      {!compact && (totalProducts > 0 || totalReviews > 0) && (
        <div className="px-4 py-3 border-t border-border bg-muted/30">
          <div className="flex gap-4 justify-around text-center">
            <div>
              <p className="text-xs font-bold text-foreground">{totalProducts}</p>
              <p className="text-[10px] text-muted-foreground">Products</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <p className="text-xs font-bold text-foreground">{totalReviews}</p>
              <p className="text-[10px] text-muted-foreground">Reviews</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <p className="text-xs font-bold text-amber-600">{pendingOrders}</p>
              <p className="text-[10px] text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile link ──────────────────────────────────────────────────── */}
      <div className="px-3 py-3 border-t border-border space-y-0.5">
        <Link to="/artisan/profile">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2.5 h-9 px-3 text-sm font-normal"
          >
            <UserCircle className="w-4 h-4" />
            Profile &amp; Settings
          </Button>
        </Link>
        <Link to="/artisan/analytics">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2.5 h-9 px-3 text-sm font-normal"
          >
            <TrendingUp className="w-4 h-4" />
            Full Analytics
          </Button>
        </Link>
      </div>
    </aside>
  );
}

// ── Module 14: User Sidebar Navigation ──────────────────────────────────
// Desktop sidebar for user dashboard pages. Matches Artisan/Admin design.
// Shows on lg+ screens, hidden on smaller screens (mobile nav takes over).
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  ShoppingCart,
  Heart,
  User,
  Settings,
  Zap,
  UserCircle,
  BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// ── Section type ─────────────────────────────────────────────────────────────
export type UserSection = 'dashboard' | 'orders' | 'wishlist' | 'profile' | 'settings';

// ── Props ─────────────────────────────────────────────────────────────────────
interface UserSidebarProps {
  activeSection: UserSection;
  onNavigate: (section: UserSection) => void;
  pendingOrders?: number;
  wishlistCount?: number;
}

// ── Sidebar nav item definition ───────────────────────────────────────────────
interface NavItem {
  id: UserSection;
  label: string;
  icon: React.ElementType;
  badge?: number | null;
  badgeVariant?: 'info' | 'warning';
}

// ── Component ─────────────────────────────────────────────────────────────────
export function UserSidebar({
  activeSection,
  onNavigate,
  pendingOrders = 0,
  wishlistCount = 0,
}: UserSidebarProps) {
  const { user } = useAuth();

  // Keyboard arrow-navigation between all nav buttons
  const handleNavKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    allIds: UserSection[],
    currentId: UserSection,
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

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'U';

  const primaryNav: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
  ];

  const secondaryNav: NavItem[] = [
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      badge: pendingOrders || null,
      badgeVariant: 'warning',
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      badge: wishlistCount || null,
      badgeVariant: 'info',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
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
        variant="ghost"
        size="sm"
        className={`w-full justify-start gap-3 h-10 px-3 font-medium transition-all ${
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
            : 'text-foreground hover:bg-primary/5 dark:hover:bg-primary/10'
        }`}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => onNavigate(item.id)}
        onKeyDown={(e) => handleNavKeyDown(e, allNavIds, item.id)}
      >
        <item.icon className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left text-sm">{item.label}</span>
        {item.badge != null && item.badge > 0 && (
          <Badge
            className={`text-[10px] px-2 min-w-[20px] h-5 flex items-center justify-center leading-none font-bold ${
              isActive
                ? 'bg-background/20 text-primary-foreground border-background/30'
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
      id="user-sidebar"
      className="w-64 min-h-screen flex flex-col shrink-0 relative z-20 bg-card/90 backdrop-blur-2xl border-l border-border/70 shadow-[0_0_0_1px_hsl(var(--border)/0.35),0_24px_60px_-20px_rgba(0,0,0,0.55)] dark:bg-card/80 dark:border-white/10 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_60px_-20px_rgba(0,0,0,0.7)] animate-slide-in-right hidden lg:flex lg:order-last"
      aria-label="User dashboard sidebar"
    >
      {/* ── Brand ─────────────────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-border/70 dark:border-white/10 bg-background/20 dark:bg-background/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shrink-0 shadow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm text-foreground">Customer Portal</p>
            <p className="text-[11px] text-muted-foreground">Zaymazone Marketplace</p>
          </div>
        </div>
      </div>

      {/* ── User info ─────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-border/70 dark:border-white/10 bg-background/10 dark:bg-background/5">
        <div className="flex items-center gap-2.5">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate leading-tight">
              {user?.name || 'Customer'}
            </p>
            <p className="text-[11px] text-muted-foreground truncate leading-tight">
              {user?.email || 'customer@zaymazone.com'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Primary nav ───────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 pt-6 pb-2 space-y-6 overflow-y-auto" aria-label="Dashboard sections">
        {/* Dashboard Section */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] px-3 mb-3 block">
            Dashboard
          </p>
          <div className="space-y-1">
            {primaryNav.map(renderNavButton)}
          </div>
        </div>

        {/* Shopping Section */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] px-3 mb-3 block">
            Shopping
          </p>
          <div className="space-y-1">
            {secondaryNav.map(renderNavButton)}
          </div>
        </div>
      </nav>

      {/* ── Quick Stats ─────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-border/70 bg-background/40 dark:border-white/10 dark:bg-background/5">
        <div className="flex gap-3 justify-between text-center">
          {pendingOrders > 0 && (
            <div className="flex-1">
              <p className="text-sm font-bold text-primary">{pendingOrders}</p>
              <p className="text-[10px] text-muted-foreground">Orders</p>
            </div>
          )}
          {wishlistCount > 0 && (
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-600">{wishlistCount}</p>
              <p className="text-[10px] text-muted-foreground">Saved</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ──────────────────────────────────────────────────── */}
      <div className="px-3 py-3 border-t border-border/70 dark:border-white/10 space-y-1 bg-background/10 dark:bg-background/5">
        <Link to="/profile">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 h-10 px-3 text-sm font-medium hover:bg-primary/10 dark:hover:bg-primary/15 transition-colors"
          >
            <UserCircle className="w-4 h-4" />
            <span>Profile</span>
          </Button>
        </Link>
      </div>
    </aside>
  );
}

export default UserSidebar;

// ── Module 8: Admin-style Sidebar for Admin Dashboard ──────────────────────
import React from 'react';
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
  Shield,
  FileText,
  Settings,
  AlertCircle,
  Zap,
  CreditCard,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ENV } from '@/config/env';

// ── Section type ─────────────────────────────────────────────────────────────
export type AdminSection =
  | 'dashboard'
  | 'artisans'
  | 'users'
  | 'products'
  | 'orders'
  | 'approvals'
  | 'payments'
  | 'reports'
  | 'settings';

// ── Props ─────────────────────────────────────────────────────────────────────
interface AdminSidebarProps {
  activeSection: AdminSection;
  onNavigate: (s: AdminSection) => void;
  pendingApprovals?: number;
  criticalAlerts?: number;
  mobileMode?: boolean;
}

// ── Sidebar nav item definition ───────────────────────────────────────────────
interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ElementType;
  badge?: number | null;
  badgeVariant?: 'warning' | 'info' | 'destructive';
}

// ── Component ─────────────────────────────────────────────────────────────────
export function AdminSidebar({
  activeSection,
  onNavigate,
  pendingApprovals = 0,
  criticalAlerts = 0,
  mobileMode = false,
}: AdminSidebarProps) {
  // Module 14: keyboard arrow-navigation between all nav buttons
  const handleNavKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    allIds: AdminSection[],
    currentId: AdminSection,
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
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'artisans',
      label: 'Artisans',
      icon: Users,
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
    },
  ];

  const secondaryNav: NavItem[] = [
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
    },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: CheckCircle,
      badge: pendingApprovals || null,
      badgeVariant: 'warning',
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
    },
  ];

  const toolsNav: NavItem[] = [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: criticalAlerts || null,
      badgeVariant: 'destructive',
    },
  ];

  const allNavIds = [
    ...primaryNav.map((n) => n.id),
    ...secondaryNav.map((n) => n.id),
    ...toolsNav.map((n) => n.id),
  ];

  const renderNavButton = (item: NavItem) => {
    const isActive = activeSection === item.id;
    return (
      <Button
        key={item.id}
        data-nav-item="true"
        variant={isActive ? 'default' : 'ghost'}
        size="sm"
        className={`w-full justify-start gap-2.5 ${mobileMode ? 'h-11 px-3 rounded-xl' : 'h-9 px-3'} font-normal ${
          isActive
            ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
            : 'hover:bg-primary/5 text-foreground'
        }`}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => onNavigate(item.id)}
        onKeyDown={(e) => handleNavKeyDown(e, allNavIds, item.id)}
      >
        <item.icon className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left text-sm">{item.label}</span>
        {item.badge != null && item.badge > 0 && (
          <Badge
            className={`text-[10px] px-1.5 min-w-[18px] h-4 flex items-center justify-center leading-none ${
              isActive
                ? 'bg-background/15 text-white border-background/25 dark:bg-background/20 dark:text-white dark:border-background/30'
                : item.badgeVariant === 'warning'
                ? 'bg-amber-100 text-amber-700 border-amber-200'
                : item.badgeVariant === 'destructive'
                ? 'bg-red-100 text-red-700 border-red-200'
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
      id="admin-sidebar"
      className={mobileMode
        ? 'w-full h-full min-h-0 flex flex-col shrink-0 relative z-20 bg-transparent'
        : 'w-64 min-h-screen flex flex-col shrink-0 relative z-20 bg-card/90 backdrop-blur-2xl border-l border-border/70 shadow-[0_0_0_1px_hsl(var(--border)/0.35),0_24px_60px_-20px_rgba(0,0,0,0.55)] dark:bg-card/80 dark:border-white/10 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_60px_-20px_rgba(0,0,0,0.7)] animate-slide-in-right fixed right-0 top-0 bottom-0 h-screen'}
      aria-label="Admin dashboard sidebar"
    >
      {mobileMode ? (
        <div className="px-4 pt-4 pb-3 border-b border-border/60 bg-background/95 backdrop-blur-xl sticky top-0 z-10">
          <div className="rounded-3xl border border-border/60 bg-card/85 backdrop-blur-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shrink-0 shadow-sm">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Admin Panel</p>
                <p className="text-base font-semibold text-foreground truncate">Zaymazone Admin</p>
                <p className="text-xs text-muted-foreground truncate">Manage platform & users</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 px-3 py-2.5">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate leading-tight">
                  {user?.name || 'Admin'}
                </p>
                {user?.email || ENV.adminEmail ? (
                  <p className="text-[11px] text-muted-foreground truncate leading-tight">
                    {user?.email || ENV.adminEmail}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ── Brand ─────────────────────────────────────────────────────────── */}
          <div className="px-5 py-4 border-b border-border/70 dark:border-white/10 bg-background/20 dark:bg-background/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shrink-0 shadow-sm">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-foreground">Admin Panel</p>
                <p className="text-[11px] text-muted-foreground">Zaymazone Admin</p>
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
                  {user?.name || 'Admin'}
                </p>
                {user?.email || ENV.adminEmail ? (
                  <p className="text-[11px] text-muted-foreground truncate leading-tight">
                    {user?.email || ENV.adminEmail}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Primary Navigation ─────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {primaryNav.map((item) => renderNavButton(item))}

        <Separator className="my-2 bg-border/50" />

        {secondaryNav.map((item) => renderNavButton(item))}
      </nav>

      {/* ── Secondary Navigation (Tools) ─────────────────────────────────── */}
      <div className="border-t border-border/70 dark:border-white/10 py-3 px-3 space-y-1">
        {toolsNav.map((item) => renderNavButton(item))}
      </div>
    </aside>
  );
}

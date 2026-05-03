import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, CheckCircle2, Package, ShoppingCart, Menu } from "lucide-react";

type AdminTab = "overview" | "approvals" | "products" | "orders";

interface AdminMobileBottomNavProps {
  activeTab: AdminTab;
  onNavigate: (tab: AdminTab) => void;
  onMenuOpen: () => void;
  pendingApprovals?: number;
}

interface NavItem {
  id: AdminTab | "__menu__";
  label: string;
  icon: React.ElementType;
  badge?: number;
  isMenu?: boolean;
}

export function AdminMobileBottomNav({
  activeTab,
  onNavigate,
  onMenuOpen,
  pendingApprovals = 0,
}: AdminMobileBottomNavProps) {
  const navItems = useMemo<NavItem[]>(() => ([
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "approvals", label: "Approvals", icon: CheckCircle2, badge: pendingApprovals || undefined },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "__menu__", label: "More", icon: Menu, isMenu: true },
  ]), [pendingApprovals]);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-inset-bottom"
      aria-label="Admin panel navigation"
    >
      <div className="flex items-center justify-around h-16 px-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = !item.isMenu && item.id === activeTab;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => (item.isMenu ? onMenuOpen() : onNavigate(item.id as AdminTab))}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all duration-200 ease-spring',
                'min-h-[44px] min-w-[44px]',
                isActive
                  ? 'text-primary bg-primary/10 shadow-glow scale-105'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5 active:scale-95'
              )}
            >
              <span className="relative inline-flex items-center justify-center">
                <Icon className={cn('h-5 w-5 mb-1 transition-transform duration-200', isActive && 'scale-110')} aria-hidden="true" />
                {item.badge ? (
                  <span className="absolute -top-2 -right-2 min-w-4 h-4 rounded-full bg-amber-500 text-[9px] font-bold text-white flex items-center justify-center px-1 border border-card">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </span>
              <span className={cn('text-xs font-medium transition-all duration-200 truncate w-full', isActive ? 'opacity-100 scale-105' : 'opacity-75')}>
                {item.label}
              </span>
              {isActive && <div className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary animate-pulse-glow" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default AdminMobileBottomNav;
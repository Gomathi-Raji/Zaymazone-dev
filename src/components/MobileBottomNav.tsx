// ── Module 14: User Mobile Bottom Navigation ─────────────────────────────
// Touch-optimised, keyboard-accessible bottom navigation for user pages
// on small screens. Appears on public pages (home, shop, artisans, about, profile)
import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  Store,
  MapPin,
  Info,
  User,
} from 'lucide-react';

interface UserMobileBottomNavProps {
  onMenuOpen?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'artisans', label: 'Artisan', icon: MapPin, path: '/artisans' },
  { id: 'shop', label: 'Shop', icon: Store, path: '/shop' },
  { id: 'about', label: 'About', icon: Info, path: '/about' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

export function UserMobileBottomNav({ onMenuOpen }: UserMobileBottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  // Determine active item based on current path
  const getActiveItem = () => {
    const pathMap: Record<string, string> = {
      '/': 'home',
      '/artisans': 'artisans',
      '/shop': 'shop',
      '/about': 'about',
      '/profile': 'profile',
    };
    return pathMap[location.pathname] || null;
  };

  const activeSection = getActiveItem();

  // Arrow-key navigation between buttons
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    const buttons = navRef.current?.querySelectorAll<HTMLButtonElement>('button[data-nav-item]');
    if (!buttons) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      buttons[(idx + 1) % buttons.length]?.focus();
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      buttons[(idx - 1 + buttons.length) % buttons.length]?.focus();
    }
  };

  return (
    <nav
      ref={navRef}
      className="user-mobile-nav lg:hidden"
      aria-label="User navigation"
    >
      {NAV_ITEMS.map(({ id, label, icon: Icon, path }, idx) => {
        const isActive = id === activeSection;

        return (
          <button
            key={id}
            type="button"
            data-nav-item="true"
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => path && navigate(path)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={cn(
              'user-mobile-nav__item',
              isActive && 'user-mobile-nav__item--active',
            )}
          >
            <span className="relative inline-flex items-center justify-center">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="user-mobile-nav__label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default UserMobileBottomNav;
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Shield, Store, User } from 'lucide-react';
import type { SavedAccountSession } from '@/lib/accountSwitcher';

interface AccountSwitcherDropdownProps {
  currentAccount: {
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'artisan' | 'user';
  };
  savedAccounts: SavedAccountSession[];
  onSwitchAccount: (account: SavedAccountSession) => void;
  onSignInAdmin: () => void;
  onSignInArtisan: () => void;
  onSignInUser: () => void;
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'A';

const getRoleMetaWithUser = (role: 'admin' | 'artisan' | 'user') =>
  role === 'admin'
    ? { label: 'Admin', icon: Shield }
    : role === 'artisan'
    ? { label: 'Artisan', icon: Store }
    : { label: 'Customer', icon: User };

export function AccountSwitcherDropdown({
  currentAccount,
  savedAccounts,
  onSwitchAccount,
  onSignInAdmin,
  onSignInArtisan,
  onSignInUser,
}: AccountSwitcherDropdownProps) {
  const currentMeta = getRoleMetaWithUser(currentAccount.role);
  const currentInitials = getInitials(currentAccount.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-11 gap-2 rounded-full border border-border/60 bg-card/80 px-3 pr-4 shadow-sm hover:bg-card/95 hover:border-border"
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={currentAccount.avatar} alt={currentAccount.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
              {currentInitials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 text-left sm:block">
            <div className="flex items-center gap-1.5">
              <currentMeta.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">{currentAccount.name}</span>
            </div>
            <p className="truncate text-[11px] text-muted-foreground">{currentAccount.email}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-2xl border-border/70 bg-card/95 p-2 shadow-xl backdrop-blur-xl">
        <DropdownMenuLabel className="px-3 py-2">
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentAccount.avatar} alt={currentAccount.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {currentInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <currentMeta.icon className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="truncate text-sm font-semibold text-foreground">{currentAccount.name}</p>
              </div>
              <p className="truncate text-xs text-muted-foreground">{currentAccount.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 pb-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Switch account
        </DropdownMenuLabel>
        {(() => {
          const otherAccounts = savedAccounts.filter(
            (account) => !(account.email === currentAccount.email && account.role === currentAccount.role)
          );
          return otherAccounts.length > 0 ? (
            otherAccounts.map((account) => {
              const AccountIcon = account.role === 'admin' ? Shield : account.role === 'artisan' ? Store : User;
              return (
                <DropdownMenuItem
                  key={account.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  onClick={() => onSwitchAccount(account)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={account.avatar} alt={account.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                      {getInitials(account.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <AccountIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate text-sm font-medium text-foreground">{account.name}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{account.email}</p>
                  </div>
                  <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {account.role}
                  </span>
                </DropdownMenuItem>
              );
            })
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">No saved accounts yet.</div>
          );
        })()}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 pb-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Add account
        </DropdownMenuLabel>
        <DropdownMenuItem className="rounded-xl px-3 py-2.5" onClick={onSignInAdmin}>
          <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
          Sign in as admin
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-xl px-3 py-2.5" onClick={onSignInArtisan}>
          <Store className="mr-2 h-4 w-4 text-muted-foreground" />
          Sign in as artisan
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-xl px-3 py-2.5" onClick={onSignInUser}>
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          Sign in as customer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

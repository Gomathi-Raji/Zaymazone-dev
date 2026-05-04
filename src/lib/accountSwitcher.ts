import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export type AccountRole = 'admin' | 'artisan' | 'user';

export interface SavedAccountSession {
  id: string;
  role: AccountRole;
  name: string;
  email: string;
  avatar?: string;
  accessToken: string;
  refreshToken?: string;
  lastUsed: string;
}

const ACCOUNT_REGISTRY_KEY = 'zaymazone_saved_accounts';

const AUTH_KEYS_TO_CLEAR = [
  'token',
  'refreshToken',
  'user',
  'auth_token',
  'firebase_id_token',
  'admin_token',
  'admin_refresh_token',
  'admin_user',
];

function safeParseSessions(raw: string | null): SavedAccountSession[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function makeSessionId(role: AccountRole, email: string) {
  return `${role}:${email.trim().toLowerCase()}`;
}

export function getSavedAccountSessions(): SavedAccountSession[] {
  if (typeof window === 'undefined') return [];
  return safeParseSessions(localStorage.getItem(ACCOUNT_REGISTRY_KEY)).sort(
    (left, right) => Date.parse(right.lastUsed) - Date.parse(left.lastUsed),
  );
}

export function saveAccountSession(session: Omit<SavedAccountSession, 'id' | 'lastUsed'>) {
  if (typeof window === 'undefined') return;

  const registry = getSavedAccountSessions();
  const nextSession: SavedAccountSession = {
    ...session,
    id: makeSessionId(session.role, session.email),
    lastUsed: new Date().toISOString(),
  };

  const filtered = registry.filter((item) => item.id !== nextSession.id);
  const nextRegistry = [nextSession, ...filtered].slice(0, 8);
  localStorage.setItem(ACCOUNT_REGISTRY_KEY, JSON.stringify(nextRegistry));
}

export function clearCurrentAuthSession() {
  if (typeof window === 'undefined') return;
  AUTH_KEYS_TO_CLEAR.forEach((key) => localStorage.removeItem(key));
}

export async function restoreSavedAccountSession(session: SavedAccountSession) {
  if (typeof window === 'undefined') return;

  try {
    await firebaseSignOut(auth);
  } catch {
    // ignore sign-out failures while switching accounts
  }

  clearCurrentAuthSession();

  if (session.role === 'artisan') {
    localStorage.setItem('token', session.accessToken);
    if (session.refreshToken) {
      localStorage.setItem('refreshToken', session.refreshToken);
    }
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: session.id,
        email: session.email,
        name: session.name,
        avatar: session.avatar,
        role: 'artisan',
      }),
    );
  } else if (session.role === 'user') {
    localStorage.setItem('auth_token', session.accessToken);
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: session.id,
        email: session.email,
        name: session.name,
        avatar: session.avatar,
        role: 'user',
      }),
    );
  } else {
    localStorage.setItem('admin_token', session.accessToken);
    if (session.refreshToken) {
      localStorage.setItem('admin_refresh_token', session.refreshToken);
    }
    localStorage.setItem(
      'admin_user',
      JSON.stringify({
        id: session.id,
        email: session.email,
        name: session.name,
        avatar: session.avatar,
        role: 'admin',
      }),
    );
  }

  saveAccountSession(session);
}

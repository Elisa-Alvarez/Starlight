import { create } from 'zustand';
import {
  User,
  signInWithEmail,
  signInWithGoogle,
  signInWithApple,
  signUpWithEmail,
  signOut as authSignOut,
  getSession,
} from '../services/auth';
import { identifyUser, logOutUser } from '../services/revenuecat';

interface AuthState {

  isInitialized: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;


  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signInWithApple: () => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isInitialized: false,
  isLoading: false,
  isAuthenticated: false,
  user: null,
  error: null,

  initialize: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true });

    try {
      const sessionData = await getSession();

      if (sessionData && sessionData.user) {
        set({
          isAuthenticated: true,
          user: sessionData.user,
        });

        // Link RevenueCat to authenticated user
        try {
          await identifyUser(sessionData.user.id);
        } catch (error) {
          }
      } else {
        set({
          isAuthenticated: false,
          user: null,
        });
      }
    } catch (error) {
      set({
        isAuthenticated: false,
        user: null,
      });
    }

    set({ isInitialized: true, isLoading: false });
  },

  signInWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    const result = await signInWithEmail(email, password);

    if (result.success && result.user) {
      set({
        isAuthenticated: true,
        user: result.user,
        isLoading: false,
      });

      try {
        await identifyUser(result.user.id);
      } catch (error) {
      }

      return true;
    }

    set({
      isLoading: false,
      error: result.error || 'Sign in failed',
    });
    return false;
  },

  signUpWithEmail: async (email: string, password: string, name?: string) => {
    set({ isLoading: true, error: null });

    const result = await signUpWithEmail(email, password, name);

    if (result.success && result.user) {
      set({
        isAuthenticated: true,
        user: result.user,
        isLoading: false,
      });

      try {
        await identifyUser(result.user.id);
      } catch (error) {
      }

      return true;
    }

    set({
      isLoading: false,
      error: result.error || 'Sign up failed',
    });
    return false;
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });

    const result = await signInWithGoogle();

    if (result.success && result.user) {
      set({
        isAuthenticated: true,
        user: result.user,
        isLoading: false,
      });

      try {
        await identifyUser(result.user.id);
      } catch (error) {
      }

      return true;
    }

    set({
      isLoading: false,
      error: result.error || 'Google sign in failed',
    });
    return false;
  },

  signInWithApple: async () => {
    set({ isLoading: true, error: null });

    const result = await signInWithApple();

    if (result.success && result.user) {
      set({
        isAuthenticated: true,
        user: result.user,
        isLoading: false,
      });

      try {
        await identifyUser(result.user.id);
      } catch (error) {
      }

      return true;
    }

    set({
      isLoading: false,
      error: result.error || 'Apple sign in failed',
    });
    return false;
  },

  signOut: async () => {
    set({ isLoading: true });

    try {
      await authSignOut();
      await logOutUser();
    } catch (error) {
    }

    set({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  },

  clearError: () => set({ error: null }),
}));

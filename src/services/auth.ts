import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

WebBrowser.maybeCompleteAuthSession();

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: boolean;
  createdAt: string;
}

function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null,
    image: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
    emailVerified: supabaseUser.email_confirmed_at !== null,
    createdAt: supabaseUser.created_at,
  };
}

export const getMobileRedirectUri = () => {
  return AuthSession.makeRedirectUri({
    scheme: 'starlight',
    path: 'auth/callback',
  });
};

export async function signUpWithEmail(
  email: string,
  password: string,
  name?: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name || '',
        },
      },
    });

    if (error) {
      return { success: false, error: error.message || 'Sign up failed' };
    }

    if (data.user) {
      const user = mapSupabaseUser(data.user);
      return { success: true, user };
    }

    return { success: false, error: 'Sign up failed' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Sign up failed' };
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message || 'Sign in failed' };
    }

    if (data.user) {
      const user = mapSupabaseUser(data.user);
      return { success: true, user };
    }

    return { success: false, error: 'Sign in failed' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Sign in failed' };
  }
}

function extractSessionFromUrl(url: string): { access_token: string; refresh_token: string } | null {
  const fragment = url.split('#')[1];
  if (!fragment) return null;

  const params = new URLSearchParams(fragment);
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');

  if (!access_token || !refresh_token) return null;
  return { access_token, refresh_token };
}

export async function signInWithGoogle(): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  try {
    const redirectUri = getMobileRedirectUri();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
      },
    });

    if (error) {
      return { success: false, error: error.message || 'Google sign in failed' };
    }

    if (data.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

      if (result.type === 'success' && result.url) {
        const tokens = extractSessionFromUrl(result.url);
        if (tokens) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession(tokens);

          if (sessionError) {
            return { success: false, error: sessionError.message || 'Failed to set session' };
          }

          if (sessionData.user) {
            if (!sessionData.user.id || !sessionData.user.email) {
              await supabase.auth.signOut();
              return { success: false, error: 'User account is incomplete. Please try again.' };
            }
            const user = mapSupabaseUser(sessionData.user);
            return { success: true, user };
          }
        }

        await supabase.auth.signOut();
        return { success: false, error: 'No tokens found in callback URL' };
      }

      if (result.type === 'cancel') {
        return { success: false, error: 'Google sign in was cancelled' };
      }
    }

    return { success: false, error: 'Google sign in failed' };
  } catch (error: any) {
    await supabase.auth.signOut();
    return { success: false, error: error.message || 'Failed to sign in with Google' };
  }
}

export async function signInWithApple(): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  try {
    const redirectUri = getMobileRedirectUri();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: redirectUri,
      },
    });

    if (error) {
      return { success: false, error: error.message || 'Apple sign in failed' };
    }

    if (data.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

      if (result.type === 'success' && result.url) {
        const tokens = extractSessionFromUrl(result.url);
        if (tokens) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession(tokens);

          if (sessionError) {
            return { success: false, error: sessionError.message || 'Failed to set session' };
          }

          if (sessionData.user) {
            if (!sessionData.user.id || !sessionData.user.email) {
              await supabase.auth.signOut();
              return { success: false, error: 'User account is incomplete. Please try again.' };
            }
            const user = mapSupabaseUser(sessionData.user);
            return { success: true, user };
          }
        }

        await supabase.auth.signOut();
        return { success: false, error: 'No tokens found in callback URL' };
      }

      if (result.type === 'cancel') {
        return { success: false, error: 'Apple sign in was cancelled' };
      }
    }

    return { success: false, error: 'Apple sign in failed' };
  } catch (error: any) {
    await supabase.auth.signOut();
    return { success: false, error: error.message || 'Failed to sign in with Apple' };
  }
}

export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
  }
}

export async function getSession(): Promise<{ user: User; session: Session } | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return null;
    }

    if (session && session.user) {
      const user = mapSupabaseUser(session.user);
      return { user, session };
    }

    return null;
  } catch {
    return null;
  }
}

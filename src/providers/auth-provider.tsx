import { AuthContext } from '@/hooks/use-auth-context';
import { supabase } from '@/lib/supabase';
import { api } from '@/services/api';
import type { Session } from '@supabase/supabase-js';
import { PropsWithChildren, useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const valid = await validateUser(session);
        if (!valid) {
          api.setAuthToken(null);
          setSession(null);
        } else {
          api.setAuthToken(session.access_token);
          setSession(session);
        }
      } else {
        api.setAuthToken(null);
      }
      setIsLoading(false);
      SplashScreen.hideAsync();
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const valid = await validateUser(session);
        if (!valid) {
          api.setAuthToken(null);
          setSession(null);
          return;
        }
        api.setAuthToken(session.access_token);
      } else {
        api.setAuthToken(null);
      }
      setSession(session);
      setIsLoading(false);
      SplashScreen.hideAsync();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Validate that the user has required fields; sign out if invalid
  const validateUser = async (session: Session): Promise<boolean> => {
    const user = session.user;
    if (!user?.id || !user?.email) {
      console.warn('Invalid user data, clearing session');
      await supabase.auth.signOut();
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile: null,
        isLoading,
        isLoggedIn: !!session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

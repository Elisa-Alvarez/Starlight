import { createClient } from '@supabase/supabase-js';
import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

const CHUNK_SIZE = 2000;

const ChunkedSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    const value = await getItemAsync(key);
    if (value === null) return null;

    // Check if this is a chunked value
    if (value.startsWith('__chunked__:')) {
      const count = parseInt(value.replace('__chunked__:', ''), 10);
      const chunks: string[] = [];
      for (let i = 0; i < count; i++) {
        const chunk = await getItemAsync(`${key}_chunk_${i}`);
        if (chunk === null) return null;
        chunks.push(chunk);
      }
      return chunks.join('');
    }

    return value;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (value.length <= CHUNK_SIZE) {
      await setItemAsync(key, value);
      return;
    }

    // Split into chunks
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }

    // Store chunk count as the main key
    await setItemAsync(key, `__chunked__:${chunks.length}`);
    for (let i = 0; i < chunks.length; i++) {
      await setItemAsync(`${key}_chunk_${i}`, chunks[i]);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    const value = await getItemAsync(key);
    if (value?.startsWith('__chunked__:')) {
      const count = parseInt(value.replace('__chunked__:', ''), 10);
      for (let i = 0; i < count; i++) {
        await deleteItemAsync(`${key}_chunk_${i}`);
      }
    }
    await deleteItemAsync(key);
  },
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  {
    auth: {
      storage: ChunkedSecureStoreAdapter as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
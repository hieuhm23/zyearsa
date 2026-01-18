import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ⚠️ TODO: THAY THẾ BẰNG URL VÀ KEY TỪ SUPABASE DASHBOARD CỦA BẠN
// 1. Vào https://supabase.com -> Sign up -> New Project
// 2. Vào Project Settings -> API -> Copy Project URL và Anon Key
const SUPABASE_URL = 'https://rhlusuhbrajumhdurqhf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJobHVzdWhicmFqdW1oZHVycWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NDcwNzcsImV4cCI6MjA4NDMyMzA3N30.28J658uJ-2Fe4jZqUBFw98MWfck6fmYmCRiOu5wbCMw';

const ExpoSecureStoreAdapter = {
    getItem: (key: string) => {
        return SecureStore.getItemAsync(key);
    },
    setItem: (key: string, value: string) => {
        SecureStore.setItemAsync(key, value);
    },
    removeItem: (key: string) => {
        SecureStore.deleteItemAsync(key);
    },
};

// Chỉ dùng SecureStore trên Mobile, trên Web dùng localStorage mặc định
const isMobile = Platform.OS !== 'web';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: isMobile ? ExpoSecureStoreAdapter : localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

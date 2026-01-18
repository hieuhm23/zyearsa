import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Alert } from 'react-native';

type UserProfile = {
    full_name?: string;
    role?: 'admin' | 'staff';
    store_id?: string;
};

type AuthContextType = {
    session: Session | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signIn: (email: string, pass: string) => Promise<{ error: any; data?: any }>;
    signOut: () => Promise<void>;
    isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    userProfile: null,
    loading: false,
    signIn: async () => ({ error: null }),
    signOut: async () => { },
    isAdmin: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Safety timeout: Nếu sau 3.5 giây không load xong thì tự tắt loading để vào app
        const timer = setTimeout(() => {
            if (loading) setLoading(false);
        }, 3500);

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchProfile(session.user.id);
            setLoading(false);
        }).catch(() => {
            // Fallback if Supabase not configured
            setLoading(false);
        }).finally(() => {
            clearTimeout(timer);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchProfile(session.user.id);
            else setUserProfile(null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) setUserProfile(data);
        } catch (e) {
            console.log('Profile fetch error (expected if tables not set up)', e);
        }
    };

    const signIn = async (email: string, pass: string) => {
        setLoading(true);
        try {
            // 1. Try Supabase Login
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password: pass,
            });

            if (!error && data.session) {
                // Success Online
                return { data, error: null };
            }

            setLoading(false);
            return { error: error || { message: 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.' } };
        } catch (e) {
            setLoading(false);
            return { error: e };
        }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (e) { }
        setSession(null);
        setUserProfile(null);
    };

    const isAdmin = userProfile?.role === 'admin' || session?.user?.email === 'admin@zyea.com';

    return (
        <AuthContext.Provider value={{ session, userProfile, loading, signIn, signOut, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

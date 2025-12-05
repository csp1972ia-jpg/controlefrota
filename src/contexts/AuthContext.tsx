import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type User = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, nomeCondutor: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    isAdmin: boolean;
    isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('fleet_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('ativo', true)
                .single();

            if (error || !data) {
                throw new Error('Usuário não encontrado');
            }

            // Validação simples de senha (comparação direta)
            // NOTA: Em produção, use bcrypt para hash de senhas
            if (data.password_hash !== password) {
                throw new Error('Senha incorreta');
            }

            setUser(data);
            localStorage.setItem('fleet_user', JSON.stringify(data));
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signUp = async (email: string, password: string, nomeCondutor: string) => {
        try {
            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single();

            if (existing) {
                throw new Error('Email já cadastrado');
            }

            const { data, error } = await supabase
                .from('users')
                .insert({
                    email,
                    password_hash: password,
                    nome_condutor: nomeCondutor,
                } as any)
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error('Erro ao criar usuário');

            setUser(data);
            localStorage.setItem('fleet_user', JSON.stringify(data));
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signOut = async () => {
        setUser(null);
        localStorage.removeItem('fleet_user');
    };

    const value: AuthContextType = {
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isAdmin: user?.permissoes === 'ADMIN',
        isUser: user?.permissoes === 'USER',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

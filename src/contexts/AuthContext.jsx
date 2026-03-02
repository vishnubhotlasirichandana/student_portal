import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('user');
            const token = localStorage.getItem('accessToken');
            if (stored && token) {
                const parsed = JSON.parse(stored);
                if (parsed.role === 'student') {
                    setUser(parsed);
                } else {
                    // Not a student — clear
                    localStorage.removeItem('user');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('streamToken');
                }
            }
        } catch {
            // Corrupt data — clear
            localStorage.removeItem('user');
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email, password) => {
        const res = await authApi.login({ email, password });
        const { tokens, user: userData } = res.data;

        if (userData.role !== 'student') {
            throw new Error('This portal is for students only.');
        }

        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        if (tokens.streamToken) {
            localStorage.setItem('streamToken', tokens.streamToken);
        }
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    }, []);

    const register = useCallback(async (data) => {
        // data includes: email, password, role, firstName, middleName, lastName,
        // currentAcademicStatus, institutionName, institutionWebsite, course, fieldOfStudy,
        // courseStartYear, courseEndYear
        const res = await authApi.register({ ...data, role: 'student' });
        return res.data;
    }, []);

    const verifyEmail = useCallback(async (code) => {
        const res = await authApi.verifyEmail({ code });
        return res.data;
    }, []);

    const logout = useCallback(async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await authApi.logout(refreshToken);
            }
        } catch {
            // Ignore — clearing local state regardless
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('streamToken');
        localStorage.removeItem('user');
        setUser(null);
    }, []);

    const isAuthenticated = !!user && !!localStorage.getItem('accessToken');

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, verifyEmail, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

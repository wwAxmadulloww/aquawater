import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { api } from '../api/client'

interface User {
    _id: string
    name: string
    phone: string
    role: 'customer' | 'admin' | 'worker' | 'courier' | 'super_admin'
    workerType?: string
    isPhoneVerified: boolean
    preferredLanguage: 'uz' | 'ru' | 'en'
    addresses: Array<{
        region: string; city: string; district: string
        street: string; house: string; apartment?: string
    }>
}

interface AuthContextType {
    user: User | null
    token: string | null
    loading: boolean
    login: (phone: string, password: string) => Promise<void>
    registerInitiate: (name: string, phone: string) => Promise<void>
    registerComplete: (phone: string, password: string) => Promise<void>
    verifyOtp: (phone: string, code: string) => Promise<void>
    resendOtp: (phone: string) => Promise<void>
    logout: () => void
    isAdmin: boolean
    isSuperAdmin: boolean
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('aq_token'))
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMe = async () => {
            if (!token) { setLoading(false); return }
            try {
                const res = await api.get('/auth/me')
                setUser(res.data)
            } catch {
                localStorage.removeItem('aq_token')
                setToken(null)
            } finally {
                setLoading(false)
            }
        }
        fetchMe()
    }, [token])

    const login = async (phone: string, password: string) => {
        try {
            const res = await api.post('/auth/login', { phone, password })
            const { token: t, user: u } = res.data
            localStorage.setItem('aq_token', t)
            setToken(t)
            setUser(u)
        } catch (err: any) {
            if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
                // Return special error to be handled by LoginPage
                throw err
            }
            throw err
        }
    }

    const registerInitiate = async (name: string, phone: string) => {
        await api.post('/auth/register/initiate', { name, phone })
    }

    const registerComplete = async (phone: string, password: string) => {
        const res = await api.post('/auth/register/complete', { phone, password })
        const { token: t, user: u } = res.data
        localStorage.setItem('aq_token', t)
        setToken(t)
        setUser(u)
    }

    const verifyOtp = async (phone: string, code: string) => {
        await api.post('/auth/verify-otp', { phone, code })
    }

    const resendOtp = async (phone: string) => {
        await api.post('/auth/resend-otp', { phone })
    }

    const logout = () => {
        localStorage.removeItem('aq_token')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{
            user, token, loading,
            login, registerInitiate, registerComplete, verifyOtp, resendOtp, logout,
            isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
            isSuperAdmin: user?.role === 'super_admin',
            isAuthenticated: !!user && user.isPhoneVerified,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}

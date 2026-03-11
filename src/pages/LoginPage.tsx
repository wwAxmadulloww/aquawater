import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Phone, Lock, User, Eye, EyeOff, Droplets, ArrowRight, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import toast from 'react-hot-toast'

type Mode = 'login' | 'register' | 'verify'

export default function LoginPage() {
    const { t } = useLanguage()
    const { login, register, verifyOtp, resendOtp, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [mode, setMode] = useState<Mode>('login')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('+998')
    const [password, setPassword] = useState('')
    const [code, setCode] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [resendTimer, setResendTimer] = useState(0)

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }
    }, [isAuthenticated, navigate])

    useEffect(() => {
        let timer: any
        if (resendTimer > 0) {
            timer = setInterval(() => setResendTimer(prev => prev - 1), 1000)
        }
        return () => clearInterval(timer)
    }, [resendTimer])

    const mutation = useMutation({
        mutationFn: async () => {
            if (mode === 'login') {
                try {
                    await login(phone, password)
                } catch (err: any) {
                    if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
                        setMode('verify')
                        toast.success('Iltimos, telefon raqamingizni tasdiqlang')
                        return
                    }
                    throw err
                }
            } else if (mode === 'register') {
                await register(name, phone, password)
                setResendTimer(60)
                setMode('verify')
            } else if (mode === 'verify') {
                await verifyOtp(phone, code)
            }
        },
        onSuccess: () => {
            if (mode === 'login' || mode === 'verify') {
                toast.success('Muvaffaqiyatli!')
                navigate('/')
            } else if (mode === 'register') {
                toast.success('SMS kod yuborildi')
            }
        },
        onError: (err: any) => {
            console.error('Auth error:', err)
            const msg = err.response?.data?.message || (err.message === 'Network Error' ? 'Serverga ulanib bo\'lmadi' : t('common.error'))
            toast.error(msg)
        }
    })

    const handleResend = async () => {
        if (resendTimer > 0) return
        try {
            await resendOtp(phone)
            setResendTimer(60)
            toast.success('Tasdiqlash kodi qayta yuborildi')
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Xatolik yuz berdi')
        }
    }

    const handlePhoneChange = (v: string) => {
        if (!v.startsWith('+998')) return
        if (v.length > 13) return
        const digits = v.slice(4).replace(/\D/g, '')
        setPhone('+998' + digits)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (mode === 'register' && name.trim().length < 2) {
            toast.error('Ism kamida 2 harfdan iborat bo\'lishi kerak')
            return
        }
        if (phone.length !== 13) {
            toast.error('Telefon raqamni to\'liq kiriting (+998XXXXXXXXX)')
            return
        }
        if (mode !== 'verify' && password.length < 6) {
            toast.error('Parol kamida 6 belgidan iborat bo\'lishi kerak')
            return
        }
        if (mode === 'verify' && code.length !== 6) {
            toast.error('6 xonali kodni kiriting')
            return
        }
        mutation.mutate()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-water-light flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
                        <Droplets className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">AquaWater Uzbekistan</h1>
                    <p className="text-gray-500 text-sm mt-1">Toza suv yetkazib berish xizmati</p>
                </div>

                {/* Card */}
                <div className="card p-8">
                    {mode !== 'verify' ? (
                        <>
                            {/* Tabs */}
                            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                                {(['login', 'register'] as Mode[]).map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setMode(m)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {t(`auth.${m}` as any)}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {mode === 'register' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.name')}</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                className="input pl-10"
                                                placeholder="Ism Familiya"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.phone')}</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={e => handlePhoneChange(e.target.value)}
                                            className="input pl-10 font-mono"
                                            placeholder="+998 XX XXX XX XX"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Format: +998XXXXXXXXX</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.password')}</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="input pl-10 pr-10"
                                            placeholder="••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="btn-primary w-full py-3 text-base justify-center gap-2 mt-2"
                                >
                                    {mutation.isPending && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                                    {t(mode === 'login' ? 'auth.loginBtn' : 'auth.registerBtn')}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Tasdiqlash kodini kiriting</h2>
                            <p className="text-gray-500 text-sm mb-6">
                                {phone} raqamiga yuborilgan 6 xonali SMS kodni kiriting
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="flex justify-center">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={code}
                                        onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                                        className="w-full max-w-[200px] text-center text-3xl font-bold tracking-[0.5em] h-16 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 px-2"
                                        placeholder="000000"
                                        autoFocus
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="btn-primary w-full py-3 text-base justify-center gap-2"
                                >
                                    {mutation.isPending && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                                    Tasdiqlash <ArrowRight className="w-4 h-4" />
                                </button>

                                <div className="text-sm">
                                    {resendTimer > 0 ? (
                                        <p className="text-gray-400">
                                            Kod qayta yuborilishi: <span className="font-medium text-gray-600">{resendTimer}s</span>
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResend}
                                            className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1.5 mx-auto"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Kodni qayta yuborish
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setMode('login')}
                                    className="text-gray-400 text-sm hover:text-gray-600"
                                >
                                    Ortga qaytish
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

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
    const { login, registerInitiate, registerComplete, verifyOtp, resendOtp, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [mode, setMode] = useState<Mode>('login')
    const [registrationStep, setRegistrationStep] = useState(1)
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
                if (registrationStep === 1) {
                    await registerInitiate(name, phone)
                    setResendTimer(60)
                    setRegistrationStep(2)
                } else if (registrationStep === 2) {
                    await verifyOtp(phone, code)
                    setRegistrationStep(3)
                } else if (registrationStep === 3) {
                    await registerComplete(phone, password)
                }
            } else if (mode === 'verify') {
                await verifyOtp(phone, code)
            }
        },
        onSuccess: () => {
            if (mode === 'login' || (mode === 'register' && registrationStep === 3) || mode === 'verify') {
                toast.success('Muvaffaqiyatli!')
                navigate('/')
            } else if (mode === 'register' && registrationStep === 1) {
                toast.success('SMS kod yuborildi')
            } else if (mode === 'register' && registrationStep === 2) {
                toast.success('Telefon tasdiqlandi. Parol o\'rnating.')
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
        if (mode === 'register') {
            if (registrationStep === 1) {
                if (name.trim().length < 2) {
                    toast.error('Ism kamida 2 harfdan iborat bo\'lishi kerak')
                    return
                }
                if (phone.length !== 13) {
                    toast.error('Telefon raqamni to\'liq kiriting (+998XXXXXXXXX)')
                    return
                }
            } else if (registrationStep === 2) {
                if (code.length !== 6) {
                    toast.error('6 xonali kodni kiriting')
                    return
                }
            } else if (registrationStep === 3) {
                if (password.length < 6) {
                    toast.error('Parol kamida 6 belgidan iborat bo\'lishi kerak')
                    return
                }
            }
        } else if (mode === 'login') {
            if (phone.length !== 13) {
                toast.error('Telefon raqamni to\'liq kiriting (+998XXXXXXXXX)')
                return
            }
            if (password.length < 1) {
                toast.error('Parolni kiriting')
                return
            }
        } else if (mode === 'verify') {
            if (code.length !== 6) {
                toast.error('6 xonali kodni kiriting')
                return
            }
        }
        mutation.mutate()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-water-light flex items-center justify-center p-4 text-[#0a0f18]">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-200">
                        <Droplets className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">AquaWater Uzbekistan</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Professional yetkazib berish xizmati</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-[32px] p-8 shadow-2xl shadow-primary-100 border border-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />

                    {mode === 'login' && (
                        <>
                            {/* Tabs */}
                            <div className="flex bg-gray-50 rounded-2xl p-1.5 mb-8 border border-gray-100">
                                {(['login', 'register'] as Mode[]).map(m => (
                                    <button
                                        key={m}
                                        onClick={() => { setMode(m); setRegistrationStep(1) }}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === m ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        {t(`auth.${m}` as any)}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('auth.phone')}</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={e => handlePhoneChange(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all font-bold text-gray-900"
                                            placeholder="+998 XX XXX XX XX"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('auth.password')}</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all font-bold text-gray-900"
                                            placeholder="••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(v => !v)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary-600 transition-colors"
                                        >
                                            {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="btn-primary w-full py-4 text-base font-black uppercase tracking-widest justify-center gap-3 mt-4 rounded-2xl shadow-xl shadow-primary-200"
                                >
                                    {mutation.isPending && <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />}
                                    {t('auth.loginBtn')}
                                </button>
                            </form>
                        </>
                    )}

                    {mode === 'register' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Registration steps header */}
                            <div className="flex items-center gap-2 mb-8">
                                {[1, 2, 3].map(s => (
                                    <div key={s} className="flex-1 flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${registrationStep >= s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            {s}
                                        </div>
                                        {s < 3 && <div className={`flex-1 h-0.5 rounded-full ${registrationStep > s ? 'bg-primary-600' : 'bg-gray-100'}`} />}
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {registrationStep === 1 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h2 className="text-xl font-black text-gray-900 mb-6 underline decoration-primary-200 decoration-4 underline-offset-4">Siz bilan tanishib olamiz</h2>
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('auth.name')}</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={e => setName(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all font-bold text-gray-900"
                                                    placeholder="Ismingizni kiriting"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('auth.phone')}</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={e => handlePhoneChange(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all font-bold text-gray-900"
                                                    placeholder="+998 XX XXX XX XX"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {registrationStep === 2 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
                                        <h2 className="text-xl font-black text-gray-900 mb-2">Telefoningizni tasdiqlang</h2>
                                        <p className="text-gray-400 text-sm mb-6">Biz <span className="text-gray-900 font-bold">{phone}</span> raqamiga kod yubordik</p>

                                        <div className="flex justify-center">
                                            <input
                                                type="text"
                                                maxLength={6}
                                                value={code}
                                                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                                                className="w-full max-w-[240px] text-center text-4xl font-black tracking-[0.4em] h-20 rounded-3xl border-transparent bg-gray-50 focus:bg-white focus:ring-8 focus:ring-primary-50 focus:border-primary-200 transition-all text-primary-600"
                                                placeholder="000000"
                                                autoFocus
                                                required
                                            />
                                        </div>

                                        <div className="text-sm">
                                            {resendTimer > 0 ? (
                                                <p className="text-gray-400 font-medium">
                                                    Kodni qayta yuborish: <span className="text-primary-600 font-black">{resendTimer}s</span>
                                                </p>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={handleResend}
                                                    className="text-primary-600 font-black flex items-center gap-2 mx-auto hover:scale-105 transition-transform"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                    Kodni qayta yuborish
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {registrationStep === 3 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h2 className="text-xl font-black text-gray-900 mb-6">Xavfsizlik o'rnating</h2>
                                        <p className="text-gray-400 text-sm mb-6 font-medium">Hisobingizni himoya qilish uchun kuchli parol yarating</p>
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Yangi parol</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                                                <input
                                                    type={showPass ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all font-bold text-gray-900"
                                                    placeholder="Kamida 6 belgi"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPass(v => !v)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary-600 transition-colors"
                                                >
                                                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="btn-primary w-full py-4 text-base font-black uppercase tracking-widest justify-center gap-3 mt-4 rounded-2xl shadow-xl shadow-primary-200"
                                >
                                    {mutation.isPending && <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />}
                                    {registrationStep === 1 ? 'Keyingisi' : registrationStep === 2 ? 'Tasdiqlash' : 'Tayyor!'}
                                    <ArrowRight className="w-5 h-5" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setMode('login'); setRegistrationStep(1) }}
                                    className="w-full text-center text-gray-400 text-xs font-black uppercase tracking-widest hover:text-primary-600 transition-colors py-2"
                                >
                                    Login sahifasiga qaytish
                                </button>
                            </form>
                        </div>
                    )}

                    {mode === 'verify' && (
                        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-black text-gray-900 mb-2 underline decoration-primary-200 decoration-4 underline-offset-4">Tasdiqlash kodi</h2>
                            <p className="text-gray-400 text-sm mb-8 font-medium">
                                <span className="text-gray-900 font-bold">{phone}</span> raqamiga yuborilgan 6 xonali SMS kodni kiriting
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="flex justify-center">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={code}
                                        onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                                        className="w-full max-w-[240px] text-center text-4xl font-black tracking-[0.4em] h-20 rounded-3xl border-transparent bg-gray-50 focus:bg-white focus:ring-8 focus:ring-primary-50 focus:border-primary-200 transition-all text-primary-600"
                                        placeholder="000000"
                                        autoFocus
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="btn-primary w-full py-4 text-base font-black uppercase tracking-widest justify-center gap-3 rounded-2xl shadow-xl shadow-primary-200"
                                >
                                    {mutation.isPending && <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />}
                                    Tasdiqlash <ArrowRight className="w-5 h-5" />
                                </button>

                                <div className="text-sm">
                                    {resendTimer > 0 ? (
                                        <p className="text-gray-400 font-medium">
                                            Kodni qayta yuborish: <span className="text-primary-600 font-black">{resendTimer}s</span>
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResend}
                                            className="text-primary-600 font-black flex items-center gap-2 mx-auto hover:underline"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Kodni qayta yuborish
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setMode('login')}
                                    className="text-gray-400 text-xs font-black uppercase tracking-widest hover:text-gray-600 block mx-auto py-2"
                                >
                                    ← Ortga qaytish
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

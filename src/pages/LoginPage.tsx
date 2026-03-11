import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Phone, Lock, User, Eye, EyeOff, Droplets, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import toast from 'react-hot-toast'

type Mode = 'login' | 'register'

export default function LoginPage() {
    const { t } = useLanguage()
    const { login, sendOtp, register, verifyOtp, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const [mode, setMode] = useState<Mode>('login')
    const [registrationStep, setRegistrationStep] = useState(1) // 1: Phone, 2: OTP, 3: Details

    // Form fields
    const [phone, setPhone] = useState('+998')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [name, setName] = useState('')
    const [code, setCode] = useState('')

    // UI state
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
                await login(phone, password)
            } else {
                if (registrationStep === 1) {
                    await sendOtp(phone)
                    return { nextStep: 2 }
                } else if (registrationStep === 2) {
                    await verifyOtp(phone, code)
                    return { nextStep: 3 }
                } else {
                    await register(phone, name, password)
                    return { finished: true }
                }
            }
        },
        onSuccess: (data: any) => {
            if (mode === 'login' || data?.finished) {
                toast.success('Muvaffaqiyatli!')
                navigate('/')
            } else if (data?.nextStep) {
                if (data.nextStep === 2) {
                    setResendTimer(60)
                    toast.success('Tasdiqlash kodi yuborildi')
                } else if (data.nextStep === 3) {
                    toast.success('Telefon raqami tasdiqlandi')
                }
                setRegistrationStep(data.nextStep)
            }
        },
        onError: (err: any) => {
            console.error('Auth error:', err)
            const msg = err.response?.data?.message || err.message || 'Xatolik yuz berdi'
            toast.error(msg)
        }
    })

    const handlePhoneChange = (v: string) => {
        if (!v.startsWith('+998')) return
        if (v.length > 13) return
        const digits = v.slice(4).replace(/\D/g, '')
        setPhone('+998' + digits)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (mode === 'login') {
            if (phone.length !== 13) return toast.error('Telefon raqamini to\'liq kiriting')
            if (password.length < 1) return toast.error('Parolni kiriting')
        } else {
            if (registrationStep === 1 && phone.length !== 13) return toast.error('Telefon raqamini to\'liq kiriting')
            if (registrationStep === 2 && code.length < 4) return toast.error('Tasdiqlash kodini kiriting')
            if (registrationStep === 3) {
                if (name.trim().length < 2) return toast.error('Ismingizni kiriting')
                if (password.length < 6) return toast.error('Parol kamida 6 belgidan iborat bo\'lishi kerak')
                if (password !== confirmPassword) return toast.error('Parollar mos kelmadi')
            }
        }
        mutation.mutate()
    }

    const handleResend = async () => {
        if (resendTimer > 0) return
        try {
            await sendOtp(phone)
            setResendTimer(60)
            toast.success('Kod qayta yuborildi')
        } catch (err: any) {
            toast.error('Xatolik yuz berdi')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-primary-100 font-sans">
            <div className="w-full max-w-md">
                {/* Brand Logo */}
                <div className="text-center mb-10 group cursor-default">
                    <div className="w-20 h-20 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-[2.5rem] flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-primary-200 rotation-slow border-4 border-white">
                        <Droplets className="w-10 h-10 text-white drop-shadow-lg" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">AquaWater</h1>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mt-2">Uzbekistan</p>
                </div>

                {/* Main Auth Container */}
                <div className="bg-white rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.08)] border border-slate-100/50 p-8 md:p-10 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-50 rounded-full blur-3xl opacity-50" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary-100 rounded-full blur-3xl opacity-30" />

                    {/* Mode Selector (Only on Step 1) */}
                    {registrationStep === 1 && (
                        <div className="flex bg-slate-50 p-1.5 rounded-[22px] mb-10 relative z-10 transition-all">
                            <button
                                onClick={() => setMode('login')}
                                className={`flex-1 py-3.5 text-[11px] font-black uppercase tracking-widest rounded-[18px] transition-all duration-300 ${mode === 'login' ? 'bg-white text-primary-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Kirish
                            </button>
                            <button
                                onClick={() => setMode('register')}
                                className={`flex-1 py-3.5 text-[11px] font-black uppercase tracking-widest rounded-[18px] transition-all duration-300 ${mode === 'register' ? 'bg-white text-primary-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Ro'yxatdan o'tish
                            </button>
                        </div>
                    )}

                    {/* Registration Progress (Only on Register Mode) */}
                    {mode === 'register' && (
                        <div className="mb-10 relative z-10">
                            <div className="flex justify-between items-end mb-3">
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                    {registrationStep === 1 ? 'Telefon raqam' : registrationStep === 2 ? 'Tasdiqlash' : 'Akkaunt yaratish'}
                                </h2>
                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full">
                                    Qadam {registrationStep} / 3
                                </span>
                            </div>
                            <div className="flex gap-2.5 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                {[1, 2, 3].map(s => (
                                    <div
                                        key={s}
                                        className={`flex-1 rounded-full transition-all duration-700 ease-out ${registrationStep >= s ? 'bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-transparent'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                        {/* 1. LOGIN MODE */}
                        {mode === 'login' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefon raqam</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={e => handlePhoneChange(e.target.value)}
                                            className="w-full pl-14 pr-5 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-[20px] focus:bg-white focus:border-primary-500/20 focus:ring-8 focus:ring-primary-500/5 transition-all font-bold text-slate-900 outline-none"
                                            placeholder="+998 XX XXX XX XX"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parol</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full pl-14 pr-14 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-[20px] focus:bg-white focus:border-primary-500/20 focus:ring-8 focus:ring-primary-500/5 transition-all font-bold text-slate-900 outline-none"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary-600 transition-colors"
                                        >
                                            {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. REGISTER MODE - STEP 1 */}
                        {mode === 'register' && registrationStep === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">Xush kelibsiz!</h3>
                                    <p className="text-slate-400 text-sm mt-1">Ro'yxatdan o'tish uchun telefon raqamingizni kiriting</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefon raqam</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={e => handlePhoneChange(e.target.value)}
                                            className="w-full pl-14 pr-5 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-[20px] focus:bg-white focus:border-primary-500/20 focus:ring-8 focus:ring-primary-500/5 transition-all font-bold text-slate-900 outline-none"
                                            placeholder="+998 XX XXX XX XX"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. REGISTER MODE - STEP 2 */}
                        {mode === 'register' && registrationStep === 2 && (
                            <div className="space-y-10 animate-in zoom-in-95 duration-500 text-center">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-slate-800">Tasdiqlash kodi</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Kod <span className="text-primary-600 font-black">{phone}</span> raqamiga yuborildi
                                    </p>
                                </div>
                                <div className="flex flex-col items-center gap-8">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={code}
                                        onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                                        className="w-full max-w-[280px] text-center text-4xl font-black tracking-[0.5em] h-20 bg-slate-50 border-transparent rounded-[28px] focus:bg-white focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500/20 transition-all text-primary-600 shadow-inner outline-none"
                                        placeholder="000000"
                                        autoFocus
                                        required
                                    />

                                    <div className="w-full space-y-4">
                                        {resendTimer > 0 ? (
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                                                <RefreshCw className="w-3 h-3 animate-spin" />
                                                Qayta yuborish: <span className="text-primary-600 font-bold">{resendTimer}s</span>
                                            </p>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleResend}
                                                className="text-[11px] font-black text-primary-600 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-50 px-6 py-2.5 rounded-full transition-all"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                Kodni qayta yuborish
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => setRegistrationStep(1)}
                                            className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-colors block mx-auto"
                                        >
                                            ← Raqamni o'zgartirish
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. REGISTER MODE - STEP 3 */}
                        {mode === 'register' && registrationStep === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                                <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-2xl mb-4 border border-emerald-100">
                                    <div className="bg-emerald-500 p-1.5 rounded-full">
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-sm font-bold text-emerald-800">Raqam tasdiqlandi!</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ism va familiya</label>
                                    <div className="relative group">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full pl-14 pr-5 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-[20px] focus:bg-white focus:border-primary-500/20 transition-all font-bold text-slate-900 outline-none"
                                            placeholder="Ismingizni kiriting"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parol</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full pl-14 pr-14 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-[20px] focus:bg-white focus:border-primary-500/20 transition-all font-bold text-slate-900 outline-none"
                                            placeholder="Kamida 6 belgi"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary-600 transition-colors"
                                        >
                                            {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parolni tasdiqlang</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            className="w-full pl-14 pr-5 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-[20px] focus:bg-white focus:border-primary-500/20 transition-all font-bold text-slate-900 outline-none"
                                            placeholder="Parolni qayta kiriting"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Global Submit Button */}
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className={`w-full py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group mt-8 ${mode === 'login' || registrationStep === 3 ? 'bg-slate-900 text-white shadow-slate-900/10' : 'bg-primary-600 text-white shadow-primary-600/20'}`}
                        >
                            {mutation.isPending ? (
                                <RefreshCw className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    {mode === 'login' ? 'Tizimga kirish' : registrationStep === 1 ? 'Davom etish' : registrationStep === 2 ? 'Tasdiqlash' : 'Akkaunt yaratish'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-12 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] drop-shadow-sm">
                    © {new Date().getFullYear()} AquaWater Uzbekistan
                </p>
            </div>

            <style>{`
                @keyframes rotation {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .rotation-slow {
                    animation: rotation 20s linear infinite;
                }
                .tracking-tighter { letter-spacing: -0.05em; }
                input::placeholder { color: #cbd5e1; font-weight: 600; }
            `}</style>
        </div>
    )
}

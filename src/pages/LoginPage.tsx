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
    const { login, sendOtp, register, verifyOtp, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [mode, setMode] = useState<Mode>('login')
    const [registrationStep, setRegistrationStep] = useState(1)
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('+998')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
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
                await login(phone, password)
            } else if (mode === 'register') {
                if (registrationStep === 1) {
                    await sendOtp(phone)
                    setResendTimer(60)
                    setRegistrationStep(2)
                } else if (registrationStep === 2) {
                    await verifyOtp(phone, code)
                    setRegistrationStep(3)
                } else if (registrationStep === 3) {
                    await register(phone, name, password)
                }
            } else if (mode === 'verify') {
                await verifyOtp(phone, code)
            }
        },
        onSuccess: (data: any) => {
            if (mode === 'login' || (mode === 'register' && registrationStep === 3) || (mode === 'verify' && data?.token)) {
                toast.success('Muvaffaqiyatli!')
                navigate('/')
            } else if (mode === 'register' && registrationStep === 1) {
                toast.success('Tasdiqlash kodi yuborildi')
            } else if (mode === 'register' && registrationStep === 2) {
                toast.success('Telefon raqami tasdiqlandi. Ismingiz va parolingizni kiriting.')
            }
        },
        onError: (err: any) => {
            console.error('Auth error:', err)
            const msg = err.response?.data?.message || err.message || t('common.error')
            toast.error(msg)

            // If verification failed in step 2, don't move forward
            if (mode === 'register' && registrationStep === 2) {
                // keep at step 2
            }
        }
    })

    const handleResend = async () => {
        if (resendTimer > 0) return
        try {
            await sendOtp(phone)
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
                if (phone.length !== 13) {
                    toast.error('Telefon raqamni to\'liq kiriting (+998XXXXXXXXX)')
                    return
                }
            } else if (registrationStep === 2) {
                if (code.length < 4) {
                    toast.error('Tasdiqlash kodini kiriting')
                    return
                }
            } else if (registrationStep === 3) {
                if (name.trim().length < 2) {
                    toast.error('Ism kamida 2 harfdan iborat bo\'lishi kerak')
                    return
                }
                if (password.length < 6) {
                    toast.error('Parol kamida 6 belgidan iborat bo\'lishi kerak')
                    return
                }
                if (password !== confirmPassword) {
                    toast.error('Parollar mos kelmadi')
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
        }
        mutation.mutate()
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 selection:bg-primary-100">
            <div className="w-full max-w-lg">
                {/* Logo Section */}
                <div className="text-center mb-8 group cursor-default">
                    <div className="w-16 h-16 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-200/50 group-hover:scale-105 transition-all duration-300">
                        <Droplets className="w-8 h-8 text-white drop-shadow-md" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">AquaWater</h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Uzbekistan</p>
                </div>

                {/* Main Auth Card */}
                <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden">
                    {/* Mode Switcher */}
                    {registrationStep === 1 && (
                        <div className="flex p-1 bg-slate-50 rounded-2xl mb-8 relative z-10 scale-95">
                            <button
                                onClick={() => { setMode('login'); setRegistrationStep(1) }}
                                className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${mode === 'login' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Kirish
                            </button>
                            <button
                                onClick={() => { setMode('register'); setRegistrationStep(1) }}
                                className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${mode === 'register' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Ro'yxatdan o'tish
                            </button>
                        </div>
                    )}

                    {/* Progress indicator for registration */}
                    {mode === 'register' && (
                        <div className="mb-10 relative z-10 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">
                                    Qadam {registrationStep} / 3
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {registrationStep === 1 ? 'Raqam' : registrationStep === 2 ? 'Tasdiqlash' : 'Ma\'lumotlar'}
                                </span>
                            </div>
                            <div className="flex gap-2 h-1.5">
                                {[1, 2, 3].map(s => (
                                    <div
                                        key={s}
                                        className={`flex-1 rounded-full transition-all duration-500 ${registrationStep >= s ? 'bg-primary-500' : 'bg-slate-100'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {mode === 'login' && (
                        <div className="animate-in fade-in zoom-in-95 duration-500 relative z-10">
                            <div className="mb-8">
                                <h2 className="text-xl font-black text-slate-800">Xush kelibsiz!</h2>
                                <p className="text-slate-400 text-sm mt-1">Tizimga kirish uchun ma'lumotlarni kiriting</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefon raqam</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={e => handlePhoneChange(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-500/20 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold text-slate-900 placeholder:text-slate-300 outline-none"
                                            placeholder="+998 XX XXX XX XX"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parol</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-500/20 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold text-slate-900 placeholder:text-slate-300 outline-none"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(v => !v)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary-600 transition-colors"
                                        >
                                            {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group mt-4"
                                >
                                    {mutation.isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <>Tizimga kirish <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                                </button>
                            </form>
                        </div>
                    )}

                    {mode === 'register' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 relative z-10">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {registrationStep === 1 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800">Ro'yxatdan o'tish</h2>
                                            <p className="text-slate-400 text-sm mt-1">Davom etish uchun telefon raqamingizni kiriting</p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefon raqam</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={e => handlePhoneChange(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-500/20 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold text-slate-900 outline-none"
                                                    placeholder="+998 XX XXX XX XX"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {registrationStep === 2 && (
                                    <div className="space-y-8 text-center animate-in zoom-in-95 duration-300">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800">Kodni tasdiqlang</h2>
                                            <p className="text-slate-400 text-sm mt-1">
                                                <span className="text-primary-600 font-bold">{phone}</span> raqamiga kod yubordik
                                            </p>
                                        </div>

                                        <div className="flex justify-center flex-col items-center gap-6">
                                            <input
                                                type="text"
                                                maxLength={6}
                                                value={code}
                                                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                                                className="w-full max-w-[240px] text-center text-3xl font-black tracking-[0.5em] py-5 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-primary-500/20 transition-all text-primary-600 outline-none"
                                                placeholder="000000"
                                                autoFocus
                                                required
                                            />

                                            <div className="flex flex-col gap-3 w-full">
                                                {resendTimer > 0 ? (
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 py-2">
                                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                                        Qayta yuborish: <span className="text-primary-600">{resendTimer}s</span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={handleResend}
                                                        className="text-[10px] font-black text-primary-600 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-50 py-2 rounded-xl transition-all"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                        Kodni qayta yuborish
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => setRegistrationStep(1)}
                                                    className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-colors"
                                                >
                                                    ← Raqamni o'zgartirish
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {registrationStep === 3 && (
                                    <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-300">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800">Ma'lumotlarni kiriting</h2>
                                            <p className="text-slate-400 text-sm mt-1">Ro'yxatdan o'tishni yakunlash uchun</p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ism familiya</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={e => setName(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-500/20 transition-all font-bold text-slate-900 outline-none"
                                                    placeholder="Ismingiz"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parol yarating</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                                <input
                                                    type={showPass ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-500/20 transition-all font-bold text-slate-900 outline-none"
                                                    placeholder="Kamida 6 belgi"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPass(v => !v)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary-600 transition-colors"
                                                >
                                                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parolni tasdiqlang</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                                <input
                                                    type={showPass ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={e => setConfirmPassword(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-500/20 transition-all font-bold text-slate-900 outline-none"
                                                    placeholder="Qayta kiriting"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-primary-600/10 hover:shadow-primary-600/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group mt-6"
                                >
                                    {mutation.isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <>
                                        {registrationStep === 1 ? 'Kodni olish' : registrationStep === 2 ? 'Tasdiqlash' : 'Hisobni yaratish'}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                <p className="text-center mt-8 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    © {new Date().getFullYear()} AquaWater Uzbekistan
                </p>
            </div>
        </div>
    )
}

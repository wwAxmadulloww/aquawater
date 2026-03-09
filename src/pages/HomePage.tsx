import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Droplets, Clock, Phone, CreditCard, ShieldCheck, ChevronRight } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { getProducts } from '../api/client'
import ProductCard from '../components/ProductCard'

const HOW_STEPS = [
    { icon: '🔍', key: 'step1' },
    { icon: '📋', key: 'step2' },
    { icon: '🚚', key: 'step3' },
] as const

const TRUST = [
    { icon: <Clock className="w-6 h-6 text-primary-600" />, key: 'home.trust.delivery' },
    { icon: <Phone className="w-6 h-6 text-primary-600" />, key: 'home.trust.support' },
    { icon: <CreditCard className="w-6 h-6 text-primary-600" />, key: 'home.trust.payment' },
    { icon: <ShieldCheck className="w-6 h-6 text-primary-600" />, key: 'home.trust.quality' },
] as const

export default function HomePage() {
    const { t } = useLanguage()
    const { data: products } = useQuery({
        queryKey: ['products-home'],
        queryFn: () => getProducts(),
    })

    const featuredProducts = products?.slice(0, 3) || []

    return (
        <div>
            {/* Hero */}
            <section className="bg-gradient-to-br from-primary-50 via-white to-water-light py-20 md:py-28">
                <div className="container-custom flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
                            <Droplets className="w-4 h-4" />
                            <span>Uzbekiston #1 suv yetkazib berish</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-5 leading-tight whitespace-pre-line">
                            {t('home.hero.title')}
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 max-w-xl leading-relaxed">
                            {t('home.hero.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                            <Link to="/products" className="btn-primary text-base px-6 py-3 rounded-xl gap-2">
                                {t('home.hero.cta')}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link to="/products" className="btn-secondary text-base px-6 py-3 rounded-xl">
                                {t('home.hero.secondary')}
                            </Link>
                        </div>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="relative">
                            <div className="w-64 h-64 md:w-80 md:h-80 bg-primary-100 rounded-full flex items-center justify-center">
                                <div className="text-9xl select-none">💧</div>
                            </div>
                            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-soft px-4 py-3 text-sm font-medium text-gray-700">
                                🚚 2 soat ichida
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-primary-600 rounded-2xl shadow-soft px-4 py-3 text-sm font-medium text-white">
                                ✅ Sertifikatlangan
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured products */}
            {featuredProducts.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="container-custom">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">{t('home.products.title')}</h2>
                            <Link to="/products" className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                                Barchasi <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredProducts.map((p: any) => <ProductCard key={p._id} product={p} />)}
                        </div>
                    </div>
                </section>
            )}

            {/* How it works */}
            <section className="py-16 bg-gray-50">
                <div className="container-custom">
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">{t('home.howworks.title')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {HOW_STEPS.map((step, i) => (
                            <div key={step.key} className="text-center">
                                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 relative">
                                    {step.icon}
                                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                        {i + 1}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                    {t(`home.howworks.${step.key}.title` as any)}
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    {t(`home.howworks.${step.key}.desc` as any)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust blocks */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {TRUST.map((item, i) => (
                            <div key={i} className="text-center p-6 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-soft transition-all">
                                <div className="mb-3 flex justify-center">{item.icon}</div>
                                <p className="text-sm font-medium text-gray-700">{t(item.key)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Payment methods banner */}
            <section className="py-10 bg-primary-600">
                <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-white font-semibold text-xl">To'lov usullari:</p>
                    <div className="flex gap-4 flex-wrap justify-center">
                        {['💵 Naqd pul', '📱 Click', '💳 Payme'].map(m => (
                            <div key={m} className="bg-white/20 text-white font-medium px-6 py-2.5 rounded-xl text-sm backdrop-blur-sm">
                                {m}
                            </div>
                        ))}
                    </div>
                    <Link to="/products" className="bg-white text-primary-600 font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-50 transition-colors text-sm">
                        {t('home.hero.cta')} →
                    </Link>
                </div>
            </section>
        </div>
    )
}

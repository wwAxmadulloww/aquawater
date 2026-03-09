import React from 'react'
import { Link } from 'react-router-dom'
import { Droplets, Phone } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

const regions = ['Toshkent', 'Samarqand', 'Buxoro', 'Andijon', 'Namangan', 'Farg\'ona']

export default function Footer() {
    const { t } = useLanguage()
    return (
        <footer className="bg-gray-900 text-gray-400 pt-12 pb-6">
            <div className="container-custom">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                <Droplets className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-white text-lg">AquaWater</span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Toza ichimlik suvini uyingizga tez va qulay yetkazib beramiz.
                        </p>
                    </div>
                    {/* Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Sahifalar</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/products" className="hover:text-white transition-colors">Mahsulotlar</Link></li>
                            <li><Link to="/orders" className="hover:text-white transition-colors">Buyurtmalar</Link></li>
                            <li><Link to="/profile" className="hover:text-white transition-colors">Profil</Link></li>
                        </ul>
                    </div>
                    {/* Regions */}
                    <div>
                        <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">{t('footer.regions')}</h3>
                        <ul className="space-y-1 text-sm">
                            {regions.map(r => <li key={r}>{r}</li>)}
                        </ul>
                    </div>
                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">{t('footer.support')}</h3>
                        <div className="flex items-center gap-2 text-sm mb-2">
                            <Phone className="w-4 h-4 text-primary-400" />
                            <a href="tel:+998901234567" className="hover:text-white transition-colors">+998 90 123 45 67</a>
                        </div>
                        <p className="text-xs">24/7 qo'llab-quvvatlash</p>
                        <div className="mt-4 flex gap-2">
                            <span className="text-xs bg-green-900/40 text-green-400 px-2 py-1 rounded-lg">Click</span>
                            <span className="text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded-lg">Payme</span>
                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-lg">Naqd</span>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                    <span>© 2026 AquaWater Uzbekistan. {t('footer.rights')}.</span>
                    <span>Made with 💙 in Uzbekistan</span>
                </div>
            </div>
        </footer>
    )
}

import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, CheckCircle, XCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../i18n/LanguageContext'
import { formatPrice } from '../api/client'

interface Product {
    _id: string
    name: string
    price: number
    imageUrl: string
    inStock: boolean
    category: string
    description: string
}

export default function ProductCard({ product }: { product: Product }) {
    const { addItem } = useCart()
    const { t } = useLanguage()

    return (
        <div className="card group hover:shadow-soft transition-all duration-300 flex flex-col overflow-hidden">
            <Link to={`/products/${product._id}`} className="block overflow-hidden">
                <div className="aspect-square overflow-hidden bg-gray-50">
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                </div>
            </Link>
            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <Link to={`/products/${product._id}`} className="font-semibold text-gray-900 text-sm leading-snug hover:text-primary-600 transition-colors flex-1">
                        {product.name}
                    </Link>
                    {product.inStock ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 flex-shrink-0">
                            <CheckCircle className="w-3.5 h-3.5" />
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-xs text-red-500 flex-shrink-0">
                            <XCircle className="w-3.5 h-3.5" />
                        </span>
                    )}
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
                <div className="mt-auto flex items-center justify-between gap-2">
                    <span className="font-bold text-primary-700 text-base">{formatPrice(product.price)}</span>
                    <button
                        onClick={() => addItem({ _id: product._id, name: product.name, price: product.price, imageUrl: product.imageUrl })}
                        disabled={!product.inStock}
                        className="btn-primary text-xs py-2 px-3 gap-1"
                    >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {product.inStock ? t('products.addToCart') : t('products.outOfStock')}
                    </button>
                </div>
            </div>
        </div>
    )
}

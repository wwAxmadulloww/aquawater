import axios from 'axios'
import toast from 'react-hot-toast'

const getBaseURL = () => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (!envUrl) return 'https://aquawater-backend.vercel.app/api';

    // Remove trailing slash if present
    const cleanUrl = envUrl.replace(/\/$/, '');

    // If it already ends with /api, use it as is, otherwise append /api
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

export const api = axios.create({
    baseURL: getBaseURL(),
    headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('aq_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('aq_token')
            window.location.href = '/login'
        } else {
            const msg = err.response?.data?.message || 'Xatolik yuz berdi'
            toast.error(msg)
        }
        return Promise.reject(err)
    }
)

// Product helpers
export const getProducts = (params?: Record<string, string>) =>
    api.get('/products', { params }).then(r => r.data)

export const getProduct = (id: string) =>
    api.get(`/products/${id}`).then(r => r.data)

export const createProduct = (data: unknown) =>
    api.post('/products', data).then(r => r.data)

export const updateProduct = (id: string, data: unknown) =>
    api.put(`/products/${id}`, data).then(r => r.data)

export const deleteProduct = (id: string) =>
    api.delete(`/products/${id}`).then(r => r.data)

export const approveProduct = (id: string, status: 'approved' | 'rejected') =>
    api.patch(`/products/${id}/approve`, { status }).then(r => r.data)

// Order helpers
export const createOrder = (data: unknown) =>
    api.post('/orders', data).then(r => r.data)

export const getOrders = (params?: Record<string, string>) =>
    api.get('/orders', { params }).then(r => r.data)

export const getOrder = (id: string) =>
    api.get(`/orders/${id}`).then(r => r.data)

export const updateOrderStatus = (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }).then(r => r.data)

export const assignOrder = (id: string, data: { courierId?: string, workerId?: string }) =>
    api.patch(`/orders/${id}/assign`, data).then(r => r.data)

export const deleteOrder = (id: string) =>
    api.delete(`/orders/${id}`).then(r => r.data)


// Admin
export const getAdminStats = () =>
    api.get('/admin/stats').then(r => r.data)

export const getAdminUsers = () =>
    api.get('/admin/users').then(r => r.data)

export const updateUserRole = (id: string, role: string, workerType?: string) =>
    api.patch(`/admin/users/${id}/role`, { role, workerType }).then(r => r.data)

export const deleteAdminUser = (id: string) =>
    api.delete(`/admin/users/${id}`).then(r => r.data)

// Format currency
export const formatPrice = (price: number) =>
    new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m'

import axios from 'axios'
import { BooksResponse, BookDetailsResponse, BookStats, BookFilters } from '../types/Book'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const bookApi = {
  // Get books with pagination and filters
  getBooks: async (params: {
    page?: number
    limit?: number
    search?: string
    rating?: number
    minPrice?: number
    maxPrice?: number
    stock?: 'In stock' | 'Out of stock'
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<BooksResponse> => {
    const response = await api.get('/books', { params })
    return response.data
  },

  // Get book details by ID
  getBookById: async (id: string): Promise<BookDetailsResponse> => {
    const response = await api.get(`/books/${id}`)
    return response.data
  },

  // Get book statistics
  getStats: async (): Promise<{ success: boolean; data: BookStats }> => {
    const response = await api.get('/books/stats')
    return response.data
  },

  // Trigger data refresh
  refreshData: async (): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await api.post('/refresh')
    return response.data
  },

  // Get refresh status
  getRefreshStatus: async (): Promise<{ success: boolean; data: any }> => {
    const response = await api.get('/refresh/status')
    return response.data
  },
}

export default api


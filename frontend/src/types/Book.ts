export interface Book {
  _id: string
  title: string
  price: number
  stock: 'In stock' | 'Out of stock'
  rating: number
  detailUrl: string
  thumbnailUrl: string
  category?: string
  description?: string
  scrapedAt: string
  lastUpdated: string
  formattedPrice?: string
}

export interface BookStats {
  totalBooks: number
  stock: {
    inStock: number
    outOfStock: number
    inStockPercentage: number
  }
  price: {
    average: number
    min: number
    max: number
  }
  ratingDistribution: Record<number, number>
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface BookFilters {
  search?: string
  rating?: number
  minPrice?: number
  maxPrice?: number
  stock?: 'In stock' | 'Out of stock'
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export interface BooksResponse {
  success: boolean
  data: Book[]
  pagination: PaginationInfo
  filters: BookFilters
}

export interface BookDetailsResponse {
  success: boolean
  data: Book & {
    relatedBooks: Book[]
  }
}


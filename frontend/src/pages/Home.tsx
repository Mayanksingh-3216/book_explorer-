import React, { useState, useEffect, useCallback } from 'react'
import { Container, Row, Col, Spinner, Alert, Pagination } from 'react-bootstrap'
import { debounce } from 'lodash'
import BookCard from '../components/BookCard'
import SearchBar from '../components/SearchBar'
import FilterSidebar from '../components/FilterSidebar'
import { bookApi } from '../services/api'
import { BookFilters, BooksResponse, BookStats } from '../types/Book'

const Home: React.FC = () => {
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [filters, setFilters] = useState<BookFilters>({
    search: '',
    sortBy: 'scrapedAt',
    sortOrder: 'desc'
  })
  const [stats, setStats] = useState<BookStats | null>(null)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setFilters(prev => ({ ...prev, search: query, currentPage: 1 }))
    }, 500),
    []
  )

  // Fetch books with current filters
  const fetchBooks = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page,
        limit: 20,
        ...filters,
        search: filters.search || undefined,
        rating: filters.rating || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        stock: filters.stock || undefined
      }

      const response: BooksResponse = await bookApi.getBooks(params)
      
      setBooks(response.data)
      setPagination(response.pagination)
      
    } catch (err: any) {
      console.error('Error fetching books:', err)
      setError(err.response?.data?.message || 'Failed to fetch books')
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await bookApi.getStats()
      setStats(response.data)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  // Handle search
  const handleSearch = (query: string) => {
    debouncedSearch(query)
  }

  // Handle filter changes
  const handleFiltersChange = (newFilters: Partial<BookFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      sortBy: 'scrapedAt',
      sortOrder: 'desc'
    })
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchBooks(page)
  }

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchBooks(1)
  }, [filters.search, filters.rating, filters.minPrice, filters.maxPrice, filters.stock, filters.sortBy, filters.sortOrder])

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="home-page">
      {/* Search Section */}
      <div className="search-container text-white">
        <Container>
          <Row className="justify-content-center">
            <Col md={8}>
              <h2 className="text-center mb-4">Discover Your Next Great Read</h2>
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search for books by title..."
                className="mb-3"
              />
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        <Row>
          {/* Filters Sidebar */}
          <Col lg={3} className="mb-4">
            <FilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              stats={stats ? {
                price: stats.price,
                ratingDistribution: stats.ratingDistribution
              } : undefined}
            />
          </Col>

          {/* Books Grid */}
          <Col lg={9}>
            {/* Results Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4>Books</h4>
                {pagination.totalCount > 0 && (
                  <p className="text-muted mb-0">
                    Showing {((pagination.currentPage - 1) * pagination.limit) + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} books
                  </p>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="loading-container">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Alert variant="danger" className="error-container">
                <Alert.Heading>Error!</Alert.Heading>
                <p>{error}</p>
                <Button variant="outline-danger" onClick={() => fetchBooks(pagination.currentPage)}>
                  Try Again
                </Button>
              </Alert>
            )}

            {/* Books Grid */}
            {!loading && !error && (
              <>
                {books.length === 0 ? (
                  <Alert variant="info" className="text-center">
                    <Alert.Heading>No books found</Alert.Heading>
                    <p>Try adjusting your search criteria or filters.</p>
                    <Button variant="outline-primary" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  </Alert>
                ) : (
                  <div className="book-grid">
                    {books.map((book) => (
                      <BookCard key={book._id} book={book} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="pagination-container">
                    <Pagination>
                      <Pagination.First
                        onClick={() => handlePageChange(1)}
                        disabled={!pagination.hasPrevPage}
                      />
                      <Pagination.Prev
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                      />
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, pagination.currentPage - 2) + i
                        if (pageNum > pagination.totalPages) return null
                        
                        return (
                          <Pagination.Item
                            key={pageNum}
                            active={pageNum === pagination.currentPage}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Pagination.Item>
                        )
                      })}
                      
                      <Pagination.Next
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                      />
                      <Pagination.Last
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={!pagination.hasNextPage}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Home


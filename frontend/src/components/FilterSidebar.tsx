import React from 'react'
import { Card, Form, Row, Col, Button } from 'react-bootstrap'
import { BookFilters } from '../types/Book'

interface FilterSidebarProps {
  filters: BookFilters
  onFiltersChange: (filters: Partial<BookFilters>) => void
  onClearFilters: () => void
  stats?: {
    price: { min: number; max: number }
    ratingDistribution: Record<number, number>
  }
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  stats
}) => {
  const handleRatingChange = (rating: number) => {
    onFiltersChange({
      rating: filters.rating === rating ? undefined : rating
    })
  }

  const handleStockChange = (stock: 'In stock' | 'Out of stock') => {
    onFiltersChange({
      stock: filters.stock === stock ? undefined : stock
    })
  }

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value)
    onFiltersChange({
      [field]: numValue
    })
  }

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({
      sortBy,
      sortOrder: filters.sortOrder
    })
  }

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    onFiltersChange({
      sortBy: filters.sortBy,
      sortOrder
    })
  }

  const hasActiveFilters = 
    filters.search || 
    filters.rating || 
    filters.minPrice || 
    filters.maxPrice || 
    filters.stock ||
    filters.sortBy !== 'scrapedAt' ||
    filters.sortOrder !== 'desc'

  return (
    <Card className="filter-sidebar">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Filters</h5>
        {hasActiveFilters && (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={onClearFilters}
          >
            Clear All
          </Button>
        )}
      </Card.Header>
      
      <Card.Body>
        {/* Rating Filter */}
        <div className="mb-4">
          <h6>Rating</h6>
          <div className="d-flex flex-wrap gap-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                variant={filters.rating === rating ? 'primary' : 'outline-secondary'}
                size="sm"
                onClick={() => handleRatingChange(rating)}
                className="d-flex align-items-center"
              >
                <span className="me-1">★</span>
                {rating}+
                {stats?.ratingDistribution[rating] && (
                  <small className="ms-1 text-muted">
                    ({stats.ratingDistribution[rating]})
                  </small>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Stock Filter */}
        <div className="mb-4">
          <h6>Availability</h6>
          <div className="d-flex flex-column gap-2">
            <Form.Check
              type="radio"
              id="stock-all"
              label="All Books"
              name="stock"
              checked={!filters.stock}
              onChange={() => onFiltersChange({ stock: undefined })}
            />
            <Form.Check
              type="radio"
              id="stock-in"
              label="In Stock"
              name="stock"
              checked={filters.stock === 'In stock'}
              onChange={() => handleStockChange('In stock')}
            />
            <Form.Check
              type="radio"
              id="stock-out"
              label="Out of Stock"
              name="stock"
              checked={filters.stock === 'Out of stock'}
              onChange={() => handleStockChange('Out of stock')}
            />
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="mb-4">
          <h6>Price Range</h6>
          <Row className="g-2">
            <Col>
              <Form.Label className="small">Min Price (£)</Form.Label>
              <Form.Control
                type="number"
                placeholder="0"
                value={filters.minPrice || ''}
                onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                min="0"
                step="0.01"
              />
            </Col>
            <Col>
              <Form.Label className="small">Max Price (£)</Form.Label>
              <Form.Control
                type="number"
                placeholder="100"
                value={filters.maxPrice || ''}
                onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                min="0"
                step="0.01"
              />
            </Col>
          </Row>
          {stats && (
            <small className="text-muted">
              Range: £{stats.price.min.toFixed(2)} - £{stats.price.max.toFixed(2)}
            </small>
          )}
        </div>

        {/* Sort Options */}
        <div className="mb-4">
          <h6>Sort By</h6>
          <Form.Select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            size="sm"
          >
            <option value="scrapedAt">Date Added</option>
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
          </Form.Select>
          
          <div className="mt-2">
            <Form.Check
              type="radio"
              id="sort-desc"
              label="Descending"
              name="sortOrder"
              checked={filters.sortOrder === 'desc'}
              onChange={() => handleSortOrderChange('desc')}
            />
            <Form.Check
              type="radio"
              id="sort-asc"
              label="Ascending"
              name="sortOrder"
              checked={filters.sortOrder === 'asc'}
              onChange={() => handleSortOrderChange('asc')}
            />
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

export default FilterSidebar


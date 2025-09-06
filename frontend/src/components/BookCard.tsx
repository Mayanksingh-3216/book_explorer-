import React from 'react'
import { Card, Badge, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { Book } from '../types/Book'

interface BookCardProps {
  book: Book
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const navigate = useNavigate()

  const handleViewDetails = () => {
    navigate(`/book/${book._id}`)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`rating-stars ${index < rating ? 'text-warning' : 'text-muted'}`}
      >
        ★
      </span>
    ))
  }

  return (
    <Card className="book-card h-100 shadow-sm">
      <div className="position-relative">
        <Card.Img
          variant="top"
          src={book.thumbnailUrl}
          alt={book.title}
          className="book-thumbnail"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = 'https://via.placeholder.com/200x300?text=No+Image'
          }}
        />
        <Badge
          bg={book.stock === 'In stock' ? 'success' : 'danger'}
          className="position-absolute top-0 end-0 m-2 stock-badge"
        >
          {book.stock}
        </Badge>
      </div>
      
      <Card.Body className="d-flex flex-column">
        <Card.Title className="book-title">{book.title}</Card.Title>
        
        <div className="mb-2">
          <div className="rating-stars mb-1">
            {renderStars(book.rating)}
            <span className="ms-1 text-muted small">({book.rating}/5)</span>
          </div>
        </div>
        
        <div className="mt-auto">
          <div className="price-tag mb-2">
            £{book.price.toFixed(2)}
          </div>
          
          <Button
            variant="primary"
            size="sm"
            onClick={handleViewDetails}
            className="w-100"
          >
            View Details
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

export default BookCard


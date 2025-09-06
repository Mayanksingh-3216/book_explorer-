import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap'
import { ArrowLeft, BoxArrowUpRight } from 'react-bootstrap-icons'
import BookCard from '../components/BookCard'
import { bookApi } from '../services/api'
import { BookDetailsResponse, Book } from '../types/Book'

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchBookDetails(id)
    }
  }, [id])

  const fetchBookDetails = async (bookId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response: BookDetailsResponse = await bookApi.getBookById(bookId)
      
      setBook(response.data)
      setRelatedBooks(response.data.relatedBooks || [])
      
    } catch (err: any) {
      console.error('Error fetching book details:', err)
      setError(err.response?.data?.message || 'Failed to fetch book details')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`rating-stars ${index < rating ? 'text-warning' : 'text-muted'}`}
        style={{ fontSize: '1.5rem' }}
      >
        ★
      </span>
    ))
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  const handleViewOriginal = () => {
    if (book?.detailUrl) {
      window.open(book.detailUrl, '_blank', 'noopener,noreferrer')
    }
  }

  if (loading) {
    return (
      <Container className="py-5">
        <div className="loading-container">
          <Spinner animation="border" role="status" size="lg">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="error-container">
          <Alert.Heading>Error!</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => id && fetchBookDetails(id)}>
            Try Again
          </Button>
        </Alert>
      </Container>
    )
  }

  if (!book) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <Alert.Heading>Book Not Found</Alert.Heading>
          <p>The book you're looking for doesn't exist.</p>
          <Button variant="outline-primary" onClick={handleBackToHome}>
            Back to Home
          </Button>
        </Alert>
      </Container>
    )
  }

  return (
    <Container className="py-4">
      {/* Back Button */}
      <Button
        variant="outline-secondary"
        onClick={handleBackToHome}
        className="mb-4"
      >
        <ArrowLeft className="me-2" />
        Back to Books
      </Button>

      <Row>
        {/* Book Image and Basic Info */}
        <Col lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Img
              variant="top"
              src={book.thumbnailUrl}
              alt={book.title}
              className="book-thumbnail"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = 'https://via.placeholder.com/400x600?text=No+Image'
              }}
            />
            <Card.Body className="text-center">
              <Badge
                bg={book.stock === 'In stock' ? 'success' : 'danger'}
                className="mb-3"
              >
                {book.stock}
              </Badge>
              
              <div className="price-tag mb-3" style={{ fontSize: '1.5rem' }}>
                £{book.price.toFixed(2)}
              </div>
              
              <Button
                variant="primary"
                onClick={handleViewOriginal}
                className="w-100"
              >
                <BoxArrowUpRight className="me-2" />
                View Original Page
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Book Details */}
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h1 className="mb-0">{book.title}</h1>
            </Card.Header>
            <Card.Body>
              {/* Rating */}
              <div className="mb-4">
                <h5>Rating</h5>
                <div className="d-flex align-items-center">
                  {renderStars(book.rating)}
                  <span className="ms-3 text-muted">
                    {book.rating} out of 5 stars
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                <h5>Price</h5>
                <p className="price-tag mb-0" style={{ fontSize: '1.25rem' }}>
                  £{book.price.toFixed(2)}
                </p>
              </div>

              {/* Availability */}
              <div className="mb-4">
                <h5>Availability</h5>
                <Badge
                  bg={book.stock === 'In stock' ? 'success' : 'danger'}
                  style={{ fontSize: '1rem' }}
                >
                  {book.stock}
                </Badge>
              </div>

              {/* Category */}
              {book.category && (
                <div className="mb-4">
                  <h5>Category</h5>
                  <Badge bg="info">{book.category}</Badge>
                </div>
              )}

              {/* Description */}
              {book.description && (
                <div className="mb-4">
                  <h5>Description</h5>
                  <p className="text-muted">{book.description}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="mb-4">
                <h5>Book Information</h5>
                <div className="row">
                  <div className="col-sm-6">
                    <small className="text-muted">
                      <strong>Added:</strong> {new Date(book.scrapedAt).toLocaleDateString()}
                    </small>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted">
                      <strong>Last Updated:</strong> {new Date(book.lastUpdated).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <Row className="mt-5">
          <Col>
            <h3>Related Books</h3>
            <p className="text-muted mb-4">
              Other books with similar ratings
            </p>
            <div className="book-grid">
              {relatedBooks.map((relatedBook) => (
                <BookCard key={relatedBook._id} book={relatedBook} />
              ))}
            </div>
          </Col>
        </Row>
      )}
    </Container>
  )
}

export default BookDetails


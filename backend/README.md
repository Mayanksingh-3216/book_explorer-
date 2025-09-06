# Book Explorer Backend

Express.js API server for the Book Explorer application.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - Copy `.env.example` to `.env`
   - Update MongoDB connection string with your Atlas credentials
   - Configure other environment variables as needed

3. **MongoDB Atlas Setup:**
   - Create a free MongoDB Atlas account
   - Create a new cluster
   - Create a database named `book_explorer`
   - Create a user with read/write permissions
   - Whitelist your IP address (or use 0.0.0.0/0 for development)
   - Copy the connection string to your `.env` file

4. **Run the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   
   # Test API endpoints
   npm run test-api
   ```

## Database Schema

### Books Collection
- `title` (String, required, text-indexed)
- `price` (Number, required, min: 0)
- `stock` (String, enum: ['In stock', 'Out of stock'], indexed)
- `rating` (Number, required, min: 1, max: 5, indexed)
- `detailUrl` (String, required, unique)
- `thumbnailUrl` (String, required)
- `category` (String, indexed)
- `description` (String)
- `scrapedAt` (Date, indexed)
- `lastUpdated` (Date)

### Indexes
- Text search on title and description
- Compound indexes for efficient filtering
- Single field indexes for sorting and filtering

## API Endpoints

### Books
- `GET /api/books` - List books with pagination, filtering, and search
- `GET /api/books/:id` - Get detailed information for a single book
- `GET /api/books/stats` - Get book statistics and analytics

### Data Management
- `POST /api/refresh` - Trigger fresh data scraping (rate limited)
- `GET /api/refresh/status` - Get current scraping status

### Query Parameters for GET /api/books
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search term for book titles
- `rating` (optional): Filter by rating (1-5)
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `stock` (optional): Filter by stock status ("In stock" or "Out of stock")
- `sortBy` (optional): Sort field ("title", "price", "rating", "scrapedAt")
- `sortOrder` (optional): Sort order ("asc" or "desc")

### Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... } // Only for list endpoints
}
```

### Error Format

All error responses follow this format:
```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": [...] // Only for validation errors
}
```

### Example API Calls
```bash
# Get first page of books
GET /api/books

# Search for programming books
GET /api/books?search=programming

# Get 5-star books under £20
GET /api/books?rating=5&maxPrice=20

# Get in-stock books sorted by price
GET /api/books?stock=In stock&sortBy=price&sortOrder=asc

# Get book statistics
GET /api/books/stats

# Get book details by ID
GET /api/books/507f1f77bcf86cd799439011

# Trigger data refresh
POST /api/refresh

# Check scraping status
GET /api/refresh/status
```

## Environment Variables

See `.env.example` for all required environment variables.

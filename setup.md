# Book Explorer - Complete Setup Guide

This guide will help you set up and run the complete Book Explorer application.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (free tier)
- Git

## Quick Setup

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install scraper dependencies
cd ../scraper
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend Configuration
```bash
cd backend
cp env.example .env
```

Edit `.env` file with your MongoDB Atlas connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/book_explorer?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### Scraper Configuration
```bash
cd scraper
cp env.example .env
```

Use the same MongoDB URI as the backend.

#### Frontend Configuration
```bash
cd frontend
cp env.example .env
```

Default configuration should work for local development:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. MongoDB Atlas Setup

1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Create a database named `book_explorer`
4. Create a user with read/write permissions
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Copy the connection string to your `.env` files

### 4. Run the Application

#### Step 1: Start the Backend Server
```bash
cd backend
npm run dev
```
The backend will start on http://localhost:5000

#### Step 2: Run the Scraper (in a new terminal)
```bash
cd scraper
npm start
```
This will scrape all books from books.toscrape.com and populate your database.

#### Step 3: Start the Frontend (in a new terminal)
```bash
cd frontend
npm run dev
```
The frontend will start on http://localhost:3000

## Application Features

### ✅ Completed Features

1. **Data Scraper**
   - Scrapes all pages from books.toscrape.com
   - Extracts title, price, stock, rating, URLs, and thumbnails
   - Saves data to MongoDB with upsert functionality
   - Rate limiting and error handling

2. **Backend API**
   - Express.js server with MongoDB
   - RESTful endpoints with pagination, filtering, and search
   - Rate limiting and security middleware
   - Comprehensive error handling

3. **Frontend Application**
   - React with TypeScript
   - Bootstrap 5 for responsive design
   - Search functionality with debouncing
   - Advanced filtering (rating, price, stock)
   - Book details page with related books
   - Pagination and sorting

### API Endpoints

- `GET /api/books` - List books with pagination and filters
- `GET /api/books/:id` - Get book details by ID
- `GET /api/books/stats` - Get book statistics
- `POST /api/refresh` - Trigger fresh data scraping
- `GET /api/refresh/status` - Get scraping status

### Query Parameters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search term for book titles
- `rating` - Filter by rating (1-5)
- `minPrice` / `maxPrice` - Price range filter
- `stock` - Filter by stock status
- `sortBy` - Sort field (title, price, rating, scrapedAt)
- `sortOrder` - Sort order (asc, desc)

## Testing the Application

### 1. Test the Scraper
```bash
cd scraper
npm run test-db  # Test database connection
npm run validate # Validate scraped data
```

### 2. Test the Backend API
```bash
cd backend
npm run test-api  # Test all API endpoints
```

### 3. Test the Frontend
- Open http://localhost:3000
- Search for books
- Use filters
- Click on book cards to view details
- Test pagination

## Deployment

### Backend Deployment (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy the backend service

### Frontend Deployment (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your connection string
   - Ensure your IP is whitelisted
   - Verify database and user permissions

2. **CORS Errors**
   - Update FRONTEND_URL in backend .env
   - Check that frontend is running on the correct port

3. **Scraper Issues**
   - Check internet connection
   - Verify the target website is accessible
   - Check MongoDB connection

### Logs and Debugging

- Backend logs: Check terminal where backend is running
- Scraper logs: Check terminal where scraper is running
- Frontend logs: Check browser developer console

## Project Structure

```
book_explorer/
├── backend/          # Express.js API server
│   ├── config/       # Database configuration
│   ├── middleware/   # Error handling, validation
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   └── server.js     # Main server file
├── frontend/         # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service layer
│   │   └── types/       # TypeScript interfaces
│   └── package.json
├── scraper/          # Web scraping script
│   ├── scraper.js   # Main scraper
│   ├── test-db.js   # Database testing
│   └── validate-data.js # Data validation
└── README.md        # Project documentation
```

## Next Steps

The application is now complete and ready to use! You can:

1. Run the scraper to populate your database
2. Start the backend server
3. Launch the frontend application
4. Browse and search books
5. Deploy to production platforms

For any issues or questions, check the individual component README files or the troubleshooting section above.


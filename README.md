# Book Explorer

A full-stack web application that scrapes book data from Books to Scrape and provides a modern, responsive interface for browsing and searching books.

## Project Structure

```
book_explorer/
├── scraper/          # Web scraping script
├── backend/          # Express.js API server
├── frontend/         # React application with Bootstrap
└── README.md         # This file
```

## Features

- **Data Scraping**: Automated scraping from books.toscrape.com
- **RESTful API**: Express.js backend with pagination, filtering, and search
- **Responsive Frontend**: React app with Bootstrap for mobile-first design
- **Real-time Search**: Search books by title with instant results
- **Advanced Filtering**: Filter by rating, price range, and stock availability
- **Book Details**: Detailed view with all book information

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB
- **Frontend**: React, TypeScript, Bootstrap 5, React Bootstrap
- **Scraping**: Axios, Cheerio
- **Deployment**: Render (backend), Netlify/Vercel (frontend)

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (free tier)
- Git

### Installation

1. Clone the repository
2. Set up environment variables
3. Install dependencies for each component
4. Run the scraper to populate the database
5. Start the backend server
6. Start the frontend development server

Detailed setup instructions will be provided in each component's directory.

## API Endpoints

- `GET /api/books` - List books with pagination, filtering, and search
- `GET /api/books/:id` - Get book details by ID
- `POST /api/refresh` - Trigger fresh data scraping

## Contributing

This project is built for educational purposes. Feel free to fork and modify as needed.

## License

MIT License
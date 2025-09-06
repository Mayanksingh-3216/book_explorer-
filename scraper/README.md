# Book Explorer Scraper

Web scraper for collecting book data from Books to Scrape website.

## Features

- **Complete Site Scraping**: Automatically navigates through all pages
- **Data Extraction**: Collects title, price, stock, rating, URLs, and thumbnails
- **Database Integration**: Saves data to MongoDB with upsert functionality
- **Error Handling**: Retry logic and graceful error handling
- **Rate Limiting**: Respectful delays between requests
- **Progress Tracking**: Real-time progress updates

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - Copy `.env.example` to `.env`
   - Update MongoDB connection string with your Atlas credentials

3. **Run the scraper:**
   ```bash
   # Run once
   npm start
   
   # Development mode with auto-restart
   npm run dev
   
   # Test database connection
   npm run test-db
   
   # Validate scraped data
   npm run validate
   ```

## Data Collected

For each book, the scraper collects:
- **Title**: Book title
- **Price**: Price in pounds (£)
- **Stock**: "In stock" or "Out of stock"
- **Rating**: 1-5 star rating
- **Detail URL**: Link to book's detail page
- **Thumbnail URL**: Book cover image
- **Scraped At**: Timestamp of when data was collected

## Database Behavior

- **Upsert**: Books are updated if they already exist (based on detailUrl)
- **New Books**: New books are added to the collection
- **Timestamps**: Tracks when books were first scraped and last updated

## Error Handling

- **Retry Logic**: Failed requests are retried up to 3 times
- **Graceful Degradation**: Continues scraping even if individual books fail
- **Connection Management**: Properly closes database connections

## Rate Limiting

- **1 second delay** between page requests to be respectful to the source
- **User-Agent header** to identify as a legitimate browser
- **Timeout handling** for slow responses

## Usage

The scraper can be run standalone or imported as a module:

```javascript
const BookScraper = require('./scraper');

const scraper = new BookScraper();
await scraper.run();
```

## Testing and Validation

### Database Connection Test
```bash
npm run test-db
```
Tests MongoDB connection, creates sample data, validates indexes, and cleans up.

### Data Validation
```bash
npm run validate
```
Validates all scraped books for:
- Required field completeness
- Data type validation
- Data quality checks
- Generates comprehensive quality report

## Environment Variables

- `MONGODB_URI`: MongoDB Atlas connection string

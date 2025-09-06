const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
require('dotenv').config();

// Import the Book model from backend
const Book = require('../backend/models/Book');

// Configuration
const BASE_URL = 'https://books.toscrape.com';
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second delay to be respectful
const MAX_RETRIES = 3;

class BookScraper {
  constructor() {
    this.scrapedBooks = [];
    this.totalPages = 0;
    this.currentPage = 1;
  }

  // Connect to MongoDB
  async connectDB() {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      process.exit(1);
    }
  }

  // Add delay between requests
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Make HTTP request with retry logic
  async makeRequest(url, retries = MAX_RETRIES) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      if (retries > 0) {
        console.log(`⚠️  Request failed, retrying... (${retries} attempts left)`);
        await this.delay(2000);
        return this.makeRequest(url, retries - 1);
      }
      throw error;
    }
  }

  // Extract book data from a single book element
  extractBookData($, bookElement) {
    try {
      const title = $(bookElement).find('h3 a').attr('title') || 
                   $(bookElement).find('h3 a').text().trim();
      
      const priceText = $(bookElement).find('.price_color').text().trim();
      const price = parseFloat(priceText.replace(/[£$]/g, ''));
      
      const availability = $(bookElement).find('.availability').text().trim();
      const stock = availability.includes('In stock') ? 'In stock' : 'Out of stock';
      
      const ratingElement = $(bookElement).find('.star-rating');
      const ratingClass = ratingElement.attr('class');
      const rating = this.extractRatingFromClass(ratingClass);
      
      const detailUrl = $(bookElement).find('h3 a').attr('href');
      const fullDetailUrl = detailUrl ? `${BASE_URL}/${detailUrl}` : '';
      
      const thumbnailUrl = $(bookElement).find('img').attr('src');
      const fullThumbnailUrl = thumbnailUrl ? `${BASE_URL}/${thumbnailUrl}` : '';

      return {
        title: title || 'Unknown Title',
        price: price || 0,
        stock: stock,
        rating: rating,
        detailUrl: fullDetailUrl,
        thumbnailUrl: fullThumbnailUrl,
        scrapedAt: new Date()
      };
    } catch (error) {
      console.error('❌ Error extracting book data:', error.message);
      return null;
    }
  }

  // Extract rating from CSS class
  extractRatingFromClass(ratingClass) {
    if (!ratingClass) return 1;
    
    const ratingMap = {
      'One': 1,
      'Two': 2,
      'Three': 3,
      'Four': 4,
      'Five': 5
    };
    
    for (const [word, number] of Object.entries(ratingMap)) {
      if (ratingClass.includes(word)) {
        return number;
      }
    }
    return 1;
  }

  // Scrape a single page
  async scrapePage(pageUrl) {
    try {
      console.log(`📖 Scraping page: ${pageUrl}`);
      const html = await this.makeRequest(pageUrl);
      const $ = cheerio.load(html);
      
      const books = [];
      $('.product_pod').each((index, element) => {
        const bookData = this.extractBookData($, element);
        if (bookData) {
          books.push(bookData);
        }
      });

      console.log(`✅ Found ${books.length} books on this page`);
      return books;
    } catch (error) {
      console.error(`❌ Error scraping page ${pageUrl}:`, error.message);
      return [];
    }
  }

  // Get total number of pages
  async getTotalPages() {
    try {
      const html = await this.makeRequest(BASE_URL);
      const $ = cheerio.load(html);
      
      const pagination = $('.pager .current').text();
      const match = pagination.match(/Page \d+ of (\d+)/);
      
      if (match) {
        return parseInt(match[1]);
      }
      
      // Fallback: check if there's a next button
      const hasNext = $('.next').length > 0;
      return hasNext ? 50 : 1; // Default assumption
    } catch (error) {
      console.error('❌ Error getting total pages:', error.message);
      return 1;
    }
  }

  // Scrape all pages
  async scrapeAllPages() {
    try {
      console.log('🚀 Starting book scraping...');
      
      // Get total pages
      this.totalPages = await this.getTotalPages();
      console.log(`📚 Total pages to scrape: ${this.totalPages}`);
      
      // Scrape first page
      const firstPageBooks = await this.scrapePage(BASE_URL);
      this.scrapedBooks.push(...firstPageBooks);
      
      // Scrape remaining pages
      for (let page = 2; page <= this.totalPages; page++) {
        const pageUrl = `${BASE_URL}/catalogue/page-${page}.html`;
        const pageBooks = await this.scrapePage(pageUrl);
        this.scrapedBooks.push(...pageBooks);
        
        // Add delay between requests
        await this.delay(DELAY_BETWEEN_REQUESTS);
        
        // Progress update
        console.log(`📊 Progress: ${page}/${this.totalPages} pages completed`);
      }
      
      console.log(`🎉 Scraping completed! Total books found: ${this.scrapedBooks.length}`);
      return this.scrapedBooks;
    } catch (error) {
      console.error('❌ Error during scraping:', error.message);
      throw error;
    }
  }

  // Save books to database
  async saveBooksToDatabase(books) {
    try {
      console.log('💾 Saving books to database...');
      
      let savedCount = 0;
      let updatedCount = 0;
      
      for (const bookData of books) {
        try {
          const result = await Book.findOneAndUpdate(
            { detailUrl: bookData.detailUrl },
            { 
              ...bookData,
              lastUpdated: new Date()
            },
            { 
              upsert: true, 
              new: true,
              setDefaultsOnInsert: true
            }
          );
          
          if (result.isNew) {
            savedCount++;
          } else {
            updatedCount++;
          }
        } catch (error) {
          console.error(`❌ Error saving book "${bookData.title}":`, error.message);
        }
      }
      
      console.log(`✅ Database update completed:`);
      console.log(`   📝 New books: ${savedCount}`);
      console.log(`   🔄 Updated books: ${updatedCount}`);
      console.log(`   📚 Total processed: ${savedCount + updatedCount}`);
      
    } catch (error) {
      console.error('❌ Error saving to database:', error.message);
      throw error;
    }
  }

  // Main scraping function
  async run() {
    try {
      console.log('🎯 Book Explorer Scraper Starting...');
      
      // Connect to database
      await this.connectDB();
      
      // Scrape all books
      const books = await this.scrapeAllPages();
      
      if (books.length === 0) {
        console.log('⚠️  No books found to save');
        return;
      }
      
      // Save to database
      await this.saveBooksToDatabase(books);
      
      console.log('🎉 Scraping process completed successfully!');
      
    } catch (error) {
      console.error('💥 Scraping failed:', error.message);
      process.exit(1);
    } finally {
      // Close database connection
      await mongoose.connection.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the scraper if this file is executed directly
if (require.main === module) {
  const scraper = new BookScraper();
  scraper.run().catch(console.error);
}

module.exports = BookScraper;


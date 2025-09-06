const mongoose = require('mongoose');
require('dotenv').config();

// Import the Book model
const Book = require('../backend/models/Book');

class DataValidator {
  constructor() {
    this.validationErrors = [];
    this.validationWarnings = [];
  }

  async connectDB() {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Connected to MongoDB for validation');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      process.exit(1);
    }
  }

  validateBook(book) {
    const errors = [];
    const warnings = [];

    // Required field validation
    if (!book.title || book.title.trim() === '') {
      errors.push('Title is required');
    }
    
    if (book.price === undefined || book.price === null || book.price < 0) {
      errors.push('Valid price is required');
    }
    
    if (!book.stock || !['In stock', 'Out of stock'].includes(book.stock)) {
      errors.push('Valid stock status is required');
    }
    
    if (!book.rating || book.rating < 1 || book.rating > 5) {
      errors.push('Valid rating (1-5) is required');
    }
    
    if (!book.detailUrl || !book.detailUrl.startsWith('http')) {
      errors.push('Valid detail URL is required');
    }
    
    if (!book.thumbnailUrl || !book.thumbnailUrl.startsWith('http')) {
      errors.push('Valid thumbnail URL is required');
    }

    // Data quality warnings
    if (book.title && book.title.length < 3) {
      warnings.push('Title seems too short');
    }
    
    if (book.price && book.price > 100) {
      warnings.push('Price seems unusually high');
    }
    
    if (book.title && book.title.includes('Unknown')) {
      warnings.push('Title contains placeholder text');
    }

    return { errors, warnings };
  }

  async validateAllBooks() {
    try {
      console.log('🔍 Starting data validation...');
      
      const books = await Book.find({});
      console.log(`📚 Found ${books.length} books to validate`);
      
      let validBooks = 0;
      let booksWithErrors = 0;
      let booksWithWarnings = 0;
      
      for (const book of books) {
        const { errors, warnings } = this.validateBook(book);
        
        if (errors.length === 0) {
          validBooks++;
        } else {
          booksWithErrors++;
          this.validationErrors.push({
            bookId: book._id,
            title: book.title,
            errors
          });
        }
        
        if (warnings.length > 0) {
          booksWithWarnings++;
          this.validationWarnings.push({
            bookId: book._id,
            title: book.title,
            warnings
          });
        }
      }
      
      // Print summary
      console.log('\n📊 Validation Summary:');
      console.log(`✅ Valid books: ${validBooks}`);
      console.log(`❌ Books with errors: ${booksWithErrors}`);
      console.log(`⚠️  Books with warnings: ${booksWithWarnings}`);
      
      // Print detailed errors
      if (this.validationErrors.length > 0) {
        console.log('\n❌ Validation Errors:');
        this.validationErrors.slice(0, 10).forEach((error, index) => {
          console.log(`${index + 1}. "${error.title}": ${error.errors.join(', ')}`);
        });
        if (this.validationErrors.length > 10) {
          console.log(`... and ${this.validationErrors.length - 10} more errors`);
        }
      }
      
      // Print detailed warnings
      if (this.validationWarnings.length > 0) {
        console.log('\n⚠️  Validation Warnings:');
        this.validationWarnings.slice(0, 10).forEach((warning, index) => {
          console.log(`${index + 1}. "${warning.title}": ${warning.warnings.join(', ')}`);
        });
        if (this.validationWarnings.length > 10) {
          console.log(`... and ${this.validationWarnings.length - 10} more warnings`);
        }
      }
      
      // Data quality metrics
      await this.generateDataQualityReport(books);
      
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      throw error;
    }
  }

  async generateDataQualityReport(books) {
    console.log('\n📈 Data Quality Report:');
    
    // Price analysis
    const prices = books.map(b => b.price).filter(p => p !== null && p !== undefined);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    console.log(`💰 Price range: £${minPrice.toFixed(2)} - £${maxPrice.toFixed(2)} (avg: £${avgPrice.toFixed(2)})`);
    
    // Stock analysis
    const inStockCount = books.filter(b => b.stock === 'In stock').length;
    const outOfStockCount = books.filter(b => b.stock === 'Out of stock').length;
    console.log(`📦 Stock: ${inStockCount} in stock, ${outOfStockCount} out of stock`);
    
    // Rating analysis
    const ratingCounts = {};
    books.forEach(b => {
      ratingCounts[b.rating] = (ratingCounts[b.rating] || 0) + 1;
    });
    console.log('⭐ Rating distribution:', ratingCounts);
    
    // URL analysis
    const validDetailUrls = books.filter(b => b.detailUrl && b.detailUrl.startsWith('http')).length;
    const validThumbnailUrls = books.filter(b => b.thumbnailUrl && b.thumbnailUrl.startsWith('http')).length;
    console.log(`🔗 Valid detail URLs: ${validDetailUrls}/${books.length}`);
    console.log(`🖼️  Valid thumbnail URLs: ${validThumbnailUrls}/${books.length}`);
  }

  async run() {
    try {
      await this.connectDB();
      await this.validateAllBooks();
      console.log('\n🎉 Data validation completed!');
    } catch (error) {
      console.error('💥 Validation process failed:', error.message);
      process.exit(1);
    } finally {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the validator if this file is executed directly
if (require.main === module) {
  const validator = new DataValidator();
  validator.run().catch(console.error);
}

module.exports = DataValidator;


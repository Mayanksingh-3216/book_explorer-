const mongoose = require('mongoose');
require('dotenv').config();

// Import the Book model
const Book = require('../backend/models/Book');

async function testDatabaseConnection() {
  try {
    console.log('🔌 Testing database connection...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Database connected successfully');
    
    // Test creating a sample book
    console.log('📝 Testing book creation...');
    
    const sampleBook = {
      title: 'Test Book',
      price: 19.99,
      stock: 'In stock',
      rating: 4,
      detailUrl: 'https://books.toscrape.com/test-book.html',
      thumbnailUrl: 'https://books.toscrape.com/media/test.jpg',
      scrapedAt: new Date()
    };
    
    // Test upsert functionality
    const result = await Book.findOneAndUpdate(
      { detailUrl: sampleBook.detailUrl },
      sampleBook,
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );
    
    console.log('✅ Sample book created/updated:', result.title);
    
    // Test text search
    console.log('🔍 Testing text search...');
    const searchResults = await Book.find({ $text: { $search: 'test' } });
    console.log(`✅ Text search found ${searchResults.length} results`);
    
    // Test filtering
    console.log('🔍 Testing filtering...');
    const inStockBooks = await Book.find({ stock: 'In stock' });
    const highRatedBooks = await Book.find({ rating: { $gte: 4 } });
    console.log(`✅ Found ${inStockBooks.length} in-stock books`);
    console.log(`✅ Found ${highRatedBooks.length} high-rated books`);
    
    // Test indexes
    console.log('📊 Testing indexes...');
    const indexes = await Book.collection.getIndexes();
    console.log('✅ Available indexes:', Object.keys(indexes));
    
    // Clean up test data
    await Book.deleteOne({ detailUrl: sampleBook.detailUrl });
    console.log('🧹 Test data cleaned up');
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
if (require.main === module) {
  testDatabaseConnection().catch(console.error);
}

module.exports = testDatabaseConnection;


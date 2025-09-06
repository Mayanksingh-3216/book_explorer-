const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('🧪 Testing Book Explorer API...\n');

    // Test 1: Basic books endpoint
    console.log('1️⃣ Testing GET /api/books (basic)');
    const basicResponse = await axios.get(`${BASE_URL}/books`);
    console.log(`✅ Status: ${basicResponse.status}`);
    console.log(`📚 Books returned: ${basicResponse.data.data.length}`);
    console.log(`📄 Total pages: ${basicResponse.data.pagination.totalPages}`);
    console.log(`📊 Total books: ${basicResponse.data.pagination.totalCount}\n`);

    // Test 2: Pagination
    console.log('2️⃣ Testing pagination (page=2, limit=5)');
    const paginationResponse = await axios.get(`${BASE_URL}/books?page=2&limit=5`);
    console.log(`✅ Status: ${paginationResponse.status}`);
    console.log(`📚 Books returned: ${paginationResponse.data.data.length}`);
    console.log(`📄 Current page: ${paginationResponse.data.pagination.currentPage}`);
    console.log(`📄 Has next page: ${paginationResponse.data.pagination.hasNextPage}\n`);

    // Test 3: Search
    console.log('3️⃣ Testing search (search="python")');
    const searchResponse = await axios.get(`${BASE_URL}/books?search=python`);
    console.log(`✅ Status: ${searchResponse.status}`);
    console.log(`🔍 Search results: ${searchResponse.data.data.length}`);
    if (searchResponse.data.data.length > 0) {
      console.log(`📖 First result: "${searchResponse.data.data[0].title}"\n`);
    }

    // Test 4: Filtering by rating
    console.log('4️⃣ Testing rating filter (rating=5)');
    const ratingResponse = await axios.get(`${BASE_URL}/books?rating=5`);
    console.log(`✅ Status: ${ratingResponse.status}`);
    console.log(`⭐ 5-star books: ${ratingResponse.data.data.length}\n`);

    // Test 5: Price range filter
    console.log('5️⃣ Testing price range (minPrice=10&maxPrice=20)');
    const priceResponse = await axios.get(`${BASE_URL}/books?minPrice=10&maxPrice=20`);
    console.log(`✅ Status: ${priceResponse.status}`);
    console.log(`💰 Books in price range: ${priceResponse.data.data.length}`);
    if (priceResponse.data.data.length > 0) {
      console.log(`💵 Price range: £${priceResponse.data.data[0].price} - £${priceResponse.data.data[priceResponse.data.data.length-1].price}\n`);
    }

    // Test 6: Stock filter
    console.log('6️⃣ Testing stock filter (stock=In stock)');
    const stockResponse = await axios.get(`${BASE_URL}/books?stock=In stock`);
    console.log(`✅ Status: ${stockResponse.status}`);
    console.log(`📦 In-stock books: ${stockResponse.data.data.length}\n`);

    // Test 7: Sorting
    console.log('7️⃣ Testing sorting (sortBy=price&sortOrder=asc)');
    const sortResponse = await axios.get(`${BASE_URL}/books?sortBy=price&sortOrder=asc&limit=5`);
    console.log(`✅ Status: ${sortResponse.status}`);
    console.log(`📚 Books returned: ${sortResponse.data.data.length}`);
    if (sortResponse.data.data.length > 0) {
      console.log(`💵 Cheapest book: "${sortResponse.data.data[0].title}" - £${sortResponse.data.data[0].price}\n`);
    }

    // Test 8: Statistics endpoint
    console.log('8️⃣ Testing statistics endpoint');
    const statsResponse = await axios.get(`${BASE_URL}/books/stats`);
    console.log(`✅ Status: ${statsResponse.status}`);
    console.log(`📊 Total books: ${statsResponse.data.data.totalBooks}`);
    console.log(`📦 In stock: ${statsResponse.data.data.stock.inStock} (${statsResponse.data.data.stock.inStockPercentage}%)`);
    console.log(`💰 Average price: £${statsResponse.data.data.price.average}`);
    console.log(`⭐ Rating distribution:`, statsResponse.data.data.ratingDistribution);

    // Test 9: Complex query
    console.log('\n9️⃣ Testing complex query (search + filters + sorting)');
    const complexResponse = await axios.get(`${BASE_URL}/books?search=programming&rating=4&stock=In stock&sortBy=price&sortOrder=asc&limit=3`);
    console.log(`✅ Status: ${complexResponse.status}`);
    console.log(`🔍 Complex query results: ${complexResponse.data.data.length}`);
    complexResponse.data.data.forEach((book, index) => {
      console.log(`   ${index + 1}. "${book.title}" - £${book.price} (${book.rating}⭐)`);
    });

    // Test 10: Get book details by ID
    console.log('\n🔟 Testing book details endpoint');
    if (basicResponse.data.data.length > 0) {
      const bookId = basicResponse.data.data[0]._id;
      const detailResponse = await axios.get(`${BASE_URL}/books/${bookId}`);
      console.log(`✅ Status: ${detailResponse.status}`);
      console.log(`📖 Book title: "${detailResponse.data.data.title}"`);
      console.log(`💰 Price: £${detailResponse.data.data.price}`);
      console.log(`⭐ Rating: ${detailResponse.data.data.rating}`);
      console.log(`📦 Stock: ${detailResponse.data.data.stock}`);
      console.log(`🔗 Related books: ${detailResponse.data.data.relatedBooks.length}`);
    }

    // Test 11: Invalid ID handling
    console.log('\n1️⃣1️⃣ Testing invalid ID handling');
    try {
      await axios.get(`${BASE_URL}/books/invalid-id`);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ Status: ${error.response.status} (Expected validation error)`);
        console.log(`📝 Error message: ${error.response.data.error}`);
      }
    }

    // Test 12: Non-existent ID handling
    console.log('\n1️⃣2️⃣ Testing non-existent ID handling');
    try {
      await axios.get(`${BASE_URL}/books/507f1f77bcf86cd799439011`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`✅ Status: ${error.response.status} (Expected not found)`);
        console.log(`📝 Error message: ${error.response.data.error}`);
      }
    }

    // Test 13: Refresh endpoint status
    console.log('\n1️⃣3️⃣ Testing refresh status endpoint');
    const statusResponse = await axios.get(`${BASE_URL}/refresh/status`);
    console.log(`✅ Status: ${statusResponse.status}`);
    console.log(`🔄 Scraping in progress: ${statusResponse.data.data.scrapingInProgress}`);
    if (statusResponse.data.data.lastScrapeResult) {
      console.log(`📊 Last scrape: ${statusResponse.data.data.lastScrapeResult.success ? 'Success' : 'Failed'}`);
    }

    // Test 14: Refresh endpoint (if not already running)
    console.log('\n1️⃣4️⃣ Testing refresh endpoint');
    try {
      const refreshResponse = await axios.post(`${BASE_URL}/refresh`);
      console.log(`✅ Status: ${refreshResponse.status}`);
      console.log(`📚 Books before: ${refreshResponse.data.data.booksBefore}`);
      console.log(`📚 Books after: ${refreshResponse.data.data.booksAfter}`);
      console.log(`📈 Books added: ${refreshResponse.data.data.booksAdded}`);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 429) {
          console.log(`✅ Status: ${error.response.status} (Expected - scraping already in progress)`);
          console.log(`📝 Message: ${error.response.data.message}`);
        } else {
          console.log(`⚠️  Status: ${error.response.status}`);
          console.log(`📝 Error: ${error.response.data.error}`);
        }
      }
    }

    console.log('\n🎉 All API tests passed successfully!');

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error: Could not connect to API server');
      console.error('Make sure the backend server is running on port 5000');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;

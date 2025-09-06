const express = require('express');
const { body, query, param } = require('express-validator');
const Book = require('../models/Book');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// GET /api/books - List books with pagination, filtering, and search
router.get('/', [
  // Query validation
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('Search term must be 1-100 characters'),
  query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  query('stock').optional().isIn(['In stock', 'Out of stock']).withMessage('Stock must be "In stock" or "Out of stock"'),
  query('sortBy').optional().isIn(['title', 'price', 'rating', 'scrapedAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be "asc" or "desc"'),
  
  handleValidationErrors
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      rating,
      minPrice,
      maxPrice,
      stock,
      sortBy = 'scrapedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query object
    const query = {};

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Rating filter
    if (rating) {
      query.rating = parseInt(rating);
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (stock) {
      query.stock = stock;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const [books, totalCount] = await Promise.all([
      Book.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(), // Use lean() for better performance
      Book.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    // Response with pagination metadata
    res.json({
      success: true,
      data: books,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
        hasNextPage,
        hasPrevPage
      },
      filters: {
        search: search || null,
        rating: rating || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        stock: stock || null,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch books'
    });
  }
});

// GET /api/books/stats - Get book statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalBooks,
      inStockBooks,
      outOfStockBooks,
      avgPrice,
      priceRange,
      ratingDistribution
    ] = await Promise.all([
      Book.countDocuments(),
      Book.countDocuments({ stock: 'In stock' }),
      Book.countDocuments({ stock: 'Out of stock' }),
      Book.aggregate([
        { $group: { _id: null, avgPrice: { $avg: '$price' } } }
      ]),
      Book.aggregate([
        { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } }
      ]),
      Book.aggregate([
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalBooks,
        stock: {
          inStock: inStockBooks,
          outOfStock: outOfStockBooks,
          inStockPercentage: totalBooks > 0 ? Math.round((inStockBooks / totalBooks) * 100) : 0
        },
        price: {
          average: avgPrice[0]?.avgPrice ? Math.round(avgPrice[0].avgPrice * 100) / 100 : 0,
          min: priceRange[0]?.minPrice || 0,
          max: priceRange[0]?.maxPrice || 0
        },
        ratingDistribution: ratingDistribution.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch statistics'
    });
  }
});

// GET /api/books/:id - Get book details by ID
router.get('/:id', [
  // ID validation
  param('id').isMongoId().withMessage('Invalid book ID format'),
  
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id).lean();

    if (!book) {
      return res.status(404).json({
        error: 'Book Not Found',
        message: 'No book found with the provided ID'
      });
    }

    // Get related books (same rating, different book)
    const relatedBooks = await Book.find({
      _id: { $ne: id },
      rating: book.rating
    })
    .limit(4)
    .select('title price thumbnailUrl rating stock')
    .lean();

    res.json({
      success: true,
      data: {
        ...book,
        relatedBooks
      }
    });

  } catch (error) {
    console.error('Error fetching book details:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch book details'
    });
  }
});

module.exports = router;

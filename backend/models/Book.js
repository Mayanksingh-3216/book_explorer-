const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: 'text' // Text index for search functionality
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: String,
    required: true,
    enum: ['In stock', 'Out of stock'],
    index: true // Index for filtering by stock status
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true // Index for filtering by rating
  },
  detailUrl: {
    type: String,
    required: true,
    unique: true // Prevent duplicate books
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  // Additional fields for enhanced functionality
  category: {
    type: String,
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  // Metadata
  scrapedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Compound indexes for efficient querying
bookSchema.index({ rating: 1, stock: 1 }); // For filtering by rating and stock
bookSchema.index({ price: 1, stock: 1 }); // For price range filtering with stock
bookSchema.index({ scrapedAt: -1 }); // For sorting by newest first

// Text search index (already defined above, but ensuring it's comprehensive)
bookSchema.index({ 
  title: 'text',
  description: 'text'
});

// Virtual for formatted price
bookSchema.virtual('formattedPrice').get(function() {
  return `£${this.price.toFixed(2)}`;
});

// Ensure virtual fields are serialized
bookSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Book', bookSchema);


const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const Book = require('../models/Book');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Track scraping status
let scrapingInProgress = false;
let lastScrapeResult = null;

// POST /api/refresh - Trigger fresh data scraping
router.post('/', async (req, res) => {
  try {
    // Check if scraping is already in progress
    if (scrapingInProgress) {
      return res.status(429).json({
        error: 'Scraping In Progress',
        message: 'A scraping operation is already running. Please wait for it to complete.'
      });
    }

    // Set scraping status
    scrapingInProgress = true;
    lastScrapeResult = null;

    console.log('🔄 Starting fresh data scraping...');

    // Get book count before scraping
    const booksBefore = await Book.countDocuments();

    // Run the scraper as a child process
    const scraperPath = path.join(__dirname, '../../scraper/scraper.js');
    const scraperProcess = spawn('node', [scraperPath], {
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let scraperOutput = '';
    let scraperError = '';

    // Collect output from scraper
    scraperProcess.stdout.on('data', (data) => {
      scraperOutput += data.toString();
      console.log(`Scraper: ${data.toString().trim()}`);
    });

    scraperProcess.stderr.on('data', (data) => {
      scraperError += data.toString();
      console.error(`Scraper Error: ${data.toString().trim()}`);
    });

    // Handle scraper completion
    scraperProcess.on('close', async (code) => {
      scrapingInProgress = false;

      try {
        // Get book count after scraping
        const booksAfter = await Book.countDocuments();
        const booksAdded = booksAfter - booksBefore;

        if (code === 0) {
          // Scraping successful
          lastScrapeResult = {
            success: true,
            booksBefore,
            booksAfter,
            booksAdded,
            timestamp: new Date(),
            output: scraperOutput
          };

          res.json({
            success: true,
            message: 'Data refresh completed successfully',
            data: {
              booksBefore,
              booksAfter,
              booksAdded,
              timestamp: new Date(),
              duration: 'Completed'
            }
          });
        } else {
          // Scraping failed
          lastScrapeResult = {
            success: false,
            error: scraperError,
            timestamp: new Date()
          };

          res.status(500).json({
            error: 'Scraping Failed',
            message: 'The scraping operation encountered an error',
            details: scraperError
          });
        }
      } catch (error) {
        scrapingInProgress = false;
        console.error('Error processing scrape results:', error);
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to process scraping results'
        });
      }
    });

    // Handle scraper errors
    scraperProcess.on('error', (error) => {
      scrapingInProgress = false;
      console.error('Scraper process error:', error);
      res.status(500).json({
        error: 'Scraper Process Error',
        message: 'Failed to start scraping process',
        details: error.message
      });
    });

    // Set timeout for scraper (10 minutes)
    setTimeout(() => {
      if (scrapingInProgress) {
        scraperProcess.kill('SIGTERM');
        scrapingInProgress = false;
        res.status(408).json({
          error: 'Scraping Timeout',
          message: 'Scraping operation timed out after 10 minutes'
        });
      }
    }, 10 * 60 * 1000);

  } catch (error) {
    scrapingInProgress = false;
    console.error('Error starting refresh:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to start refresh operation'
    });
  }
});

// GET /api/refresh/status - Get scraping status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      scrapingInProgress,
      lastScrapeResult: lastScrapeResult ? {
        success: lastScrapeResult.success,
        timestamp: lastScrapeResult.timestamp,
        booksBefore: lastScrapeResult.booksBefore || null,
        booksAfter: lastScrapeResult.booksAfter || null,
        booksAdded: lastScrapeResult.booksAdded || null
      } : null
    }
  });
});

module.exports = router;




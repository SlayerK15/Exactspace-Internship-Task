#!/bin/bash
set -e

# Run the scraper first
echo "Starting web scraper for URL: $SCRAPE_URL"
echo "Using Node.js $(node --version) and NPM $(npm --version)"
node /app/scrape.js

# Then start the Flask server
echo "Starting Flask server..."
exec flask run --host=0.0.0.0
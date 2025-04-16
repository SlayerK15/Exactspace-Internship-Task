#!/bin/sh
set -e

# Run the scraper first with the default URL (if provided)
if [ ! -z "$SCRAPE_URL" ]; then
  echo "Starting web scraper for URL: $SCRAPE_URL"
  echo "Using Node.js $(node --version) and NPM $(npm --version)"
  node /app/scrape.js
else
  echo "No default SCRAPE_URL provided. Waiting for user input through web interface."
  # Create an empty data file so the Flask app doesn't error on first load
  mkdir -p /app/output
  echo '{"message": "No data scraped yet. Use the form above to scrape a website.", "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}' > /app/output/scraped_data.json
fi

# Then start the Flask server
echo "Starting Flask server..."
exec flask run --host=0.0.0.0
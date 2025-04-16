const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Get the URL to scrape from environment variable or use a default
const urlToScrape = process.env.SCRAPE_URL || 'https://example.com';
console.log(`Starting scraper with URL: ${urlToScrape}`);

console.log(`Starting to scrape: ${urlToScrape}`);

(async () => {
  // Launch the browser with necessary flags for running in Docker
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ],
    headless: true
  });

  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Navigate to the URL
    await page.goto(urlToScrape, {
      waitUntil: 'networkidle2',
      timeout: 60000 // 60 seconds timeout
    });

    console.log('Page loaded successfully');

    // Extract data from the page
    const scrapedData = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        heading: document.querySelector('h1') ? document.querySelector('h1').innerText : 'No H1 found',
        metaDescription: document.querySelector('meta[name="description"]') 
          ? document.querySelector('meta[name="description"]').getAttribute('content') 
          : 'No meta description found',
        links: Array.from(document.querySelectorAll('a')).slice(0, 10).map(a => ({
          text: a.innerText.trim(),
          href: a.href
        })),
        timestamp: new Date().toISOString()
      };
    });

    console.log('Data extracted successfully');

    // Ensure the output directory exists
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save the scraped data to a JSON file
    const outputPath = path.join(outputDir, 'scraped_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(scrapedData, null, 2));

    console.log(`Scraped data has been saved to ${outputPath}`);
  } catch (error) {
    console.error('Error during scraping:', error);
    // Create a minimal data file even in case of error
    const errorData = {
      error: true,
      message: error.message,
      url: urlToScrape,
      timestamp: new Date().toISOString()
    };
    
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, 'scraped_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(errorData, null, 2));
    
    console.log(`Error information has been saved to ${outputPath}`);
  } finally {
    // Close the browser
    await browser.close();
  }
})();
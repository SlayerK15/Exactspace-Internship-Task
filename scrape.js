const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Get the URL to scrape from environment variable or use a default
const urlToScrape = process.env.SCRAPE_URL || 'https://example.com';
console.log(`Starting scraper with URL: ${urlToScrape}`);

(async () => {
  let browser = null;
  
  try {
    // Launch the browser with necessary flags for running in Docker
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--ignore-certificate-errors',
        '--mute-audio'
      ],
      ignoreHTTPSErrors: true,
      headless: 'new',
      timeout: 90000  // 90 seconds
    });
    
    console.log('Browser launched successfully');

    // Create a new page
    const page = await browser.newPage();
    console.log('New page created');
    
    // Add a more generous timeout
    page.setDefaultNavigationTimeout(90000); // 90 seconds timeout
    
    // Skip images and styles for faster loading
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    console.log(`Navigating to ${urlToScrape}...`);
    // Navigate to the URL with retry logic
    let retries = 3;
    let loaded = false;
    
    while (retries > 0 && !loaded) {
      try {
        await page.goto(urlToScrape, {
          waitUntil: 'domcontentloaded',
          timeout: 60000 // 60 seconds timeout
        });
        loaded = true;
        console.log('Page loaded successfully');
      } catch (err) {
        console.log(`Navigation failed (${retries} retries left): ${err.message}`);
        retries--;
        if (retries === 0) throw err;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
      }
    }
    
    // Add a small delay to ensure page is fully rendered and accessible
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('Waiting for page content to settle...');

    // Extract data from the page
    console.log('Extracting data from page...');
    const scrapedData = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title || 'No title found',
        heading: document.querySelector('h1') ? document.querySelector('h1').innerText : 'No H1 found',
        metaDescription: document.querySelector('meta[name="description"]') 
          ? document.querySelector('meta[name="description"]').getAttribute('content') 
          : 'No meta description found',
        links: Array.from(document.querySelectorAll('a')).slice(0, 10).map(a => ({
          text: a.innerText.trim() || '[No text]',
          href: a.href || '#'
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
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
      console.log('Browser closed');
    }
  }
})();
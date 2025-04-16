Web Scraper with Node.js and Python

This project combines Node.js with Puppeteer for web scraping and Python with Flask for hosting the scraped content in a Docker container. It uses a multi-stage build process to keep the final image lean while providing powerful web scraping capabilities.
Architecture
This solution consists of two main stages:
1. **Scraper Stage (Node.js):**
   * Uses Node.js with Puppeteer and Chromium
   * Scrapes data from a user-specified URL
   * Saves the scraped data as JSON
2. **Hosting Stage (Python):**
   * Uses Python with Flask to serve the scraped content
   * Provides an HTTP endpoint to access the data
   * Lightweight final image
Project Structure
* `Dockerfile`: Multi-stage build file
* `scrape.js`: Node.js script for web scraping
* `server.py`: Python Flask application to serve the scraped data
* `package.json`: Node.js dependencies
* `requirements.txt`: Python dependencies
Building the Docker Image
To build the Docker image, run the following command from the directory containing the Dockerfile:

```bash
docker build -t web-scraper .

```

Running the Container
When you run the container, it will dynamically scrape the URL you specify and then serve the content. Use the `SCRAPE_URL` environment variable to specify which site to scrape:

```bash
docker run -p 5000:5000 -e SCRAPE_URL=https://news.ycombinator.com web-scraper

```

This will:
1. Start the container
2. Execute the scraper on the specified URL (you'll see scraping logs in the console)
3. Start the Flask server to host the freshly scraped content
If you don't specify a SCRAPE_URL, it will default to scraping example.com.
Accessing the Scraped Data
Once the container is running, you can access the scraped data by visiting:

```
http://localhost:5000

```

This will return the scraped data in JSON format.
You can also check the health of the service at:

```
http://localhost:5000/health

```

Customization
Modifying the Scraper
To change what data is scraped, modify the `scrape.js` file, specifically the `page.evaluate()` function. This function determines what elements are extracted from the webpage.
Changing the Port
If you want to use a different port, modify the `EXPOSE` command in the Dockerfile and update the port mapping when running the container:

```bash
docker run -p 8080:5000 -e SCRAPE_URL=https://example.com web-scraper

```

Or change both the internal and external ports:

```bash
# In Dockerfile, change: EXPOSE 8080
# In server.py, change: app.run(host='0.0.0.0', port=8080)

docker run -p 8080:8080 -e SCRAPE_URL=https://example.com web-scraper

```

Troubleshooting
Common Issues
1. **Connection Timeouts**:
   * Some websites may block scraping attempts
   * Try increasing the timeout in `scrape.js` or using a different URL
2. **Missing Data**:
   * If certain elements aren't found, check the selectors in `scrape.js`
   * Different websites have different HTML structures
3. **Container Crashes**:
   * Check Docker logs: `docker logs [container_id]`
   * Ensure the URL is valid and accessible
Advanced Usage
Running the Scraper Periodically
To scrape a website periodically, you could set up a cron job inside the container or use Docker's restart policy with a custom entrypoint script.
Scraping Multiple URLs
If you need to scrape multiple URLs, you could modify the scripts to accept a list of URLs or create multiple containers with different SCRAPE_URL values.
Persistence
If you need to persist the scraped data between container restarts, consider mounting a volume:

```bash
docker run -p 5000:5000 -e SCRAPE_URL=https://example.com -v /path/on/host:/app/data web-scraper

```

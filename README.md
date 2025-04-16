# Web Scraper with Node.js and Python

This project demonstrates a multi-stage Docker build combining Node.js with Puppeteer for web scraping and Python with Flask for hosting the scraped content. It uses Puppeteer's browser automation capabilities to extract data from any website and serves it through a lightweight Flask web server.

## Architecture

The solution consists of two main stages:

1. **Scraper Stage (Node.js):**
   * Uses Node.js with Puppeteer and Chromium
   * Scrapes data from a user-specified URL
   * Saves the scraped data as JSON

2. **Hosting Stage (Python):**
   * Uses Python with Flask to serve the scraped content
   * Provides a user-friendly dashboard to view results
   * Also offers a JSON API endpoint to access raw data

## Project Structure

* `Dockerfile`: Multi-stage build file
* `scrape.js`: Node.js script for web scraping
* `server.py`: Python Flask application to serve the scraped data
* `templates/dashboard.html`: Frontend dashboard interface
* `package.json`: Node.js dependencies
* `requirements.txt`: Python dependencies
* `entrypoint.sh`: Script to initialize the application

## Building the Docker Image

To build the Docker image, run the following command from the directory containing the Dockerfile:

```bash
docker build -t web-scraper-dashboard .
```

This will create a Docker image tagged as "web-scraper-dashboard" with all necessary components.

## Running the Container

You can run the container in several ways:

### With a Specific URL to Scrape

To scrape a specific URL when starting the container, use the `SCRAPE_URL` environment variable:

```bash
docker run -p 5000:5000 -e SCRAPE_URL=https://news.ycombinator.com web-scraper-dashboard
```

This will:
1. Start the container
2. Execute the scraper on the specified URL
3. Start the Flask server to host the scraped content

### Without a Default URL

If you don't specify a URL, the container will start without scraping anything initially:

```bash
docker run -p 5000:5000 web-scraper-dashboard
```

You can then use the web dashboard to specify a URL to scrape.

### With Increased Memory for Complex Sites

For websites with complex layouts or large amounts of content, increase the shared memory:

```bash
docker run --shm-size=1gb -p 5000:5000 web-scraper-dashboard
```

## Accessing the Scraped Data

Once the container is running, you can access:

### Dashboard Interface

The web dashboard is available at:

```
http://localhost:5000
```

This interactive interface allows you to:
- Enter a URL to scrape
- View the formatted results
- See any errors that occurred during scraping

### JSON API

For programmatic access or to retrieve raw data:

```
http://localhost:5000/api/data
```

This endpoint returns the scraped data in JSON format.

### Health Check

You can also check the health of the service at:

```
http://localhost:5000/health
```

## Customization

### Modifying the Scraper

To change what data is scraped, modify the `scrape.js` file, specifically the `page.evaluate()` function. This function determines what elements are extracted from the webpage.

### Changing the Port

If you want to use a different port, modify the `EXPOSE` command in the Dockerfile and update the port mapping when running the container:

```bash
docker run -p 8080:5000 -e SCRAPE_URL=https://example.com web-scraper-dashboard
```

Or change both the internal and external ports:

```bash
# In Dockerfile, change: EXPOSE 8080
# In server.py, change: app.run(host='0.0.0.0', port=8080)

docker run -p 8080:8080 -e SCRAPE_URL=https://example.com web-scraper-dashboard
```

## Troubleshooting

### Common Issues

1. **Connection Timeouts**:
   * Some websites may block scraping attempts
   * Try increasing the timeout in `scrape.js` or using a different URL

2. **Missing Data**:
   * If certain elements aren't found, check the selectors in `scrape.js`
   * Different websites have different HTML structures

3. **Container Crashes**:
   * Check Docker logs: `docker logs [container_id]`
   * Ensure the URL is valid and accessible
   * If you see memory-related issues with Chromium, increase shared memory with `--shm-size=1gb`

## Technical Implementation Details

### Scraper (Node.js)

The scraper uses Puppeteer with the following features:
- Headless browser mode for invisible operation
- Proper Docker configuration flags
- Resource optimization (blocking images, stylesheets)
- Error handling and retry logic
- Generous timeouts for reliable operation

### Web Server (Python)

The Flask application provides:
- JSON API endpoint for raw data access
- HTML dashboard for user-friendly interaction
- Health check endpoint for monitoring
- Clean separation of concerns between scraping and hosting

## Data Persistence

If you need to persist the scraped data between container restarts, consider mounting a volume:

```bash
docker run -p 5000:5000 -v /path/on/host:/app/output web-scraper-dashboard
```

This will keep your scraped data even if the container is restarted or recreated.
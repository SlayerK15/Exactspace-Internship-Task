# Web Scraper with Dashboard

This project combines Node.js with Puppeteer for web scraping and Python with Flask for hosting a web dashboard in a Docker container. It uses a multi-stage build process to keep the final image lean while providing powerful web scraping capabilities.

## Architecture

This solution consists of two main stages:

1. **Scraper Stage (Node.js):**
   * Uses Node.js with Puppeteer and Chromium
   * Scrapes data from a user-specified URL
   * Saves the scraped data as JSON

2. **Hosting Stage (Python):**
   * Uses Python with Flask to serve a web dashboard
   * Provides a user-friendly interface to initiate scraping
   * Displays the scraped results in a formatted way
   * Also includes an API endpoint to access raw data

## Project Structure

* `Dockerfile`: Multi-stage build file
* `scrape.js`: Node.js script for web scraping
* `server.py`: Python Flask application to serve the dashboard and data
* `templates/dashboard.html`: Frontend dashboard interface
* `package.json`: Node.js dependencies
* `requirements.txt`: Python dependencies
* `entrypoint.sh`: Script to initialize the application

## Building the Docker Image

To build the Docker image, run the following command from the directory containing the Dockerfile:

```bash
docker build -t web-scraper-dashboard .
```

## Running the Container

You can run the container with or without a default URL to scrape:

```bash
# With a default URL to scrape on startup
docker run -p 5000:5000 -e SCRAPE_URL=https://news.ycombinator.com web-scraper-dashboard

# Without a default URL (will wait for user to input URL via dashboard)
docker run -p 5000:5000 web-scraper-dashboard
```

## Using the Dashboard

Once the container is running, you can access the dashboard by visiting:

```
http://localhost:5000
```

The dashboard allows you to:

1. Enter a URL to scrape
2. View the results in a formatted display
3. See any errors that occurred during scraping

## Accessing the API

The application also provides a JSON API endpoint to access the scraped data programmatically:

```
http://localhost:5000/api/data
```

You can also check the health of the service at:

```
http://localhost:5000/health
```

## Customization

### Modifying the Scraper

To change what data is scraped, modify the `scrape.js` file, specifically the `page.evaluate()` function. This function determines what elements are extracted from the webpage.

### Customizing the Dashboard

The dashboard interface is defined in `templates/dashboard.html`. You can modify this file to change the appearance or add additional functionality.

### Changing the Port

If you want to use a different port, modify the `EXPOSE` command in the Dockerfile and update the port mapping when running the container:

```bash
docker run -p 8080:5000 web-scraper-dashboard
```

Or change both the internal and external ports:

```bash
# In Dockerfile, change: EXPOSE 8080
# In server.py, change: app.run(host='0.0.0.0', port=8080)

docker run -p 8080:8080 web-scraper-dashboard
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

## Advanced Usage

### Running the Scraper Periodically

To scrape a website periodically, you could add a scheduling feature to the dashboard or use an external scheduler to hit the scrape endpoint.

### Persistence

If you need to persist the scraped data between container restarts, consider mounting a volume:

```bash
docker run -p 5000:5000 -v /path/on/host:/app/output web-scraper-dashboard
```

This will keep your scraped data even if the container is restarted or recreated.
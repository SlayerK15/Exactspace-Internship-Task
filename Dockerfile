# Stage 1: Node.js Scraper Stage - Using Alpine for smaller footprint
FROM node:18-alpine AS scraper

# Set environment variable to skip Puppeteer downloading Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install Chromium and required dependencies - with cleanup in same layer
RUN apk add --no-cache \
    chromium \
    font-noto-cjk \
    freetype \
    ttf-freefont

# Set the working directory
WORKDIR /app

# Copy package.json first for better layer caching
COPY package.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy only the scraper script
COPY scrape.js ./

# Create a directory for the output
RUN mkdir -p /app/output

# Set a default URL (will be overridden when running the container)
ENV SCRAPE_URL=https://example.com

# Stage 2: Python Hosting Stage - Using Alpine for smaller footprint
FROM python:3.10-alpine AS final

# Install only the necessary packages
RUN apk add --no-cache \
    nodejs \
    npm \
    chromium \
    font-noto-cjk \
    freetype \
    ttf-freefont

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set the working directory
WORKDIR /app

# Copy requirements.txt
COPY requirements.txt ./

# Install minimal dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the server script and scraper script
COPY server.py ./
COPY --from=scraper /app/scrape.js ./
COPY --from=scraper /app/node_modules ./node_modules

# Copy the entrypoint script
COPY entrypoint.sh ./
RUN chmod +x /app/entrypoint.sh

# Create directories for scraped data
RUN mkdir -p /app/data /app/output

# Create a link from /app/output/scraped_data.json to /app/data/scraped_data.json
RUN touch /app/output/scraped_data.json && \
    ln -sf /app/output/scraped_data.json /app/data/scraped_data.json

# Expose port 5000
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=server.py
ENV FLASK_DEBUG=0
ENV NODE_PATH=/app/node_modules

# Command to run the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
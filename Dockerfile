# Stage 1: Node.js Scraper Stage
FROM node:18-slim AS scraper

# Set environment variable to skip Puppeteer downloading Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install Chromium and required dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the scraper script
COPY scrape.js ./

# Create a directory for the output
RUN mkdir -p /app/output

# Set a default URL (will be overridden when running the container)
ENV SCRAPE_URL=https://example.com

# Create a directory for the output
RUN mkdir -p /app/output

# We'll create a placeholder file that will be overwritten when the container runs
RUN echo '{"placeholder": true, "message": "Data will be scraped when container runs"}' > /app/output/scraped_data.json

# Stage 2: Python Hosting Stage
FROM python:3.10-slim AS final

# Install Node.js in the final image
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set environment variable to skip Puppeteer downloading Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set the working directory
WORKDIR /app

# Copy requirements.txt
COPY requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the server script and scraper script
COPY server.py ./
COPY --from=scraper /app/scrape.js ./
COPY --from=scraper /app/node_modules ./node_modules

# Copy the entrypoint script
COPY entrypoint.sh ./
RUN chmod +x /app/entrypoint.sh

# Create directory for scraped data
RUN mkdir -p /app/data
RUN mkdir -p /app/output

# Create a link from /app/output/scraped_data.json to /app/data/scraped_data.json
RUN touch /app/output/scraped_data.json
RUN ln -sf /app/output/scraped_data.json /app/data/scraped_data.json

# Expose port 5000
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=server.py
ENV FLASK_DEBUG=0
ENV NODE_PATH=/app/node_modules

# Command to run the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
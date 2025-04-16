#!/bin/bash
# Run Docker container with increased shared memory space
docker run --shm-size=1gb -p 5000:5000 web-scraper-dashboard
from flask import Flask, jsonify, render_template, request, redirect, url_for
import json
import os
import subprocess
import time

app = Flask(__name__)

# Path to the scraped data file
DATA_FILE = os.path.join(os.path.dirname(__file__), 'output', 'scraped_data.json')

@app.route('/')
def dashboard():
    """Render the dashboard page."""
    default_url = os.environ.get('SCRAPE_URL', 'https://example.com')
    
    # Read scraped data if it exists
    scraped_data = None
    status = None
    status_class = None
    
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as file:
                scraped_data = json.load(file)
                
            # Check if this contains an error
            if scraped_data.get('error', False):
                status = f"Error: {scraped_data.get('message', 'Unknown error occurred')}"
                status_class = "error"
            else:
                status = "Successfully scraped data from website"
                status_class = "success"
        except Exception as e:
            status = f"Error reading scraped data: {str(e)}"
            status_class = "error"
    
    return render_template('dashboard.html', 
                          default_url=default_url,
                          scraped_data=scraped_data,
                          status=status,
                          status_class=status_class)

@app.route('/scrape', methods=['POST'])
def scrape():
    """Handle the scrape form submission."""
    url = request.form.get('url', '')
    
    if not url:
        return redirect(url_for('dashboard'))
    
    # Run the scraper with the provided URL
    try:
        # Set environment variable for the scraper
        env = os.environ.copy()
        env['SCRAPE_URL'] = url
        
        # Run the scraper
        result = subprocess.run(['node', '/app/scrape.js'], 
                               env=env,
                               capture_output=True,
                               text=True)
        
        # Give the file system a moment to sync
        time.sleep(1)
        
        # Check if the process was successful
        if result.returncode != 0:
            print(f"Scraper error: {result.stderr}")
    except Exception as e:
        print(f"Error running scraper: {str(e)}")
    
    # Redirect back to the dashboard to see the results
    return redirect(url_for('dashboard'))

@app.route('/api/data')
def get_scraped_data():
    """Return the scraped data as JSON for API use."""
    try:
        # Check if file exists
        if not os.path.exists(DATA_FILE):
            return jsonify({
                "error": True,
                "message": "Scraped data file not found"
            }), 404
        
        # Read the JSON file
        with open(DATA_FILE, 'r') as file:
            data = json.load(file)
        
        # Return the data as JSON
        return jsonify(data)
    
    except Exception as e:
        # Handle any errors
        return jsonify({
            "error": True,
            "message": str(e)
        }), 500

@app.route('/health')
def health_check():
    """Simple health check endpoint."""
    return jsonify({
        "status": "ok",
        "service": "web-scraper-host"
    })

if __name__ == '__main__':
    # Create templates dir if it doesn't exist
    os.makedirs(os.path.join(os.path.dirname(__file__), 'templates'), exist_ok=True)
    
    app.run(host='0.0.0.0', port=5000)
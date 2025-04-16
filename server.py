from flask import Flask, jsonify
import json
import os

app = Flask(__name__)

# Path to the scraped data file
DATA_FILE = os.path.join(os.path.dirname(__file__), 'output', 'scraped_data.json')

@app.route('/')
def get_scraped_data():
    """Return the scraped data as JSON."""
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
    app.run(host='0.0.0.0', port=5000)
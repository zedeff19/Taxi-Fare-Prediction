#!/usr/bin/env python3
"""
Simple HTTP Server for Taxi Fare Predictor Frontend
This serves the frontend files with proper CORS headers
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        # Disable caching to ensure fresh files are served
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def start_server(port=8000):
    """Start the HTTP server"""
    # Change to frontend directory
    frontend_dir = Path(__file__).parent
    os.chdir(frontend_dir)
    
    # Create server
    handler = CORSRequestHandler
    httpd = socketserver.TCPServer(("", port), handler)
    
    print(f"🌐 Starting HTTP Server...")
    print(f"📁 Serving files from: {frontend_dir}")
    print(f"🔗 Frontend URL: http://localhost:{port}")
    print(f"📱 Open http://localhost:{port}/index.html in your browser")
    print(f"🛑 Press Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        httpd.shutdown()

if __name__ == "__main__":
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Invalid port number. Using default port 8000.")
    
    start_server(port)

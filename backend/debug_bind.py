import http.server
import socketserver
import sys

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"serving at port {PORT}")
        httpd.serve_forever()
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)

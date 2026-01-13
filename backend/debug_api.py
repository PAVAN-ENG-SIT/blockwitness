import urllib.request
import urllib.error
import sys

url = "http://localhost:8000/api/explorer"
print(f"👉 Requesting {url}...")

try:
    with urllib.request.urlopen(url) as response:
        print(f"✅ Status: {response.status}")
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"❌ HTTP Error: {e.code} {e.reason}")
    print("--- Error Body ---")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"❌ Error: {e}")

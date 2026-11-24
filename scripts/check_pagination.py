import urllib.request
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

# Check pages 0, 10, 50, 100, 500, 1000, 2000, 3000, 4000
test_pages = [0, 1, 2, 5, 10, 50, 100, 500, 1000, 2000, 3000, 4000, 5000]
for p in test_pages:
    url = f"https://www.ereps.eu/member-directory?page={p}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='replace')
            rows = re.findall(r'<tr[^>]*>(.*?)</tr>', html, re.DOTALL)
            row_count = max(0, len(rows) - 1)
            first_id = re.findall(r'class="views-field views-field-id"[^>]*>\s*([^\s<]+)', rows[1]) if len(rows) > 1 else []
            print(f"Page {p}: rows={row_count}, first_id={first_id}")
            if row_count == 0:
                print(f"Page {p} returned 0 rows! Max page is between {p//2} and {p}.")
                break
    except Exception as e:
        print(f"Page {p} error: {e}")

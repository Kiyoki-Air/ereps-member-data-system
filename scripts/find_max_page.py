import urllib.request
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def check_page(p):
    url = f"https://www.ereps.eu/member-directory?page={p}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='replace')
            rows = re.findall(r'<tr[^>]*>(.*?)</tr>', html, re.DOTALL)
            return max(0, len(rows) - 1)
    except Exception as e:
        print(f"Error checking page {p}: {e}")
        return 0

low = 100
high = 500
last_valid_page = 100

while low <= high:
    mid = (low + high) // 2
    count = check_page(mid)
    print(f"Testing page {mid}: {count} rows")
    if count > 0:
        last_valid_page = mid
        low = mid + 1
    else:
        high = mid - 1

print(f"\nEXACT LAST PAGE: {last_valid_page}")
total_approx = last_valid_page * 40
print(f"Approximate total active members on website: ~{total_approx:,}")

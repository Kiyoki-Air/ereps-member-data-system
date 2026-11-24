import re
import urllib.request

with open("data/sample_ereps.html", "r", encoding="utf-8") as f:
    html = f.read()

# Countries in select
countries = re.findall(r'<select[^>]*name=[\'"]country\[\][\'"][^>]*>(.*?)</select>', html, re.DOTALL)
if countries:
    options = re.findall(r'<option[^>]*value=[\'"]([^\'"]*)[\'"][^>]*>(.*?)</option>', countries[0])
    print(f"Total countries in dropdown: {len(options)}")
    for val, name in options[:25]:
        print(f"  {val}: {name.strip()}")

# Qualifications in select
quals = re.findall(r'<select[^>]*name=[\'"]ereps_status_7[\'"][^>]*>(.*?)</select>', html, re.DOTALL)
if quals:
    options = re.findall(r'<option[^>]*value=[\'"]([^\'"]*)[\'"][^>]*>(.*?)</option>', quals[0])
    print(f"\nTotal qualifications in dropdown: {len(options)}")
    for val, name in options:
        print(f"  {val}: {name.strip()}")

# Check pagination or pager in full html
pagers = re.findall(r'<nav[^>]*pager[^>]*>(.*?)</nav>', html, re.DOTALL)
print(f"\nPager nav count: {len(pagers)}")
all_pagers = re.findall(r'<ul[^>]*class=[\'"][^\'"]*pager[^\'"]*[\'"][^>]*>(.*?)</ul>', html, re.DOTALL)
print(f"Pager ul count: {len(all_pagers)}")
if all_pagers:
    print("Pager links:", re.findall(r'href=[\'"]([^\'"]*)[\'"]', all_pagers[0]))

# Check how many rows in this page:
rows = re.findall(r'<tr[^>]*>(.*?)</tr>', html, re.DOTALL)
print(f"Data rows count (excluding header): {len(rows) - 1}")

# Check what happens when querying ?page=1
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
req = urllib.request.Request("https://www.ereps.eu/member-directory?page=1", headers=headers)
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        page1_html = resp.read().decode('utf-8', errors='replace')
        page1_rows = re.findall(r'<tr[^>]*>(.*?)</tr>', page1_html, re.DOTALL)
        print(f"\nPage 1 (?page=1) rows count: {len(page1_rows) - 1}")
        if len(page1_rows) > 1:
            first_id = re.findall(r'class="views-field views-field-id"[^>]*>\s*([^\s<]+)', page1_rows[1])
            print("Page 1 first ID:", first_id)
except Exception as e:
    print("Page 1 error:", e)

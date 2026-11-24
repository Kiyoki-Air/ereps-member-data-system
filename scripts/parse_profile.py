import re

with open("data/sample_profile_4080.html", "r", encoding="utf-8") as f:
    html = f.read()

# Find main content region
main_match = re.search(r'<main[^>]*>(.*?)</main>', html, re.DOTALL)
content = main_match.group(1) if main_match else html

# Print all <a> tags in main content
links = re.findall(r'<a[^>]*href=[\'"]([^\'"]*)[\'"][^>]*>(.*?)</a>', content, re.DOTALL)
print("Total links in main content:", len(links))
for href, text in links:
    clean_text = re.sub(r'<[^>]+>', '', text).strip()
    if not href.startswith("/") and "ereps" not in href and "europe" not in href:
        print(f"  External Link: {clean_text} -> {href}")

# Check fields in main content
fields = re.findall(r'class=[\'"]([^\'"]*views-field[^\'"]*|[^\'"]*field--[^\'"]*)[\'"][^>]*>(.*?)</div>', content, re.DOTALL)
print(f"\nFields found: {len(fields)}")
for cls, val in fields[:15]:
    clean_val = re.sub(r'<[^>]+>', ' ', val).strip()
    print(f"  Field [{cls}]: {clean_val[:120]}")

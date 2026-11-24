import urllib.request
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def parse_listing_page(html):
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', html, re.DOTALL)
    members = []
    for r in rows[1:]: # skip header
        m_id = re.search(r'class="views-field views-field-id"[^>]*>\s*([^\s<]+)', r)
        name = re.search(r'class="views-field views-field-display-name"[^>]*>\s*([^<]+)', r)
        city = re.search(r'class="views-field views-field-city"[^>]*>\s*([^<]*)', r)
        country = re.search(r'class="views-field views-field-country"[^>]*>\s*([^<]*)', r)
        qual = re.search(r'class="views-field views-field-ereps-status-7"[^>]*>\s*([^<]*)', r)
        discipline = re.search(r'class="views-field views-field-discipline-565"[^>]*>\s*([^<]*)', r)
        end_date = re.search(r'class="views-field views-field-end-date"[^>]*>\s*([^<]*)', r)
        profile_link = re.search(r'href=[\'"](/member-profile/[^\'"]+)[\'"]', r)

        if m_id and name:
            members.append({
                "member_id": m_id.group(1).strip(),
                "full_name": name.group(1).strip(),
                "city": city.group(1).strip() if city else "",
                "country": country.group(1).strip() if country else "",
                "qualification": qual.group(1).strip() if qual else "",
                "discipline": discipline.group(1).strip() if discipline else "",
                "expiry_date": end_date.group(1).strip() if end_date else "",
                "profile_url": f"https://www.ereps.eu{profile_link.group(1).strip()}" if profile_link else ""
            })
    return members

url = "https://www.ereps.eu/member-directory?page=0"
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=10) as resp:
    html = resp.read().decode('utf-8', errors='replace')
    m_list = parse_listing_page(html)
    print(f"Parsed {len(m_list)} real members from page 0:")
    for m in m_list[:5]:
        print(m)

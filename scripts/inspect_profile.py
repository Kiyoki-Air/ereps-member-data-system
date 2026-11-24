import urllib.request
import re

profile_url = "https://www.ereps.eu/member-profile/4080"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

req = urllib.request.Request(profile_url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode('utf-8', errors='replace')
        print(f"Profile {profile_url} HTTP Status: {resp.status}, HTML length: {len(html)}")
        with open("data/sample_profile_4080.html", "w", encoding="utf-8") as f:
            f.write(html)
        
        # Look for social media links
        social_links = re.findall(r'href=[\'"]([^\'"]*(?:instagram|linkedin|facebook|twitter|youtube|tiktok|http)[^\'"]*)[\'"]', html)
        print("External links found:", list(set(social_links)))
        
        # Look for bio or description
        bio_matches = re.findall(r'class=[\'"][^\'"]*(?:bio|description|field--name-body|about)[^\'"]*[\'"][^>]*>(.*?)</div>', html, re.DOTALL)
        print("Bio matches:", bio_matches[:3])
except Exception as e:
    print("Error fetching profile:", e)

import urllib.request
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

test_ids = ['4080', '4001', '3538', '3536', '424']

def parse_profile(member_id):
    url = f"https://www.ereps.eu/member-profile/{member_id}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='replace')
            
            # Look for profile icons and their hrefs
            # Matches <a href="..." ...><img ...src="...images/profile/..." ...></a>
            icon_links = re.findall(r'<a[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>\s*<img[^>]*src=[\'"][^\'"]*images/profile/([^\'"]+)[\'"]', html, re.DOTALL)
            
            # Also look for any direct social links inside main content (excluding ereps/europeactive)
            all_links = re.findall(r'<a[^>]*href=[\'"](https?://[^\'"]+)[\'"]', html)
            social_candidates = [
                l for l in all_links 
                if any(k in l.lower() for k in ['instagram.com', 'linkedin.com', 'facebook.com', 'twitter.com', 'youtube.com', 'tiktok.com'])
                and not any(ex in l.lower() for ex in ['ereps.eu', 'europe_active', 'company/6386959', 'ereps_'])
            ]
            
            # Check bio
            bio = re.findall(r'class=[\'"][^\'"]*bio[^\'"]*[\'"][^>]*>(.*?)</div>', html, re.DOTALL)

            return {
                "member_id": member_id,
                "icon_links": icon_links,
                "social_candidates": list(set(social_candidates)),
                "has_bio": len(bio) > 0
            }
    except Exception as e:
        return {"member_id": member_id, "error": str(e)}

for mid in test_ids:
    print(parse_profile(mid))

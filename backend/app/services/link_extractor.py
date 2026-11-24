import re
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from typing import Dict, Optional, Tuple

class LinkExtractorEngine:
    """
    Dedicated Link Extraction & Classification Engine.
    Identifies and categorizes social media profiles, personal websites, and business portals.
    Preserves original URL, produces sanitized clean URLs, and validates format.
    """

    PLATFORM_PATTERNS = {
        "instagram": [
            r"(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_\.]+)",
            r"(?:https?:\/\/)?(?:www\.)?instagr\.am\/([a-zA-Z0-9_\.]+)"
        ],
        "linkedin": [
            r"(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/(?:in|company|profile)\/([a-zA-Z0-9\-_%]+)",
            r"(?:https?:\/\/)?(?:www\.)?linkedin\.com\/pub\/([a-zA-Z0-9\-_%]+)"
        ],
        "facebook": [
            r"(?:https?:\/\/)?(?:www\.|m\.)?facebook\.com\/(?:profile\.php\?id=\d+|[a-zA-Z0-9\._\-]+)",
            r"(?:https?:\/\/)?(?:www\.)?fb\.me\/([a-zA-Z0-9\._\-]+)",
            r"(?:https?:\/\/)?(?:www\.)?fb\.com\/([a-zA-Z0-9\._\-]+)"
        ],
        "youtube": [
            r"(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:c\/|user\/|channel\/|@)?([a-zA-Z0-9_\-]+)",
            r"(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_\-]+)"
        ],
        "twitter_x": [
            r"(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]{1,15})"
        ],
        "tiktok": [
            r"(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([a-zA-Z0-9_\.]+)"
        ]
    }

    TRACKING_PARAMS = {
        "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
        "fbclid", "igshid", "ref", "source", "feature", "si"
    }

    @classmethod
    def clean_url(cls, raw_url: str) -> str:
        """Removes tracking query parameters, fragments, and standardizes scheme."""
        if not raw_url:
            return ""
        
        url = raw_url.strip()
        if not url.startswith("http://") and not url.startswith("https://"):
            url = "https://" + url

        try:
            parsed = urlparse(url)
            query_dict = parse_qs(parsed.query, keep_blank_values=False)
            filtered_query = {k: v for k, v in query_dict.items() if k.lower() not in cls.TRACKING_PARAMS}
            
            clean_query = urlencode(filtered_query, doseq=True)
            cleaned = urlunparse((
                parsed.scheme.lower(),
                parsed.netloc.lower().rstrip("/"),
                parsed.path.rstrip("/"),
                "",
                clean_query,
                ""
            ))
            return cleaned
        except Exception:
            return url

    @classmethod
    def validate_url(cls, url: str) -> bool:
        """Checks if URL is syntactically valid and has domain."""
        if not url or len(url) < 4:
            return False
        try:
            result = urlparse(url if "://" in url else "https://" + url)
            return all([result.scheme in ("http", "https"), result.netloc, "." in result.netloc])
        except Exception:
            return False

    @classmethod
    def classify_link(cls, raw_url: str) -> Tuple[str, str, str]:
        """
        Takes raw URL, returns (platform, link_type, clean_url).
        Platforms: instagram, linkedin, facebook, youtube, twitter_x, tiktok, personal_website, business_website, other
        link_type: social, website, directory
        """
        if not cls.validate_url(raw_url):
            return ("other", "invalid", raw_url.strip())

        cleaned = cls.clean_url(raw_url)
        url_lower = cleaned.lower()

        # Check social platforms
        for platform, patterns in cls.PLATFORM_PATTERNS.items():
            for pat in patterns:
                if re.search(pat, url_lower):
                    return (platform, "social", cleaned)

        # Distinguish personal vs business website
        parsed = urlparse(cleaned)
        netloc = parsed.netloc.lower()

        business_indicators = ["studio", "fitness", "gym", "crossfit", "academy", "clinic", "coaching", "company", "center", "ltd", "gmbh", "corp", "team", "club"]
        is_business = any(ind in netloc or ind in parsed.path.lower() for ind in business_indicators)

        if is_business:
            return ("business_website", "website", cleaned)
        else:
            return ("personal_website", "website", cleaned)

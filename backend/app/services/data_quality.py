import re
import datetime
from typing import Dict, Optional, Tuple, List, Set

class DataQualityEngine:
    """
    Data Quality & Governance Service.
    Standardizes countries, dates, validates IDs, tracks missing fields and flags duplicates.
    """

    # Comprehensive European & International country normalization map
    COUNTRY_MAP: Dict[str, str] = {
        "uk": "United Kingdom",
        "united kingdom": "United Kingdom",
        "gb": "United Kingdom",
        "great britain": "United Kingdom",
        "england": "United Kingdom",
        "scotland": "United Kingdom",
        "wales": "United Kingdom",
        "northern ireland": "United Kingdom",
        "deutschland": "Germany",
        "germany": "Germany",
        "de": "Germany",
        "france": "France",
        "fr": "France",
        "espana": "Spain",
        "españa": "Spain",
        "spain": "Spain",
        "es": "Spain",
        "italia": "Italy",
        "italy": "Italy",
        "it": "Italy",
        "netherlands": "Netherlands",
        "nederland": "Netherlands",
        "holland": "Netherlands",
        "nl": "Netherlands",
        "belgium": "Belgium",
        "belgique": "Belgium",
        "belgië": "Belgium",
        "be": "Belgium",
        "portugal": "Portugal",
        "pt": "Portugal",
        "ireland": "Ireland",
        "ie": "Ireland",
        "eire": "Ireland",
        "austria": "Austria",
        "österreich": "Austria",
        "at": "Austria",
        "switzerland": "Switzerland",
        "schweiz": "Switzerland",
        "suisse": "Switzerland",
        "ch": "Switzerland",
        "sweden": "Sweden",
        "sverige": "Sweden",
        "se": "Sweden",
        "norway": "Norway",
        "norge": "Norway",
        "no": "Norway",
        "denmark": "Denmark",
        "danmark": "Denmark",
        "dk": "Denmark",
        "finland": "Finland",
        "suomi": "Finland",
        "fi": "Finland",
        "poland": "Poland",
        "polska": "Poland",
        "pl": "Poland",
        "greece": "Greece",
        "hellas": "Greece",
        "gr": "Greece",
        "cyprus": "Cyprus",
        "cy": "Cyprus",
        "czech republic": "Czech Republic",
        "czechia": "Czech Republic",
        "cz": "Czech Republic",
        "hungary": "Hungary",
        "magyarország": "Hungary",
        "hu": "Hungary",
        "romania": "Romania",
        "ro": "Romania",
        "bulgaria": "Bulgaria",
        "bg": "Bulgaria",
        "croatia": "Croatia",
        "hrvatska": "Croatia",
        "hr": "Croatia",
        "slovakia": "Slovakia",
        "sk": "Slovakia",
        "slovenia": "Slovenia",
        "si": "Slovenia",
        "lithuania": "Lithuania",
        "lt": "Lithuania",
        "latvia": "Latvia",
        "lv": "Latvia",
        "estonia": "Estonia",
        "ee": "Estonia",
        "luxembourg": "Luxembourg",
        "lu": "Luxembourg",
        "malta": "Malta",
        "mt": "Malta",
        "iceland": "Iceland",
        "is": "Iceland",
        "turkey": "Turkey",
        "türkiye": "Turkey",
        "tr": "Turkey",
        "united states": "United States",
        "usa": "United States",
        "us": "United States",
        "canada": "Canada",
        "ca": "Canada",
        "australia": "Australia",
        "au": "Australia",
        "uae": "United Arab Emirates",
        "united arab emirates": "United Arab Emirates",
        "dubai": "United Arab Emirates",
        "india": "India",
        "in": "India"
    }

    @classmethod
    def standardize_country(cls, raw_country: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
        """
        Returns (standardized_country, raw_country).
        Preserves original raw_country for provenance.
        """
        if not raw_country:
            return (None, None)
        
        cleaned = raw_country.strip()
        key = cleaned.lower()
        if key in cls.COUNTRY_MAP:
            return (cls.COUNTRY_MAP[key], cleaned)
        
        # Capitalize words if not in dictionary
        words = [w.capitalize() for w in cleaned.split()]
        return (" ".join(words), cleaned)

    @classmethod
    def standardize_date(cls, raw_date: Optional[str]) -> Optional[str]:
        """
        Standardizes various date formats into ISO 8601 'YYYY-MM-DD'.
        Supports: DD/MM/YYYY, YYYY-MM-DD, DD.MM.YYYY, DD-MM-YYYY, Month D, YYYY.
        """
        if not raw_date:
            return None
        
        s = raw_date.strip()
        
        # Check if already ISO format YYYY-MM-DD
        if re.match(r"^\d{4}-\d{2}-\d{2}$", s):
            return s
            
        # Try DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
        m = re.match(r"^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$", s)
        if m:
            day, month, year = int(m.group(1)), int(m.group(2)), int(m.group(3))
            try:
                dt = datetime.date(year, month, day)
                return dt.isoformat()
            except ValueError:
                pass
                
        # Try python dateutil or datetime parse fallbacks
        for fmt in ("%d %b %Y", "%d %B %Y", "%b %d, %Y", "%B %d, %Y", "%Y/%m/%d"):
            try:
                dt = datetime.datetime.strptime(s, fmt)
                return dt.date().isoformat()
            except ValueError:
                continue

        return s

    @classmethod
    def clean_text(cls, text: Optional[str]) -> Optional[str]:
        """Preserves unicode characters, strips excess whitespace and control characters."""
        if not text:
            return None
        # Normalize whitespace while maintaining unicode
        cleaned = re.sub(r"\s+", " ", text).strip()
        return cleaned if cleaned else None

    @classmethod
    def validate_member_id(cls, member_id: Optional[str]) -> Tuple[bool, str]:
        """Validates and cleans membership ID (e.g. '#133197' -> 'EREPS-133197')."""
        if not member_id:
            return (False, "Missing membership ID")
        cleaned = str(member_id).strip().lstrip("#").strip()
        if not cleaned:
            return (False, "Empty membership ID")
        if not re.match(r"^[A-Za-z0-9\-_]+$", cleaned):
            return (False, f"Invalid characters in member ID: {member_id}")
        return (True, cleaned)

    @classmethod
    def identify_missing_fields(cls, member_dict: dict, profile_dict: Optional[dict] = None) -> List[str]:
        """Detects which standard directory fields are missing."""
        missing = []
        if not member_dict.get("first_name") and not member_dict.get("full_name"):
            missing.append("name")
        if not member_dict.get("city"):
            missing.append("city")
        if not member_dict.get("country"):
            missing.append("country")
        if not member_dict.get("professional_category"):
            missing.append("professional_category")
        if not member_dict.get("expiry_date"):
            missing.append("expiry_date")
        if not member_dict.get("profile_url"):
            missing.append("profile_url")
            
        if profile_dict:
            if not profile_dict.get("description"):
                missing.append("description")
            if not profile_dict.get("specialties"):
                missing.append("specialties")
            if not profile_dict.get("business_name") and not profile_dict.get("business_email"):
                missing.append("business_info")
        else:
            missing.append("profile_details")

        return missing

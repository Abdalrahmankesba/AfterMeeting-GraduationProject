import re

def extract_speakers_from_cleaned_text(text: str) -> dict:
    """
    Extracts speakers from text formatted as 'Speaker Name: sentence'
    """
    speakers = {}
    pattern = r"^([\u0600-\u06FF\s]+):"

    for line in text.split("\n"):
        match = re.match(pattern, line.strip())
        if match:
            name = match.group(1).strip()
            speakers[name] = name

    return speakers

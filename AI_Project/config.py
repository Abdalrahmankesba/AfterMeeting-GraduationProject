import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv(override=True)

# ===== SYSTEM CONFIG =====
MODEL_SIZE = os.getenv("MODEL_SIZE", "large-v3")
LANGUAGE = os.getenv("LANGUAGE", "ar")

# ===== SECRETS =====
HF_TOKEN = os.getenv("HF_TOKEN", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
import os
from dotenv import load_dotenv

# Load relative to repo root
load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))

# --- Telegram Settings ---
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
NGROK_URL = os.getenv("NGROK_URL", "")
RENDER_URL = os.getenv("RENDER_EXTERNAL_URL")
FRONTEND_URL = os.getenv("FRONTEND_URL")
# The bot button should point to the frontend (Vercel), not the backend API
APP_URL = FRONTEND_URL or RENDER_URL or f"https://{NGROK_URL}"

# --- API Settings ---
API_URL = os.getenv("API_URL", "http://localhost:8000")

# --- Database Settings (PostgreSQL support) ---
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./barakatoping.db")

# Render's Postgres URL might start with postgres://, but SQLAlchemy 2.0 requires postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# --- Path Settings ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if os.path.exists(os.path.join(BASE_DIR, "backend/static")):
     STATIC_DIR = os.path.join(BASE_DIR, "backend/static")
else:
     STATIC_DIR = os.path.join(BASE_DIR, "static")

UPLOAD_DIR = os.path.join(STATIC_DIR, "uploads")

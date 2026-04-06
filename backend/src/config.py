import os
from dotenv import load_dotenv

# Load relative to repo root
load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))

# --- Telegram Settings ---
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
NGROK_URL = os.getenv("NGROK_URL", "shadowed-adelyn-goosenecked.ngrok-free.dev")
RENDER_URL = os.getenv("RENDER_EXTERNAL_URL")
APP_URL = RENDER_URL or f"https://{NGROK_URL}"

# --- API Settings ---
API_URL = os.getenv("API_URL", "http://localhost:8000")

# --- Database Settings (Handle Render Persistent Disk) ---
# If running in Render with a disk mount at /app/data
RENDER_DISK_PATH = "/app/data/barakatoping.db"
DEFAULT_DB_PATH = "sqlite:///./barakatoping.db"

if os.path.exists("/app/data"):
     # If the mount directory exists, use it for sqlite persistence
     DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{RENDER_DISK_PATH}")
else:
     DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DB_PATH)

# --- Path Settings ---
# This helps locating the static folder regardless of where the app is started
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# On Render, the folder structure might be different, let's accommodate both
if os.path.exists(os.path.join(BASE_DIR, "backend/static")):
     STATIC_DIR = os.path.join(BASE_DIR, "backend/static")
else:
     # If started inside backend/ or copied to /app/
     STATIC_DIR = os.path.join(BASE_DIR, "static")

UPLOAD_DIR = os.path.join(STATIC_DIR, "uploads")

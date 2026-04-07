import subprocess
import time
import os
import sys

def start_dev():
    print("🚀 Uvol Bo'lmasin - Developer Mode ishga tushmoqda...")
    
    # 1. Start Backend (Render mock)
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "src.main:app", "--reload", "--port", "8000"],
        cwd=os.path.join(os.getcwd(), "backend")
    )
    print("✅ Backend port 8000 da ishga tushdi.")

    # 2. Start Bot Polling (Local mode)
    bot_proc = subprocess.Popen(
        [sys.executable, "src/bot.py"],
        cwd=os.path.join(os.getcwd(), "backend")
    )
    print("✅ Bot (Polling mode) ishga tushdi.")

    # 3. Start Frontend (Vite)
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=os.path.join(os.getcwd(), "frontend"),
        shell=True
    )
    print("✅ Frontend (Vite) ishga tushdi.")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 To'xtatilmoqda...")
        backend_proc.terminate()
        bot_proc.terminate()
        frontend_proc.terminate()
        print("👋 Xayr!")

if __name__ == "__main__":
    start_dev()

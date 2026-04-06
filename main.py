import subprocess
import os
import signal
import sys
import time
from dotenv import load_dotenv

# .env faylini yuklash
load_dotenv()

def start_project():
    """
    Barakatoping loyihasining backend, frontend va ngrok xizmatlarini birgalikda ishga tushiradi.
    """
    print("\n" + "="*50)
    print("  BARAKATOPING LOYIHASINI ISHGA TUSHIRISH")
    print("="*50 + "\n")

    processes = []
    
    # 1. Ngrok Authtoken sozlash
    ngrok_token = os.getenv("NGROK_AUTHTOKEN")
    ngrok_cmd = r"C:\Users\Lenovo\AppData\Roaming\npm\ngrok.cmd"
    
    if ngrok_token and os.path.exists(ngrok_cmd):
        print(" [KEY] Ngrok authtoken sozlanmoqda...")
        subprocess.run([ngrok_cmd, "config", "add-authtoken", ngrok_token], capture_output=True)

    try:
        # 2. Backend ishga tushirish (FastAPI)
        print(" [BACKEND] Server ishga tushirilmoqda (localhost:8000)...")
        python_exe = os.path.join(os.getcwd(), "venv", "Scripts", "python.exe")
        backend_p = subprocess.Popen(
            [python_exe, "-m", "backend.src.main"],
            cwd=os.getcwd()
        )
        processes.append(backend_p)

        # 2.1 Bot ishga tushirish (Standalone)
        print(" [BOT] Telegram polling ishga tushirilmoqda...")
        bot_p = subprocess.Popen(
            [python_exe, "-m", "backend.src.main", "--bot"],
            cwd=os.getcwd()
        )
        processes.append(bot_p)

        # 3. Frontend ishga tushirish (Vite)
        print(" [FRONTEND] Vite ishga tushirilmoqda (localhost:5173)...")
        frontend_p = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=os.path.join(os.getcwd(), "frontend"),
            shell=True
        )
        processes.append(frontend_p)

        # 4. Ngrok Tunnel (Live URL)
        ngrok_url = os.getenv("NGROK_URL")
        if ngrok_token and os.path.exists(ngrok_cmd) and ngrok_url:
            print(f" [WORLD] Ngrok tunnel ochilmoqda: https://{ngrok_url}")
            # --url flagi yangi versiyalarda tavsiya etiladi
            ngrok_p = subprocess.Popen(
                [ngrok_cmd, "http", "--url", f"https://{ngrok_url}", "5173"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            processes.append(ngrok_p)

        print("\n" + "-"*50)
        print(" [OK] HAMMA XIZMATLAR ISHGA TUSHDI!")
        print(f" > Backend: http://localhost:8000")
        print(f" > Frontend: http://localhost:5173")
        print(f" > Live URL: https://{ngrok_url}")
        print("-"*50 + "\n")
        print("Ishni to'xtatish uchun Ctrl+C tugmalarini bosing.\n")

        # Jarayonlar ishlab turishini nazorat qilish
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n\n🛑 Loyiha to'xtatilmoqda...")
        for p in processes:
            try:
                # Windows'da subprocesslarni to'g'ri yopish
                if hasattr(os, 'kill'):
                    os.kill(p.pid, signal.SIGTERM)
                else:
                    p.terminate()
            except:
                pass
        print(" [OK] Barcha xizmatlar to'xtatildi. Xayr!")
        sys.exit(0)

if __name__ == "__main__":
    start_project()

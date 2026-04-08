import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from .database import engine
from . import models, api_buyer, api_seller, api_common, config

# Database initialization
models.Base.metadata.create_all(bind=engine)

# FastAPI app initialization
app = FastAPI(
    title="Uvol Bo'lmasin API", 
    description="Food Rescue Platform — Isrofni to'xtating, barakani toping!", 
    version="2.1.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
if not os.path.exists(config.UPLOAD_DIR):
    os.makedirs(config.UPLOAD_DIR)
app.mount("/api/static/uploads", StaticFiles(directory=config.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(api_common.router)
app.include_router(api_buyer.router)
app.include_router(api_seller.router)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    print(f" [SERVER ERROR] {request.method} {request.url.path}: {exc}")
    print(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={
            "status": "error", 
            "message": "Serverda kutilmagan xatolik yuz berdi.",
            "detail": str(exc)
        }
    )

@app.on_event("startup")
async def on_startup():
    import asyncio
    from . import bot, tasks
    print(" [SYSTEM] Background xizmatlar (Bot, Cleanup) ishga tushirilmoqda...")
    asyncio.create_task(bot.run_bot())
    asyncio.create_task(tasks.cleanup_expired_orders())
    asyncio.create_task(tasks.keep_alive())

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f" [SYSTEM] Web Service starting on port {port}...")
    uvicorn.run("backend.src.main:app", host="0.0.0.0", port=port)

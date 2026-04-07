import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

# New Absolute Imports for Root-level Entry Point
# We use 'from src import ...' because we are now in the backend/ root
import models, api_buyer, api_seller, api_common, config
from database import engine

# Database initialization
models.Base.metadata.create_all(bind=engine)

# FastAPI app initialization
app = FastAPI(
    title="Uvol Bo'lmasin API", 
    description="Food Rescue Platform — Isrofni to'xtating, barakani toping!", 
    version="2.1.final"
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

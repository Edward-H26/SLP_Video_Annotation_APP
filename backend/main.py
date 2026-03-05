from fastapi import FastAPI
from contextlib import asynccontextmanager
from config.database import Database
from config import settings
from fastapi.middleware.cors import CORSMiddleware
from routes.project_routes import router as projectRouter
from routes.video_routes import router as videoRouter
from routes.transcript_routes import router as transcriptRouter
from routes.annotation_routes import router as annotationRouter
from routes.export_routes import router as exportRouter
import uvicorn
import os

db = Database()


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    await db.connect_to_database()
    yield
    await db.close_database_connection()


app = FastAPI(title="Video Annotation Platform", lifespan=lifespan)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projectRouter, prefix="/api/projects", tags=["projects"])
app.include_router(videoRouter, prefix="/api/videos", tags=["videos"])
app.include_router(transcriptRouter, prefix="/api/transcripts", tags=["transcripts"])
app.include_router(annotationRouter, prefix="/api/annotations", tags=["annotations"])
app.include_router(exportRouter, prefix="/api/export", tags=["export"])

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.isdir(STATIC_DIR):
    assetsDir = os.path.join(STATIC_DIR, "assets")
    if os.path.isdir(assetsDir):
        app.mount("/assets", StaticFiles(directory=assetsDir), name="static-assets")

    @app.get("/{fullPath:path}")
    async def serveFrontend(fullPath: str):
        filePath = os.path.join(STATIC_DIR, fullPath)
        if os.path.isfile(filePath):
            return FileResponse(filePath)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        reload=settings.DEBUG_MODE,
        port=settings.PORT,
    )

from fastapi import APIRouter, HTTPException, UploadFile, File, BackgroundTasks, Header
from fastapi.responses import StreamingResponse
from config.database import Database
from config import settings
from services.video_processing import extractAudio, getVideoDuration
from services.transcription import transcribeAudio
from bson import ObjectId
from datetime import datetime, timezone
from uuid import uuid4
import os

router = APIRouter()
DATA_DIR = settings.UPLOAD_DIR
os.makedirs(DATA_DIR, exist_ok=True)


def serializeVideo(video: dict) -> dict:
    return {
        "id": str(video["_id"]),
        "projectId": str(video.get("projectId", "")),
        "filename": video.get("filename", ""),
        "originalFilename": video.get("originalFilename", ""),
        "duration": video.get("duration", 0),
        "status": video.get("status", "uploading"),
        "createdAt": video.get("createdAt", "").isoformat() if video.get("createdAt") else ""
    }


async def processVideo(videoId: str, filePath: str):
    videosCollection = Database.get_videos_collection()
    transcriptsCollection = Database.get_transcripts_collection()

    try:
        await videosCollection.update_one(
            {"_id": ObjectId(videoId)},
            {"$set": {"status": "processing"}}
        )

        audioPath = await extractAudio(filePath)
        duration = await getVideoDuration(filePath)

        await videosCollection.update_one(
            {"_id": ObjectId(videoId)},
            {"$set": {
                "audioPath": audioPath,
                "duration": duration,
                "status": "transcribing"
            }}
        )

        segments = await transcribeAudio(audioPath)

        now = datetime.now(timezone.utc)
        await transcriptsCollection.insert_one({
            "videoId": ObjectId(videoId),
            "segments": segments,
            "createdAt": now,
            "updatedAt": now
        })

        await videosCollection.update_one(
            {"_id": ObjectId(videoId)},
            {"$set": {"status": "ready", "updatedAt": now}}
        )
    except Exception as e:
        await videosCollection.update_one(
            {"_id": ObjectId(videoId)},
            {"$set": {"status": "error", "errorMessage": str(e)}}
        )


@router.post("/upload/{projectId}")
async def uploadVideo(projectId: str, backgroundTasks: BackgroundTasks, file: UploadFile = File(...)):
    fileExtension = os.path.splitext(file.filename)[1]
    uniqueFilename = f"{uuid4()}{fileExtension}"
    filePath = os.path.join(DATA_DIR, uniqueFilename)

    fileSize = 0
    with open(filePath, "wb") as buffer:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            buffer.write(chunk)
            fileSize += len(chunk)

    collection = Database.get_videos_collection()
    now = datetime.now(timezone.utc)
    doc = {
        "projectId": ObjectId(projectId),
        "filename": uniqueFilename,
        "originalFilename": file.filename,
        "filePath": filePath,
        "audioPath": "",
        "mimeType": file.content_type or "video/mp4",
        "fileSize": fileSize,
        "duration": 0,
        "status": "uploading",
        "createdAt": now,
        "updatedAt": now
    }
    result = await collection.insert_one(doc)
    doc["_id"] = result.inserted_id

    backgroundTasks.add_task(processVideo, str(result.inserted_id), filePath)

    return serializeVideo(doc)


def getVideoStream(filePath: str, start: int, end: int):
    with open(filePath, "rb") as f:
        f.seek(start)
        while start <= end:
            chunkSize = min(4096, end - start + 1)
            data = f.read(chunkSize)
            if not data:
                break
            start += len(data)
            yield data


@router.get("/stream/{videoId}")
async def streamVideo(videoId: str, range: str = Header(None)):
    collection = Database.get_videos_collection()
    video = await collection.find_one({"_id": ObjectId(videoId)})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    filePath = video.get("filePath", "")
    if not os.path.exists(filePath):
        raise HTTPException(status_code=404, detail="Video file not found")

    fileSize = os.path.getsize(filePath)
    mimeType = video.get("mimeType", "video/mp4")

    if not range:
        return StreamingResponse(
            getVideoStream(filePath, 0, fileSize - 1),
            media_type=mimeType,
            headers={
                "Accept-Ranges": "bytes",
                "Content-Length": str(fileSize),
            },
            status_code=200,
        )

    start, end = 0, fileSize - 1
    rangeValue = range.strip().split("=")[1]
    rangeValues = rangeValue.split("-")
    start = int(rangeValues[0]) if rangeValues[0] else start
    end = int(rangeValues[1]) if len(rangeValues) > 1 and rangeValues[1] else end

    contentLength = end - start + 1
    return StreamingResponse(
        getVideoStream(filePath, start, end),
        media_type=mimeType,
        headers={
            "Content-Range": f"bytes {start}-{end}/{fileSize}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(contentLength),
        },
        status_code=206,
    )


@router.get("/project/{projectId}")
async def listProjectVideos(projectId: str):
    collection = Database.get_videos_collection()
    videos = await collection.find({"projectId": ObjectId(projectId)}).sort("createdAt", -1).to_list(100)
    return [serializeVideo(v) for v in videos]


@router.get("/{videoId}")
async def getVideo(videoId: str):
    collection = Database.get_videos_collection()
    video = await collection.find_one({"_id": ObjectId(videoId)})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return serializeVideo(video)


@router.delete("/{videoId}")
async def deleteVideo(videoId: str):
    collection = Database.get_videos_collection()
    transcriptsCollection = Database.get_transcripts_collection()
    annotationsCollection = Database.get_annotations_collection()

    video = await collection.find_one({"_id": ObjectId(videoId)})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    filePath = video.get("filePath", "")
    audioPath = video.get("audioPath", "")
    if filePath and os.path.exists(filePath):
        os.remove(filePath)
    if audioPath and os.path.exists(audioPath):
        os.remove(audioPath)

    await transcriptsCollection.delete_many({"videoId": ObjectId(videoId)})
    await annotationsCollection.delete_many({"videoId": ObjectId(videoId)})
    await collection.delete_one({"_id": ObjectId(videoId)})

    return {"message": "Video deleted"}

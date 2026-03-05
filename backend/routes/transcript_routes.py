from fastapi import APIRouter, HTTPException
from config.database import Database
from models.transcript import TranscriptUpdate, SpeakerUpdate
from bson import ObjectId
from datetime import datetime, timezone
import re

router = APIRouter()


def serializeTranscript(transcript: dict) -> dict:
    return {
        "id": str(transcript["_id"]),
        "videoId": str(transcript.get("videoId", "")),
        "segments": transcript.get("segments", []),
        "createdAt": transcript.get("createdAt", "").isoformat() if transcript.get("createdAt") else "",
        "updatedAt": transcript.get("updatedAt", "").isoformat() if transcript.get("updatedAt") else ""
    }


@router.get("/{videoId}")
async def getTranscript(videoId: str):
    collection = Database.get_transcripts_collection()
    transcript = await collection.find_one({"videoId": ObjectId(videoId)})
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return serializeTranscript(transcript)


@router.put("/{videoId}")
async def updateTranscript(videoId: str, data: TranscriptUpdate):
    collection = Database.get_transcripts_collection()
    now = datetime.now(timezone.utc)
    segments = [s.model_dump() for s in data.segments]
    result = await collection.update_one(
        {"videoId": ObjectId(videoId)},
        {"$set": {"segments": segments, "updatedAt": now}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Transcript not found")
    transcript = await collection.find_one({"videoId": ObjectId(videoId)})
    return serializeTranscript(transcript)


@router.patch("/{videoId}/speaker")
async def updateSpeaker(videoId: str, data: SpeakerUpdate):
    collection = Database.get_transcripts_collection()
    transcript = await collection.find_one({"videoId": ObjectId(videoId)})
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")

    segments = transcript.get("segments", [])
    updated = False
    for segment in segments:
        if segment.get("id") == data.segmentId:
            segment["speaker"] = data.speaker
            updated = True
            break

    if not updated:
        raise HTTPException(status_code=404, detail="Segment not found")

    now = datetime.now(timezone.utc)
    await collection.update_one(
        {"videoId": ObjectId(videoId)},
        {"$set": {"segments": segments, "updatedAt": now}}
    )
    return {"message": "Speaker updated"}


@router.get("/{videoId}/search")
async def searchTranscript(videoId: str, q: str = ""):
    collection = Database.get_transcripts_collection()
    transcript = await collection.find_one({"videoId": ObjectId(videoId)})
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")

    if not q:
        return transcript.get("segments", [])

    pattern = re.compile(re.escape(q), re.IGNORECASE)
    matching = [s for s in transcript.get("segments", []) if pattern.search(s.get("text", ""))]
    return matching

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, StreamingResponse
from config.database import Database
from services.export_service import exportAsJson, exportAsSrt, exportAsTxt, exportAsPdf
from bson import ObjectId
import json

router = APIRouter()


@router.get("/{videoId}")
async def exportTranscript(videoId: str, format: str = "json"):
    transcriptsCollection = Database.get_transcripts_collection()
    annotationsCollection = Database.get_annotations_collection()

    transcript = await transcriptsCollection.find_one({"videoId": ObjectId(videoId)})
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")

    segments = transcript.get("segments", [])
    annotations = await annotationsCollection.find({"videoId": ObjectId(videoId)}).sort("timestamp", 1).to_list(1000)
    serializedAnnotations = []
    for a in annotations:
        serializedAnnotations.append({
            "timestamp": a.get("timestamp", 0),
            "endTimestamp": a.get("endTimestamp"),
            "type": a.get("type", "note"),
            "content": a.get("content", ""),
            "tags": a.get("tags", []),
            "color": a.get("color", "")
        })

    if format == "srt":
        content = exportAsSrt(segments)
        return Response(
            content=content,
            media_type="text/plain",
            headers={"Content-Disposition": "attachment; filename=transcript.srt"}
        )
    elif format == "txt":
        content = exportAsTxt(segments, serializedAnnotations)
        return Response(
            content=content,
            media_type="text/plain",
            headers={"Content-Disposition": "attachment; filename=transcript.txt"}
        )
    elif format == "pdf":
        buffer = exportAsPdf(segments, serializedAnnotations)
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=transcript.pdf"}
        )
    else:
        data = exportAsJson(segments, serializedAnnotations)
        return Response(
            content=json.dumps(data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=transcript.json"}
        )

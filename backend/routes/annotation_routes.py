from fastapi import APIRouter, HTTPException
from config.database import Database
from models.annotation import AnnotationCreate, AnnotationUpdate
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter()


def serializeAnnotation(annotation: dict) -> dict:
    return {
        "id": str(annotation["_id"]),
        "videoId": str(annotation.get("videoId", "")),
        "timestamp": annotation.get("timestamp", 0),
        "endTimestamp": annotation.get("endTimestamp"),
        "type": annotation.get("type", "note"),
        "content": annotation.get("content", ""),
        "tags": annotation.get("tags", []),
        "color": annotation.get("color", ""),
        "createdAt": annotation.get("createdAt", "").isoformat() if annotation.get("createdAt") else ""
    }


@router.post("")
async def createAnnotation(data: AnnotationCreate):
    collection = Database.get_annotations_collection()
    now = datetime.now(timezone.utc)
    doc = {
        "videoId": ObjectId(data.videoId),
        "timestamp": data.timestamp,
        "endTimestamp": data.endTimestamp,
        "type": data.type,
        "content": data.content,
        "tags": data.tags,
        "color": data.color,
        "createdAt": now,
        "updatedAt": now
    }
    result = await collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serializeAnnotation(doc)


@router.get("/video/{videoId}")
async def listAnnotations(videoId: str):
    collection = Database.get_annotations_collection()
    annotations = await collection.find({"videoId": ObjectId(videoId)}).sort("timestamp", 1).to_list(1000)
    return [serializeAnnotation(a) for a in annotations]


@router.get("/{annotationId}")
async def getAnnotation(annotationId: str):
    collection = Database.get_annotations_collection()
    annotation = await collection.find_one({"_id": ObjectId(annotationId)})
    if not annotation:
        raise HTTPException(status_code=404, detail="Annotation not found")
    return serializeAnnotation(annotation)


@router.put("/{annotationId}")
async def updateAnnotation(annotationId: str, data: AnnotationUpdate):
    collection = Database.get_annotations_collection()
    updateData = {k: v for k, v in data.model_dump().items() if v is not None}
    updateData["updatedAt"] = datetime.now(timezone.utc)
    result = await collection.update_one(
        {"_id": ObjectId(annotationId)},
        {"$set": updateData}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Annotation not found")
    annotation = await collection.find_one({"_id": ObjectId(annotationId)})
    return serializeAnnotation(annotation)


@router.delete("/{annotationId}")
async def deleteAnnotation(annotationId: str):
    collection = Database.get_annotations_collection()
    result = await collection.delete_one({"_id": ObjectId(annotationId)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Annotation not found")
    return {"message": "Annotation deleted"}


@router.get("/video/{videoId}/search")
async def searchAnnotations(videoId: str, q: str = "", tags: str = ""):
    collection = Database.get_annotations_collection()
    query = {"videoId": ObjectId(videoId)}

    annotations = await collection.find(query).sort("timestamp", 1).to_list(1000)
    results = annotations

    if q:
        results = [a for a in results if q.lower() in a.get("content", "").lower()]

    if tags:
        tagList = [t.strip() for t in tags.split(",") if t.strip()]
        results = [a for a in results if any(t in a.get("tags", []) for t in tagList)]

    return [serializeAnnotation(a) for a in results]

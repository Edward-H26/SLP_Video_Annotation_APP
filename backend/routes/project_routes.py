from fastapi import APIRouter, HTTPException
from config.database import Database
from models.project import ProjectCreate, ProjectUpdate
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter()


def serializeProject(project: dict) -> dict:
    return {
        "id": str(project["_id"]),
        "title": project.get("title", ""),
        "description": project.get("description", ""),
        "createdAt": project.get("createdAt", "").isoformat() if project.get("createdAt") else "",
        "updatedAt": project.get("updatedAt", "").isoformat() if project.get("updatedAt") else ""
    }


@router.post("")
async def createProject(data: ProjectCreate):
    collection = Database.get_projects_collection()
    now = datetime.now(timezone.utc)
    doc = {
        "title": data.title,
        "description": data.description,
        "createdAt": now,
        "updatedAt": now
    }
    result = await collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serializeProject(doc)


@router.get("")
async def listProjects():
    collection = Database.get_projects_collection()
    projects = await collection.find().sort("createdAt", -1).to_list(100)
    return [serializeProject(p) for p in projects]


@router.get("/{projectId}")
async def getProject(projectId: str):
    collection = Database.get_projects_collection()
    project = await collection.find_one({"_id": ObjectId(projectId)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return serializeProject(project)


@router.put("/{projectId}")
async def updateProject(projectId: str, data: ProjectUpdate):
    collection = Database.get_projects_collection()
    updateData = {k: v for k, v in data.model_dump().items() if v is not None}
    updateData["updatedAt"] = datetime.now(timezone.utc)
    result = await collection.update_one(
        {"_id": ObjectId(projectId)},
        {"$set": updateData}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    project = await collection.find_one({"_id": ObjectId(projectId)})
    return serializeProject(project)


@router.delete("/{projectId}")
async def deleteProject(projectId: str):
    collection = Database.get_projects_collection()
    videosCollection = Database.get_videos_collection()
    transcriptsCollection = Database.get_transcripts_collection()
    annotationsCollection = Database.get_annotations_collection()

    videos = await videosCollection.find({"projectId": ObjectId(projectId)}).to_list(1000)
    videoIds = [v["_id"] for v in videos]

    if videoIds:
        await transcriptsCollection.delete_many({"videoId": {"$in": videoIds}})
        await annotationsCollection.delete_many({"videoId": {"$in": videoIds}})
    await videosCollection.delete_many({"projectId": ObjectId(projectId)})

    result = await collection.delete_one({"_id": ObjectId(projectId)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}

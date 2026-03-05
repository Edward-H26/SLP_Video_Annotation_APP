from pydantic import BaseModel


class VideoResponse(BaseModel):
    id: str
    projectId: str
    filename: str
    originalFilename: str
    duration: float
    status: str
    createdAt: str

from pydantic import BaseModel
from typing import Optional


class AnnotationCreate(BaseModel):
    videoId: str
    timestamp: float
    endTimestamp: Optional[float] = None
    type: str
    content: str = ""
    tags: list[str] = []
    color: str = ""


class AnnotationUpdate(BaseModel):
    content: Optional[str] = None
    tags: Optional[list[str]] = None
    color: Optional[str] = None
    type: Optional[str] = None
    timestamp: Optional[float] = None
    endTimestamp: Optional[float] = None

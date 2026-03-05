from pydantic import BaseModel


class TranscriptSegment(BaseModel):
    id: str
    text: str
    start: float
    end: float
    speaker: str = ""


class TranscriptUpdate(BaseModel):
    segments: list[TranscriptSegment]


class SpeakerUpdate(BaseModel):
    segmentId: str
    speaker: str

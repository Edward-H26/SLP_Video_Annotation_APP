import json
import os
from config.settings import openaiConfig
from uuid import uuid4
from services.video_processing import splitAudioIntoChunks, cleanupChunks

TRANSCRIPTION_MODEL = os.getenv("TRANSCRIPTION_MODEL", "gpt-4o-transcribe-diarize")


def parseTranscriptionResponse(transcription, timeOffset: float = 0) -> list[dict]:
    segments = []

    if isinstance(transcription, str):
        try:
            data = json.loads(transcription)
        except json.JSONDecodeError:
            if transcription.strip():
                segments.append({
                    "id": str(uuid4()),
                    "text": transcription.strip(),
                    "start": timeOffset,
                    "end": timeOffset,
                    "speaker": ""
                })
            return segments

        rawSegments = data.get("segments", [])
        if not rawSegments and data.get("text"):
            segments.append({
                "id": str(uuid4()),
                "text": data["text"].strip(),
                "start": timeOffset,
                "end": timeOffset,
                "speaker": ""
            })
            return segments

        for seg in rawSegments:
            segments.append({
                "id": str(uuid4()),
                "text": seg.get("text", "").strip(),
                "start": round(seg.get("start", 0) + timeOffset, 2),
                "end": round(seg.get("end", 0) + timeOffset, 2),
                "speaker": seg.get("speaker", "")
            })
        return segments

    if hasattr(transcription, "segments") and transcription.segments:
        for seg in transcription.segments:
            text = getattr(seg, "text", "").strip() if hasattr(seg, "text") else seg.get("text", "").strip()
            start = getattr(seg, "start", 0) if hasattr(seg, "start") else seg.get("start", 0)
            end = getattr(seg, "end", 0) if hasattr(seg, "end") else seg.get("end", 0)
            speaker = getattr(seg, "speaker", "") if hasattr(seg, "speaker") else seg.get("speaker", "")
            segments.append({
                "id": str(uuid4()),
                "text": text,
                "start": round(start + timeOffset, 2),
                "end": round(end + timeOffset, 2),
                "speaker": speaker
            })
        return segments

    if hasattr(transcription, "text") and transcription.text:
        segments.append({
            "id": str(uuid4()),
            "text": transcription.text.strip(),
            "start": timeOffset,
            "end": timeOffset,
            "speaker": ""
        })

    return segments


async def transcribeSingleFile(client, audioPath: str, timeOffset: float = 0) -> list[dict]:
    with open(audioPath, "rb") as audioFile:
        kwargs = {
            "model": TRANSCRIPTION_MODEL,
            "file": audioFile,
        }

        if TRANSCRIPTION_MODEL == "whisper-1":
            kwargs["response_format"] = "verbose_json"
        elif TRANSCRIPTION_MODEL == "gpt-4o-transcribe-diarize":
            kwargs["response_format"] = "diarized_json"
            kwargs["chunking_strategy"] = "auto"
        else:
            kwargs["response_format"] = "json"

        transcription = await client.audio.transcriptions.create(**kwargs)

    return parseTranscriptionResponse(transcription, timeOffset)


async def transcribeAudio(audioPath: str) -> list[dict]:
    client = openaiConfig.get_client()
    chunkPaths = await splitAudioIntoChunks(audioPath)
    allSegments = []
    chunkDuration = 600

    for i, chunkPath in enumerate(chunkPaths):
        timeOffset = i * chunkDuration if len(chunkPaths) > 1 else 0
        segments = await transcribeSingleFile(client, chunkPath, timeOffset)
        allSegments.extend(segments)

    if len(chunkPaths) > 1:
        await cleanupChunks(chunkPaths, audioPath)

    return allSegments

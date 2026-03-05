import imageio_ffmpeg
import os

os.environ["IMAGEIO_FFMPEG_EXE"] = imageio_ffmpeg.get_ffmpeg_exe()

import moviepy.editor as mp
import math

MAX_CHUNK_SIZE_MB = 24
CHUNK_DURATION_SECONDS = 600


async def extractAudio(videoPath: str) -> str:
    video = mp.VideoFileClip(videoPath)
    basePath = os.path.splitext(videoPath)[0]
    audioPath = f"{basePath}.mp3"
    video.audio.write_audiofile(audioPath, bitrate="64k", verbose=False, logger=None)
    video.close()
    return audioPath


async def getVideoDuration(videoPath: str) -> float:
    video = mp.VideoFileClip(videoPath)
    duration = video.duration
    video.close()
    return duration


async def splitAudioIntoChunks(audioPath: str) -> list[str]:
    fileSizeMb = os.path.getsize(audioPath) / (1024 * 1024)

    if fileSizeMb <= MAX_CHUNK_SIZE_MB:
        return [audioPath]

    audio = mp.AudioFileClip(audioPath)
    totalDuration = audio.duration
    numChunks = math.ceil(totalDuration / CHUNK_DURATION_SECONDS)
    chunkPaths = []
    basePath = os.path.splitext(audioPath)[0]

    for i in range(numChunks):
        startTime = i * CHUNK_DURATION_SECONDS
        endTime = min((i + 1) * CHUNK_DURATION_SECONDS, totalDuration)
        chunk = audio.subclip(startTime, endTime)
        chunkPath = f"{basePath}_chunk_{i:03d}.mp3"
        chunk.write_audiofile(chunkPath, bitrate="64k", verbose=False, logger=None)
        chunkPaths.append(chunkPath)

    audio.close()
    return chunkPaths


async def cleanupChunks(chunkPaths: list[str], originalPath: str):
    for path in chunkPaths:
        if path != originalPath and os.path.exists(path):
            os.remove(path)

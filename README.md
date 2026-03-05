# Video Annotation Platform

A full-stack platform for uploading videos, generating timestamped transcriptions with speaker diarization via OpenAI, and adding rich annotations synced to the video timeline.

## Features

- **Video Upload**: Drag-and-drop or file picker (MP4, MOV, AVI, WebM)
- **Automatic Transcription**: OpenAI transcription models with timestamped segments and optional speaker diarization
- **Video-Transcript Sync**: Click transcript to seek video; active segment highlights during playback
- **Annotations**: Add notes, tags, bookmarks, and speaker labels at any timestamp
- **Timeline View**: Visual timeline showing transcript segments and annotation markers
- **Search**: Search through transcripts and annotations
- **Export**: Download annotated transcripts as JSON, SRT, TXT, or PDF
- **Project Management**: Organize videos into projects
- **Retry Transcription**: Re-trigger transcription on failed videos without re-uploading
- **Crash Recovery**: Automatically detects and marks videos stuck from server restarts

## Tech Stack

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router
**Backend**: FastAPI, Motor (async MongoDB), OpenAI AsyncOpenAI, MoviePy
**Database**: MongoDB
**Deployment**: Render (monorepo web service)

## Quick Start

See [SETUP.md](./SETUP.md) for detailed installation instructions.

```bash
# Backend
cd backend && pip install -r requirements.txt && uvicorn main:app --port 8321

# Frontend
cd frontend && npm install && npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/projects | Create project |
| GET | /api/projects | List projects |
| POST | /api/videos/upload/{projectId} | Upload video |
| GET | /api/videos/stream/{videoId} | Stream video |
| GET | /api/videos/{videoId} | Get video status |
| POST | /api/videos/{videoId}/retranscribe | Retry failed transcription |
| GET | /api/transcripts/{videoId} | Get transcript |
| POST | /api/annotations | Create annotation |
| GET | /api/export/{videoId}?format= | Export transcript |

## Architecture

```
Frontend (React + TypeScript + Vite + Tailwind)
  ↕ REST API
Backend (FastAPI + Motor + AsyncOpenAI)
  ↕ MongoDB (metadata, transcripts, annotations)
  ↕ OpenAI Transcription API (gpt-4o-transcribe-diarize)
  ↕ Filesystem (uploaded videos, ephemeral on Render)
```

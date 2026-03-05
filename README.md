# Video Annotation Platform

A full-stack platform for uploading videos, generating timestamped transcriptions via OpenAI Whisper, and adding rich annotations synced to the video timeline.

## Features

- **Video Upload**: Drag-and-drop or file picker (MP4, MOV, AVI, WebM)
- **Automatic Transcription**: OpenAI Whisper with timestamped segments
- **Video-Transcript Sync**: Click transcript to seek video; active segment highlights during playback
- **Annotations**: Add notes, tags, bookmarks, and speaker labels at any timestamp
- **Timeline View**: Visual timeline showing transcript segments and annotation markers
- **Search**: Search through transcripts and annotations
- **Export**: Download annotated transcripts as JSON, SRT, TXT, or PDF
- **Project Management**: Organize videos into projects

## Tech Stack

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router
**Backend**: FastAPI, Motor (async MongoDB), OpenAI Whisper, MoviePy
**Database**: MongoDB
**Containerization**: Docker, docker-compose

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
| GET | /api/transcripts/{videoId} | Get transcript |
| POST | /api/annotations | Create annotation |
| GET | /api/export/{videoId}?format= | Export transcript |

## Architecture

```
Frontend (React + TypeScript + Vite + Tailwind)
  ↕ REST API
Backend (FastAPI + Motor)
  ↕ MongoDB (metadata, transcripts, annotations)
  ↕ OpenAI Whisper API (transcription)
  ↕ Filesystem (uploaded videos)
```

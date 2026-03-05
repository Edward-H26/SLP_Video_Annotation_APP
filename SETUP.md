# Setup Guide

## Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB 7+ (local, Docker, or MongoDB Atlas)
- OpenAI API key (from platform.openai.com)
- ffmpeg (for audio extraction)

## Step-by-Step Local Setup

### 1. Install ffmpeg (macOS)

```bash
brew install ffmpeg
```

### 2. Start MongoDB

Option A: Homebrew (macOS)
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb/brew/mongodb-community@7.0
```

Option B: Docker
```bash
docker run -d -p 27017:27017 --name mongo mongo:7
```

Option C: MongoDB Atlas (cloud)
Use your Atlas connection string in the `MONGODB_URL` environment variable.

### 3. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env and set your OPENAI_API_KEY
nano .env

# Start the backend server
uvicorn main:app --host 0.0.0.0 --port 8321 --reload
```

The backend API will be available at `http://localhost:8321`.

### 4. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 5. Verify

1. Open `http://localhost:5173` in your browser
2. Create a new project
3. Upload a video file (MP4, MOV, AVI, or WebM)
4. Wait for transcription to complete
5. Interact with the transcript and add annotations

## Render Deployment

The platform deploys as a single monorepo web service on Render. The build step compiles the frontend and bundles it into the backend, which serves both the API and the static frontend assets.

A `render.yaml` blueprint is included in the repository for one-click deployment.

### Web Service (Monorepo)

1. Create a new Web Service on Render and connect your repository
2. Render will auto-detect `render.yaml` and configure the service, or set manually:
   - **Build command**: `cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt`
   - **Start command**: `cd backend && gunicorn main:app -w 1 -k uvicorn.workers.UvicornWorker --timeout 600 --bind 0.0.0.0:$PORT`
3. Set environment variables:
   - `MONGODB_URL`: Your MongoDB Atlas connection string
   - `OPENAI_API_KEY`: Your OpenAI API key from platform.openai.com
   - `UPLOAD_DIR`: `/tmp/data` (ephemeral storage; files are lost on redeploy)
   - `TRANSCRIPTION_MODEL`: `gpt-4o-transcribe-diarize` (default, includes speaker ID) or `whisper-1`
   - `PYTHON_VERSION`: `3.11.11`
   - `NODE_VERSION`: `20.11.0`

**Important notes:**
- The gunicorn timeout is set to 600 seconds to allow long transcription jobs to complete without the worker being killed.
- A single worker (`-w 1`) is used to conserve memory and ensure background transcription tasks are not lost if a worker is recycled.
- On startup, the backend automatically marks any videos stuck in `uploading`, `processing`, or `transcribing` status as `error`, so they can be retried instead of remaining stuck forever.
- Uploaded video files are stored in `/tmp/data` (ephemeral). Files are lost on every redeploy. For persistent storage, consider Render's persistent disk or an external service like S3.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URL | MongoDB connection string | mongodb://localhost:27017 |
| OPENAI_API_KEY | OpenAI API key | (required) |
| TRANSCRIPTION_MODEL | Transcription model | gpt-4o-transcribe-diarize |
| HOST | Backend host | 0.0.0.0 |
| PORT | Backend port | 8321 |
| DEBUG_MODE | Enable hot reload | true |
| UPLOAD_DIR | Directory for uploaded files | data |
| ALLOWED_ORIGINS | Comma-separated CORS origins | http://localhost:5173,http://localhost:3000 |

## Transcription Models

| Model | Quality | Speed | Timestamps | Speaker ID | Price |
|-------|---------|-------|------------|------------|-------|
| gpt-4o-transcribe | Best | Fast | Segment | No | $0.006/min |
| gpt-4o-mini-transcribe | Good | Fastest | Segment | No | $0.003/min |
| gpt-4o-transcribe-diarize | Best | Fast | Segment | Yes | $0.006/min |
| whisper-1 | Good | Fast | Segment + Word | No | $0.006/min |

Set via `TRANSCRIPTION_MODEL` environment variable.

## Large Video Support

The platform supports videos up to 8GB and 30+ minutes in length:
- Uploads use streaming (1MB chunks) to avoid memory issues
- Audio is extracted at 64kbps MP3 to keep file sizes small
- Audio files over 24MB are automatically split into 10-minute chunks
- Each chunk is transcribed separately and timestamps are adjusted
- Chunks are cleaned up after transcription
- All CPU-heavy moviepy operations run in a thread pool via `asyncio.to_thread()` to avoid blocking the event loop
- The OpenAI client uses `AsyncOpenAI` so transcription API calls are non-blocking

## Error Recovery

- **Crash recovery**: On startup, the backend marks any videos stuck in `uploading`, `processing`, or `transcribing` as `error`. This handles cases where a server restart or worker kill interrupted processing.
- **Frontend polling timeout**: The frontend polls video status every 2 seconds for up to 10 minutes. If transcription has not completed by then, it stops polling and shows an error.
- **Retry transcription**: Failed videos show a "Retry Transcription" button that re-triggers the processing pipeline without requiring a re-upload (as long as the video file still exists on disk).

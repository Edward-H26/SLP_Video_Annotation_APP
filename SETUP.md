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

### Backend (Web Service)

1. Create a new Web Service on Render
2. Connect your repository
3. Set root directory to `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `gunicorn main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
6. Set environment variables:
   - `MONGODB_URL`: Your MongoDB Atlas connection string
   - `OPENAI_API_KEY`: Your OpenAI API key from platform.openai.com
   - `OPENAI_API_BASE_URL`: Leave empty for standard OpenAI API, or set to your gateway URL
   - `UPLOAD_DIR`: `/tmp/data`
   - `TRANSCRIPTION_MODEL`: `gpt-4o-transcribe` (recommended) or `whisper-1`
   - `ALLOWED_ORIGINS`: Your frontend Render URL (e.g., `https://video-annotation-frontend.onrender.com`)
   - `PYTHON_VERSION`: `3.11.11`

### Frontend (Static Site)

1. Create a new Static Site on Render
2. Connect your repository
3. Set root directory to `frontend`
4. Build command: `npm install && npm run build`
5. Publish directory: `dist`
6. Add rewrite rule: `/* -> /index.html` (for client-side routing)
7. Before deploying, update `frontend/.env.production` with your backend URL:
   ```
   VITE_API_URL=https://your-backend-name.onrender.com
   ```

## Docker Compose (Alternative)

```bash
docker-compose up --build
```

This starts MongoDB, backend (port 8321), and frontend (port 3000).

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URL | MongoDB connection string | mongodb://localhost:27017 |
| OPENAI_API_KEY | OpenAI API key | (required) |
| OPENAI_API_BASE_URL | Custom OpenAI base URL | (empty, uses api.openai.com) |
| TRANSCRIPTION_MODEL | Transcription model | gpt-4o-transcribe |
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

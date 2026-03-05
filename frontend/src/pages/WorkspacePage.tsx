import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import AppLayout from "@/components/layout/AppLayout"
import Header from "@/components/layout/Header"
import VideoPlayer from "@/components/video/VideoPlayer"
import VideoUploader from "@/components/video/VideoUploader"
import TranscriptPanel from "@/components/transcript/TranscriptPanel"
import AnnotationPanel from "@/components/annotation/AnnotationPanel"
import TimelineView from "@/components/timeline/TimelineView"
import SearchBar from "@/components/search/SearchBar"
import ExportModal from "@/components/export/ExportModal"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import Button from "@/components/ui/Button"
import { VideoPlayerProvider, useVideoPlayer } from "@/contexts/VideoPlayerContext"
import { fetchProject } from "@/api/project-api"
import { uploadVideo, fetchVideo, fetchProjectVideos, getVideoStreamUrl } from "@/api/video-api"
import { fetchTranscript } from "@/api/transcript-api"
import { fetchAnnotations } from "@/api/annotation-api"
import type { Project, Video, Annotation } from "@/types"

function WorkspaceContent() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { setSegments } = useVideoPlayer()
  const [project, setProject] = useState<Project | null>(null)
  const [video, setVideo] = useState<Video | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"transcript" | "annotations">("transcript")
  const [isExportOpen, setIsExportOpen] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!projectId) return
    const load = async () => {
      const proj = await fetchProject(projectId)
      setProject(proj)
      const videos = await fetchProjectVideos(projectId)
      if (videos.length > 0) {
        setVideo(videos[0])
        if (videos[0].status === "ready") {
          await loadTranscriptAndAnnotations(videos[0].id)
        }
      }
    }
    load()
  }, [projectId])

  useEffect(() => {
    if (!video) return
    if (video.status === "ready" || video.status === "error") return

    pollingRef.current = setInterval(async () => {
      const updated = await fetchVideo(video.id)
      setVideo(updated)
      if (updated.status === "ready") {
        if (pollingRef.current) clearInterval(pollingRef.current)
        await loadTranscriptAndAnnotations(updated.id)
      }
      if (updated.status === "error") {
        if (pollingRef.current) clearInterval(pollingRef.current)
      }
    }, 2000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [video?.id, video?.status])

  const loadTranscriptAndAnnotations = async (videoId: string) => {
    setIsTranscriptLoading(true)
    const [transcript, annots] = await Promise.all([
      fetchTranscript(videoId),
      fetchAnnotations(videoId),
    ])
    setSegments(transcript.segments)
    setAnnotations(annots)
    setIsTranscriptLoading(false)
  }

  const handleUpload = async (file: File) => {
    if (!projectId) return
    setIsUploading(true)
    const uploaded = await uploadVideo(projectId, file)
    setVideo(uploaded)
    setIsUploading(false)
  }

  const isProcessing = video && !["ready", "error"].includes(video.status)

  return (
    <AppLayout>
      <Header
        title={project?.title || "Loading..."}
        showBack
        onExport={video?.status === "ready" ? () => setIsExportOpen(true) : undefined}
      />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-[3] flex flex-col border-r border-gray-200">
          <div className="flex-1 p-4">
            {!video ? (
              <VideoUploader onUpload={handleUpload} isUploading={isUploading} />
            ) : isProcessing ? (
              <div className="flex flex-col items-center justify-center h-full">
                <LoadingSpinner size="lg" />
                <p className="text-gray-500 mt-4 capitalize">{video.status}...</p>
                <p className="text-gray-400 text-sm mt-1">This may take a few minutes</p>
              </div>
            ) : video.status === "error" ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="font-medium text-red-500">Processing failed</p>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  Something went wrong while processing your video.
                </p>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => {
                    setVideo(null)
                    setAnnotations([])
                  }}>
                    Upload a Different Video
                  </Button>
                  <Button onClick={() => navigate("/")}>
                    Back to Projects
                  </Button>
                </div>
              </div>
            ) : (
              <VideoPlayer videoUrl={getVideoStreamUrl(video.id)} videoDuration={video.duration} />
            )}
          </div>
          {video?.status === "ready" && <TimelineView annotations={annotations} />}
        </div>

        <div className="flex-[2] flex flex-col">
          {video?.status === "ready" && (
            <>
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("transcript")}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === "transcript"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Transcript
                </button>
                <button
                  onClick={() => setActiveTab("annotations")}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === "annotations"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Annotations ({annotations.length})
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {activeTab === "transcript" ? (
                  <TranscriptPanel videoId={video.id} isLoading={isTranscriptLoading} />
                ) : (
                  <AnnotationPanel
                    videoId={video.id}
                    annotations={annotations}
                    setAnnotations={setAnnotations}
                  />
                )}
              </div>
              <SearchBar videoId={video.id} />
            </>
          )}
        </div>
      </div>
      {video && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          videoId={video.id}
        />
      )}
    </AppLayout>
  )
}

export default function WorkspacePage() {
  return (
    <VideoPlayerProvider>
      <WorkspaceContent />
    </VideoPlayerProvider>
  )
}

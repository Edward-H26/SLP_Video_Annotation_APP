import { useEffect } from "react"
import { useVideoPlayer } from "@/contexts/VideoPlayerContext"
import { Play, Pause } from "lucide-react"

type VideoPlayerProps = {
  videoUrl: string
  videoDuration?: number
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export default function VideoPlayer({ videoUrl, videoDuration }: VideoPlayerProps) {
  const {
    videoRef,
    currentTime,
    duration,
    isPlaying,
    togglePlay,
    seekTo,
    setCurrentTime,
    setIsPlaying,
    setVideoDuration,
  } = useVideoPlayer()

  useEffect(() => {
    if (videoDuration && videoDuration > 0 && duration === 0) {
      setVideoDuration(videoDuration)
    }
  }, [videoDuration, duration, setVideoDuration])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onLoadedMetadata = () => {
      if (video.duration && isFinite(video.duration)) {
        setVideoDuration(video.duration)
      }
    }
    const onDurationChange = () => {
      if (video.duration && isFinite(video.duration)) {
        setVideoDuration(video.duration)
      }
    }

    video.addEventListener("timeupdate", onTimeUpdate)
    video.addEventListener("play", onPlay)
    video.addEventListener("pause", onPause)
    video.addEventListener("loadedmetadata", onLoadedMetadata)
    video.addEventListener("durationchange", onDurationChange)

    if (video.readyState >= 1 && video.duration && isFinite(video.duration)) {
      setVideoDuration(video.duration)
    }

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate)
      video.removeEventListener("play", onPlay)
      video.removeEventListener("pause", onPause)
      video.removeEventListener("loadedmetadata", onLoadedMetadata)
      video.removeEventListener("durationchange", onDurationChange)
    }
  }, [videoUrl, videoRef, setCurrentTime, setIsPlaying, setVideoDuration])

  const displayDuration = duration > 0 ? duration : (videoDuration || 0)
  const progressPercent = displayDuration > 0 ? (currentTime / displayDuration) * 100 : 0

  return (
    <div className="flex flex-col bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video"
        preload="metadata"
        onClick={togglePlay}
      />
      <div className="bg-gray-900 px-4 py-2">
        <div
          className="w-full h-2 bg-gray-700 rounded-full cursor-pointer mb-2 relative"
          onClick={(e) => {
            if (displayDuration <= 0) return
            const rect = e.currentTarget.getBoundingClientRect()
            const percent = (e.clientX - rect.left) / rect.width
            seekTo(percent * displayDuration)
          }}
        >
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="text-white hover:text-blue-400 transition-colors p-1"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <span className="text-gray-400 text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(displayDuration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

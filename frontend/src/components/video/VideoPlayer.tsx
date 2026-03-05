import { useVideoPlayer } from "@/contexts/VideoPlayerContext"
import { Play, Pause } from "lucide-react"

type VideoPlayerProps = {
  videoUrl: string
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const { videoRef, currentTime, duration, isPlaying, togglePlay, seekTo } = useVideoPlayer()

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex flex-col bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video"
      />
      <div className="bg-gray-900 px-4 py-2">
        <div
          className="w-full h-1.5 bg-gray-700 rounded-full cursor-pointer mb-2"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const percent = (e.clientX - rect.left) / rect.width
            seekTo(percent * duration)
          }}
        >
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <span className="text-gray-400 text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

import { createContext, useContext, useRef, useState, useCallback, useEffect, type ReactNode } from "react"
import type { TranscriptSegment } from "@/types"

type VideoPlayerContextType = {
  videoRef: React.RefObject<HTMLVideoElement>
  currentTime: number
  duration: number
  isPlaying: boolean
  activeSegmentId: string | null
  segments: TranscriptSegment[]
  setSegments: (segments: TranscriptSegment[]) => void
  seekTo: (time: number) => void
  togglePlay: () => void
  setCurrentTime: (t: number) => void
  setIsPlaying: (p: boolean) => void
  setVideoDuration: (d: number) => void
}

const VideoPlayerContext = createContext<VideoPlayerContextType | null>(null)

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null!)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null)
  const [segments, setSegments] = useState<TranscriptSegment[]>([])

  const seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }, [])

  const setVideoDuration = useCallback((d: number) => {
    if (d && isFinite(d) && d > 0) setDuration(d)
  }, [])

  useEffect(() => {
    if (segments.length === 0) {
      setActiveSegmentId(null)
      return
    }

    let low = 0
    let high = segments.length - 1
    let found: string | null = null

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const seg = segments[mid]
      if (currentTime >= seg.start && currentTime < seg.end) {
        found = seg.id
        break
      } else if (currentTime < seg.start) {
        high = mid - 1
      } else {
        low = mid + 1
      }
    }

    setActiveSegmentId(found)
  }, [currentTime, segments])

  return (
    <VideoPlayerContext.Provider
      value={{
        videoRef,
        currentTime,
        duration,
        isPlaying,
        activeSegmentId,
        segments,
        setSegments,
        seekTo,
        togglePlay,
        setCurrentTime,
        setIsPlaying,
        setVideoDuration,
      }}
    >
      {children}
    </VideoPlayerContext.Provider>
  )
}

export function useVideoPlayer() {
  const context = useContext(VideoPlayerContext)
  if (!context) {
    throw new Error("useVideoPlayer must be used within VideoPlayerProvider")
  }
  return context
}

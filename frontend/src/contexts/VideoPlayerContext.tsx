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
  play: () => void
  pause: () => void
  togglePlay: () => void
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

  const play = useCallback(() => {
    videoRef.current?.play()
  }, [])

  const pause = useCallback(() => {
    videoRef.current?.pause()
  }, [])

  const togglePlay = useCallback(() => {
    if (videoRef.current?.paused) {
      videoRef.current.play()
    } else {
      videoRef.current?.pause()
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }
    const handleDurationChange = () => {
      setDuration(video.duration)
    }
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("durationchange", handleDurationChange)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("durationchange", handleDurationChange)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
    }
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
        play,
        pause,
        togglePlay,
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

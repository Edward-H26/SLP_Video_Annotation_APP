import { useVideoPlayer } from "@/contexts/VideoPlayerContext"
import { useCallback } from "react"

export function useVideoSync() {
  const { activeSegmentId, seekTo, segments } = useVideoPlayer()

  const seekToSegment = useCallback(
    (segmentId: string) => {
      const segment = segments.find((s) => s.id === segmentId)
      if (segment) {
        seekTo(segment.start)
      }
    },
    [segments, seekTo]
  )

  const isSegmentActive = useCallback(
    (segmentId: string) => activeSegmentId === segmentId,
    [activeSegmentId]
  )

  return { activeSegmentId, seekToSegment, isSegmentActive }
}

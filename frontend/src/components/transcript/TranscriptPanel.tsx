import { useState } from "react"
import { useVideoPlayer } from "@/contexts/VideoPlayerContext"
import TranscriptSegment from "./TranscriptSegment"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

type TranscriptPanelProps = {
  videoId: string
  isLoading: boolean
}

export default function TranscriptPanel({ videoId, isLoading }: TranscriptPanelProps) {
  const { segments } = useVideoPlayer()
  const [autoScroll, setAutoScroll] = useState(true)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <LoadingSpinner />
        <p className="text-gray-500 mt-3 text-sm">Generating transcript...</p>
      </div>
    )
  }

  if (segments.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No transcript available
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Transcript ({segments.length} segments)
        </span>
        <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="rounded border-gray-300"
          />
          Auto-scroll
        </label>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {segments.map((segment) => (
          <TranscriptSegment
            key={segment.id}
            segment={segment}
            videoId={videoId}
            shouldScrollIntoView={autoScroll}
          />
        ))}
      </div>
    </div>
  )
}

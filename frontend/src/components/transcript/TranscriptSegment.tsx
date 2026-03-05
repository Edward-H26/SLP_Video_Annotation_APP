import { useRef, useEffect } from "react"
import { useVideoSync } from "@/hooks/use-video-sync"
import SpeakerLabel from "@/components/annotation/SpeakerLabel"
import { clsx } from "clsx"

type TranscriptSegmentProps = {
  segment: {
    id: string
    text: string
    start: number
    end: number
    speaker: string
  }
  videoId: string
  shouldScrollIntoView: boolean
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export default function TranscriptSegment({ segment, videoId, shouldScrollIntoView }: TranscriptSegmentProps) {
  const { seekToSegment, isSegmentActive } = useVideoSync()
  const ref = useRef<HTMLDivElement>(null)
  const isActive = isSegmentActive(segment.id)

  useEffect(() => {
    if (isActive && shouldScrollIntoView && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [isActive, shouldScrollIntoView])

  return (
    <div
      ref={ref}
      className={clsx(
        "flex gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
        isActive ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
      )}
      onClick={() => seekToSegment(segment.id)}
    >
      <span className="text-xs text-gray-400 font-mono mt-0.5 shrink-0 w-12">
        {formatTime(segment.start)}
      </span>
      <div className="flex-1 min-w-0">
        <SpeakerLabel
          videoId={videoId}
          segmentId={segment.id}
          speaker={segment.speaker}
        />
        <p className="text-sm text-gray-700">{segment.text}</p>
      </div>
    </div>
  )
}

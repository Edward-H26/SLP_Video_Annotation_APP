import { useVideoPlayer } from "@/contexts/VideoPlayerContext"
import TimelineMarker from "./TimelineMarker"
import type { Annotation } from "@/types"

type TimelineViewProps = {
  annotations: Annotation[]
}

export default function TimelineView({ annotations }: TimelineViewProps) {
  const { currentTime, duration, segments, seekTo } = useVideoPlayer()
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3">
      <div
        className="relative h-8 bg-gray-100 rounded cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const percent = (e.clientX - rect.left) / rect.width
          seekTo(percent * duration)
        }}
      >
        {segments.map((segment) => {
          const left = duration > 0 ? (segment.start / duration) * 100 : 0
          const width = duration > 0 ? ((segment.end - segment.start) / duration) * 100 : 0
          return (
            <div
              key={segment.id}
              className="absolute top-1 h-2 bg-blue-200 rounded-sm"
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          )
        })}

        <div className="absolute top-4">
          {annotations.map((annotation) => {
            const position = duration > 0 ? (annotation.timestamp / duration) * 100 : 0
            return (
              <TimelineMarker
                key={annotation.id}
                position={position}
                type={annotation.type}
                color={annotation.color}
                onClick={() => seekTo(annotation.timestamp)}
              />
            )
          })}
        </div>

        <div
          className="absolute top-0 w-0.5 h-full bg-red-500 z-20"
          style={{ left: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}

import { clsx } from "clsx"

type TimelineMarkerProps = {
  position: number
  type: string
  color?: string
  onClick: () => void
}

const typeColors: Record<string, string> = {
  note: "bg-blue-500",
  tag: "bg-green-500",
  bookmark: "bg-yellow-500",
  speaker: "bg-purple-500",
}

export default function TimelineMarker({ position, type, color, onClick }: TimelineMarkerProps) {
  return (
    <button
      className={clsx(
        "absolute top-0 w-2 h-2 rounded-full -translate-x-1/2 hover:scale-150 transition-transform z-10",
        !color && typeColors[type]
      )}
      style={{
        left: `${position}%`,
        ...(color ? { backgroundColor: color } : {}),
      }}
      onClick={onClick}
    />
  )
}

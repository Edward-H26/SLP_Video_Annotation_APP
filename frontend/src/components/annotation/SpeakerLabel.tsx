import { useState } from "react"
import { User } from "lucide-react"
import { updateSpeaker } from "@/api/transcript-api"

type SpeakerLabelProps = {
  videoId: string
  segmentId: string
  speaker: string
}

export default function SpeakerLabel({ videoId, segmentId, speaker }: SpeakerLabelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(speaker)

  const handleSave = async () => {
    setIsEditing(false)
    if (value !== speaker) {
      await updateSpeaker(videoId, segmentId, value)
    }
  }

  if (isEditing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave()
          if (e.key === "Escape") {
            setValue(speaker)
            setIsEditing(false)
          }
        }}
        className="text-xs font-medium text-blue-600 bg-blue-50 rounded px-1.5 py-0.5 border border-blue-200 outline-none w-24"
        placeholder="Speaker"
      />
    )
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        setIsEditing(true)
      }}
      className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors mb-0.5"
    >
      <User size={10} />
      {speaker || "Add speaker"}
    </button>
  )
}

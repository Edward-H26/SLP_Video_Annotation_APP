import { useState, useMemo } from "react"
import { MessageSquare, Tag, Bookmark, User } from "lucide-react"
import { useVideoPlayer } from "@/contexts/VideoPlayerContext"
import { createAnnotation } from "@/api/annotation-api"
import { ANNOTATION_TYPES, ANNOTATION_COLORS } from "@/constants"
import TagSelector from "./TagSelector"
import Button from "@/components/ui/Button"
import type { Annotation } from "@/types"

type AnnotationFormProps = {
  videoId: string
  onCreated: (annotation: Annotation) => void
}

const iconMap = {
  MessageSquare,
  Tag,
  Bookmark,
  User,
} as Record<string, typeof MessageSquare>

export default function AnnotationForm({ videoId, onCreated }: AnnotationFormProps) {
  const { currentTime } = useVideoPlayer()
  const [type, setType] = useState("note")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [color, setColor] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeType = useMemo(
    () => ANNOTATION_TYPES.find((t) => t.value === type) || ANNOTATION_TYPES[0],
    [type]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const annotation = await createAnnotation({
      videoId,
      timestamp: currentTime,
      type,
      content,
      tags,
      color,
    })

    onCreated(annotation)
    setContent("")
    setTags([])
    setColor("")
    setIsSubmitting(false)
  }

  const formatTimestamp = () => {
    const mins = Math.floor(currentTime / 60).toString().padStart(2, "0")
    const secs = Math.floor(currentTime % 60).toString().padStart(2, "0")
    const tenths = Math.floor((currentTime % 1) * 10)
    return `${mins}:${secs}.${tenths}`
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 border-b border-gray-200 space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-mono">@{formatTimestamp()}</span>
        <div className="flex gap-1">
          {ANNOTATION_TYPES.map((t) => {
            const Icon = iconMap[t.icon]
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                  type === t.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title={t.description}
              >
                <Icon size={12} />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-gray-400 italic">{activeType.description}</p>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={activeType.placeholder}
        rows={2}
        className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none resize-none"
      />

      {(type === "tag" || type === "note") && (
        <TagSelector tags={tags} onChange={setTags} />
      )}

      {type === "bookmark" && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Color:</span>
          {ANNOTATION_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                color === c ? "border-gray-800 scale-125" : "border-gray-200 hover:scale-110"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}

      <Button type="submit" size="sm" disabled={isSubmitting || (!content && tags.length === 0)}>
        {isSubmitting ? "Adding..." : "Add Annotation"}
      </Button>
    </form>
  )
}

import { useState } from "react"
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

export default function AnnotationForm({ videoId, onCreated }: AnnotationFormProps) {
  const { currentTime } = useVideoPlayer()
  const [type, setType] = useState("note")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [color, setColor] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  return (
    <form onSubmit={handleSubmit} className="p-3 border-b border-gray-200 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-mono">
          @{Math.floor(currentTime / 60).toString().padStart(2, "0")}:
          {Math.floor(currentTime % 60).toString().padStart(2, "0")}.
          {Math.floor((currentTime % 1) * 10)}
        </span>
        <div className="flex gap-1">
          {ANNOTATION_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                type === t.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a note..."
        rows={2}
        className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none resize-none"
      />

      {(type === "tag" || type === "note") && (
        <TagSelector tags={tags} onChange={setTags} />
      )}

      {type === "bookmark" && (
        <div className="flex gap-2">
          {ANNOTATION_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                color === c ? "border-gray-800 scale-110" : "border-transparent"
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

import { useState } from "react"
import { Trash2, Edit2, Bookmark, MessageSquare, Tag, User } from "lucide-react"
import { useVideoPlayer } from "@/contexts/VideoPlayerContext"
import { updateAnnotation, deleteAnnotation } from "@/api/annotation-api"
import Badge from "@/components/ui/Badge"
import type { Annotation } from "@/types"

type AnnotationItemProps = {
  annotation: Annotation
  onUpdated: (annotation: Annotation) => void
  onDeleted: (id: string) => void
}

const typeIcons = {
  note: MessageSquare,
  tag: Tag,
  bookmark: Bookmark,
  speaker: User,
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export default function AnnotationItem({ annotation, onUpdated, onDeleted }: AnnotationItemProps) {
  const { seekTo } = useVideoPlayer()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(annotation.content)

  const Icon = typeIcons[annotation.type] || MessageSquare

  const handleSave = async () => {
    const updated = await updateAnnotation(annotation.id, { content: editContent })
    onUpdated(updated)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    await deleteAnnotation(annotation.id)
    onDeleted(annotation.id)
  }

  return (
    <div
      className="group flex gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
      style={annotation.color ? { borderLeft: `3px solid ${annotation.color}` } : undefined}
    >
      <button
        onClick={() => seekTo(annotation.timestamp)}
        className="text-xs text-blue-600 hover:text-blue-800 font-mono mt-0.5 shrink-0"
      >
        {formatTime(annotation.timestamp)}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Icon size={12} className="text-gray-400" />
          <span className="text-xs text-gray-400 capitalize">{annotation.type}</span>
        </div>
        {isEditing ? (
          <div className="space-y-1.5">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none resize-none"
              rows={2}
            />
            <div className="flex gap-1">
              <button
                onClick={handleSave}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditContent(annotation.content)
                  setIsEditing(false)
                }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700">{annotation.content}</p>
        )}
        {annotation.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {annotation.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="text-gray-400 hover:text-blue-600"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-600"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

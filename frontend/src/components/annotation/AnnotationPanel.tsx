import AnnotationForm from "./AnnotationForm"
import AnnotationItem from "./AnnotationItem"
import type { Annotation } from "@/types"

type AnnotationPanelProps = {
  videoId: string
  annotations: Annotation[]
  setAnnotations: React.Dispatch<React.SetStateAction<Annotation[]>>
}

export default function AnnotationPanel({ videoId, annotations, setAnnotations }: AnnotationPanelProps) {
  const handleCreated = (annotation: Annotation) => {
    setAnnotations((prev) => [...prev, annotation].sort((a, b) => a.timestamp - b.timestamp))
  }

  const handleUpdated = (updated: Annotation) => {
    setAnnotations((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
  }

  const handleDeleted = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="flex flex-col h-full">
      <AnnotationForm videoId={videoId} onCreated={handleCreated} />
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {annotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-6">
            <p className="text-gray-400 text-sm mb-2">No annotations yet</p>
            <p className="text-gray-300 text-xs leading-relaxed">
              Pause the video at any moment and use the form above to add observations,
              categorize with tags, bookmark key moments, or label speakers.
            </p>
          </div>
        ) : (
          annotations.map((annotation) => (
            <AnnotationItem
              key={annotation.id}
              annotation={annotation}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))
        )}
      </div>
    </div>
  )
}

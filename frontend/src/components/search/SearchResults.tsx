import type { TranscriptSegment, Annotation } from "@/types"

type SearchResultsProps = {
  transcriptResults: TranscriptSegment[]
  annotationResults: Annotation[]
  onSeek: (time: number) => void
  onClose: () => void
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export default function SearchResults({ transcriptResults, annotationResults, onSeek, onClose }: SearchResultsProps) {
  if (transcriptResults.length === 0 && annotationResults.length === 0) {
    return (
      <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <p className="text-gray-400 text-sm text-center">No results found</p>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs">
          Close
        </button>
      </div>
    )
  }

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-100 px-3 py-2 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {transcriptResults.length + annotationResults.length} results
        </span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs">
          Close
        </button>
      </div>
      {transcriptResults.length > 0 && (
        <div className="p-2">
          <p className="text-xs text-gray-400 px-2 mb-1 uppercase tracking-wide">Transcript</p>
          {transcriptResults.map((seg) => (
            <button
              key={seg.id}
              onClick={() => onSeek(seg.start)}
              className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 flex gap-2"
            >
              <span className="text-xs text-blue-600 font-mono shrink-0">{formatTime(seg.start)}</span>
              <span className="text-sm text-gray-700 truncate">{seg.text}</span>
            </button>
          ))}
        </div>
      )}
      {annotationResults.length > 0 && (
        <div className="p-2 border-t border-gray-100">
          <p className="text-xs text-gray-400 px-2 mb-1 uppercase tracking-wide">Annotations</p>
          {annotationResults.map((ann) => (
            <button
              key={ann.id}
              onClick={() => onSeek(ann.timestamp)}
              className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 flex gap-2"
            >
              <span className="text-xs text-blue-600 font-mono shrink-0">{formatTime(ann.timestamp)}</span>
              <span className="text-sm text-gray-700 truncate">{ann.content}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

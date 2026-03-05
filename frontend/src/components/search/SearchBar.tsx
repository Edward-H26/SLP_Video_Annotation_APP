import { useState, useCallback, useEffect } from "react"
import { Search } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { useVideoPlayer } from "@/contexts/VideoPlayerContext"
import { searchTranscript } from "@/api/transcript-api"
import { searchAnnotations } from "@/api/annotation-api"
import SearchResults from "./SearchResults"
import type { TranscriptSegment, Annotation } from "@/types"

type SearchBarProps = {
  videoId: string
}

export default function SearchBar({ videoId }: SearchBarProps) {
  const { seekTo } = useVideoPlayer()
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [transcriptResults, setTranscriptResults] = useState<TranscriptSegment[]>([])
  const [annotationResults, setAnnotationResults] = useState<Annotation[]>([])
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (!debouncedQuery) {
      setTranscriptResults([])
      setAnnotationResults([])
      setIsOpen(false)
      return
    }

    const performSearch = async () => {
      const [tResults, aResults] = await Promise.all([
        searchTranscript(videoId, debouncedQuery),
        searchAnnotations(videoId, debouncedQuery, ""),
      ])
      setTranscriptResults(tResults)
      setAnnotationResults(aResults)
      setIsOpen(true)
    }

    performSearch()
  }, [debouncedQuery, videoId])

  const handleSeek = useCallback(
    (time: number) => {
      seekTo(time)
      setIsOpen(false)
      setQuery("")
    },
    [seekTo]
  )

  return (
    <div className="relative border-t border-gray-200 p-3">
      {isOpen && (
        <SearchResults
          transcriptResults={transcriptResults}
          annotationResults={annotationResults}
          onSeek={handleSeek}
          onClose={() => setIsOpen(false)}
        />
      )}
      <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 focus-within:border-blue-500">
        <Search size={16} className="text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search transcript and annotations..."
          className="flex-1 text-sm outline-none bg-transparent"
        />
      </div>
    </div>
  )
}

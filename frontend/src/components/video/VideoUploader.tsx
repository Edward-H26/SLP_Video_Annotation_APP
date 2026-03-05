import { useState, useCallback, useRef } from "react"
import { Upload, Film } from "lucide-react"
import { ACCEPTED_VIDEO_TYPES, MAX_FILE_SIZE } from "@/constants"
import Button from "@/components/ui/Button"

type VideoUploaderProps = {
  onUpload: (file: File) => void
  isUploading: boolean
}

export default function VideoUploader({ onUpload, isUploading }: VideoUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null!)

  const validateFile = useCallback((file: File): boolean => {
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      setError("Unsupported file type. Please upload MP4, MOV, AVI, or WebM.")
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 500MB.")
      return false
    }
    setError("")
    return true
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file && validateFile(file)) {
        onUpload(file)
      }
    },
    [onUpload, validateFile]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && validateFile(file)) {
        onUpload(file)
      }
    },
    [onUpload, validateFile]
  )

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
        isDragOver
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 bg-gray-50 hover:border-gray-400"
      }`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <Film size={48} className="text-gray-400 mb-4" />
      <p className="text-gray-600 mb-2 text-center">
        Drag and drop a video file here, or click to browse
      </p>
      <p className="text-gray-400 text-sm mb-4">
        Supports MP4, MOV, AVI, WebM (max 500MB)
      </p>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_VIDEO_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        <Upload size={16} className="mr-1.5" />
        {isUploading ? "Uploading..." : "Select Video"}
      </Button>
    </div>
  )
}

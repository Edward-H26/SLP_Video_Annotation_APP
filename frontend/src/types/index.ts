export type Project = {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
}

export type Video = {
  id: string
  projectId: string
  filename: string
  originalFilename: string
  duration: number
  status: "uploading" | "processing" | "transcribing" | "ready" | "error"
  createdAt: string
}

export type TranscriptSegment = {
  id: string
  text: string
  start: number
  end: number
  speaker: string
}

export type Transcript = {
  id: string
  videoId: string
  segments: TranscriptSegment[]
  createdAt: string
  updatedAt: string
}

export type Annotation = {
  id: string
  videoId: string
  timestamp: number
  endTimestamp: number | null
  type: "note" | "tag" | "bookmark" | "speaker"
  content: string
  tags: string[]
  color: string
  createdAt: string
}

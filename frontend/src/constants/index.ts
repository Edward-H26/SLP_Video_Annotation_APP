export const API_BASE_URL = import.meta.env.VITE_API_URL || ""
export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"]
export const MAX_FILE_SIZE = 500 * 1024 * 1024
export const ANNOTATION_COLORS = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"]
export const ANNOTATION_TYPES = [
  { value: "note", label: "Note" },
  { value: "tag", label: "Tag" },
  { value: "bookmark", label: "Bookmark" },
  { value: "speaker", label: "Speaker" },
] as const

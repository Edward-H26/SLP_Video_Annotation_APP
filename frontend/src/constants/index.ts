export const API_BASE_URL = import.meta.env.VITE_API_URL || ""
export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"]
export const MAX_FILE_SIZE = 500 * 1024 * 1024
export const ANNOTATION_COLORS = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"]
export const ANNOTATION_TYPES = [
  {
    value: "note",
    label: "Note",
    icon: "MessageSquare",
    placeholder: "What do you observe at this moment?",
    description: "Add a text observation at this timestamp",
  },
  {
    value: "tag",
    label: "Tag",
    icon: "Tag",
    placeholder: "Label this moment (e.g., question, redirect)",
    description: "Categorize this moment with searchable labels",
  },
  {
    value: "bookmark",
    label: "Bookmark",
    icon: "Bookmark",
    placeholder: "Why is this moment important?",
    description: "Mark a key moment with a color for quick navigation",
  },
  {
    value: "speaker",
    label: "Speaker",
    icon: "User",
    placeholder: "Who is speaking? (e.g., Teacher, Student A)",
    description: "Identify or relabel who is speaking here",
  },
] as const

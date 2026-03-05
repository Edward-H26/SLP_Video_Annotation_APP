import { API_BASE_URL } from "@/constants"
import type { Video } from "@/types"

export async function uploadVideo(projectId: string, file: File): Promise<Video> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE_URL}/api/videos/upload/${projectId}`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || "Upload failed")
  }

  return response.json()
}

export async function fetchVideo(videoId: string): Promise<Video> {
  const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}`)
  if (!response.ok) throw new Error("Failed to fetch video")
  return response.json()
}

export function getVideoStreamUrl(videoId: string): string {
  return `${API_BASE_URL}/api/videos/stream/${videoId}`
}

export async function fetchProjectVideos(projectId: string): Promise<Video[]> {
  const response = await fetch(`${API_BASE_URL}/api/videos/project/${projectId}`)
  if (!response.ok) throw new Error("Failed to fetch videos")
  return response.json()
}

export async function deleteVideo(videoId: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}`, { method: "DELETE" })
  if (!response.ok) throw new Error("Failed to delete video")
  return response.json()
}

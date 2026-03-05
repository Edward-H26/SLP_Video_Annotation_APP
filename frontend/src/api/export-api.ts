import { API_BASE_URL } from "@/constants"

export async function exportTranscript(videoId: string, format: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/export/${videoId}?format=${format}`)
  if (!response.ok) throw new Error("Export failed")
  return response.blob()
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

import { apiGet, apiPut, apiPatch } from "./client"
import type { Transcript, TranscriptSegment } from "@/types"

export function fetchTranscript(videoId: string): Promise<Transcript> {
  return apiGet<Transcript>(`/api/transcripts/${videoId}`)
}

export function updateTranscript(videoId: string, segments: TranscriptSegment[]): Promise<Transcript> {
  return apiPut<Transcript>(`/api/transcripts/${videoId}`, { segments })
}

export function updateSpeaker(videoId: string, segmentId: string, speaker: string): Promise<{ message: string }> {
  return apiPatch<{ message: string }>(`/api/transcripts/${videoId}/speaker`, { segmentId, speaker })
}

export function searchTranscript(videoId: string, query: string): Promise<TranscriptSegment[]> {
  return apiGet<TranscriptSegment[]>(`/api/transcripts/${videoId}/search?q=${encodeURIComponent(query)}`)
}

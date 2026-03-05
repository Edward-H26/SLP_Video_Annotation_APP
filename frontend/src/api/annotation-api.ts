import { apiGet, apiPost, apiPut, apiDelete } from "./client"
import type { Annotation } from "@/types"

type CreateAnnotationData = {
  videoId: string
  timestamp: number
  endTimestamp?: number | null
  type: string
  content?: string
  tags?: string[]
  color?: string
}

export function fetchAnnotations(videoId: string): Promise<Annotation[]> {
  return apiGet<Annotation[]>(`/api/annotations/video/${videoId}`)
}

export function createAnnotation(data: CreateAnnotationData): Promise<Annotation> {
  return apiPost<Annotation>("/api/annotations", data)
}

export function updateAnnotation(id: string, data: Partial<CreateAnnotationData>): Promise<Annotation> {
  return apiPut<Annotation>(`/api/annotations/${id}`, data)
}

export function deleteAnnotation(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/api/annotations/${id}`)
}

export function searchAnnotations(videoId: string, query: string, tags: string): Promise<Annotation[]> {
  const params = new URLSearchParams()
  if (query) params.set("q", query)
  if (tags) params.set("tags", tags)
  return apiGet<Annotation[]>(`/api/annotations/video/${videoId}/search?${params.toString()}`)
}

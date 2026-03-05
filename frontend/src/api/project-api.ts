import { apiGet, apiPost, apiPut, apiDelete } from "./client"
import type { Project } from "@/types"

export function fetchProjects(): Promise<Project[]> {
  return apiGet<Project[]>("/api/projects")
}

export function fetchProject(id: string): Promise<Project> {
  return apiGet<Project>(`/api/projects/${id}`)
}

export function createProject(data: { title: string; description?: string }): Promise<Project> {
  return apiPost<Project>("/api/projects", data)
}

export function updateProject(id: string, data: { title?: string; description?: string }): Promise<Project> {
  return apiPut<Project>(`/api/projects/${id}`, data)
}

export function deleteProject(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/api/projects/${id}`)
}

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import Header from "@/components/layout/Header"
import ProjectList from "@/components/project/ProjectList"
import ProjectCreateModal from "@/components/project/ProjectCreateModal"
import Button from "@/components/ui/Button"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { fetchProjects, createProject, deleteProject } from "@/api/project-api"
import type { Project } from "@/types"

export default function ProjectListPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setIsLoading(true)
    const data = await fetchProjects()
    setProjects(data)
    setIsLoading(false)
  }

  const handleCreate = async (title: string, description: string) => {
    const project = await createProject({ title, description })
    setProjects((prev) => [project, ...prev])
  }

  const handleDelete = async (id: string) => {
    await deleteProject(id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <AppLayout>
      <Header title="Video Annotation Platform" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
              <p className="text-gray-500 mt-1">Create and manage your video annotation projects</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={16} className="mr-1.5" />
              New Project
            </Button>
          </div>
          {isLoading ? (
            <LoadingSpinner className="py-20" />
          ) : (
            <ProjectList projects={projects} onDelete={handleDelete} />
          )}
        </div>
      </div>
      <ProjectCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </AppLayout>
  )
}

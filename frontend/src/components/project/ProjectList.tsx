import ProjectCard from "./ProjectCard"
import type { Project } from "@/types"

type ProjectListProps = {
  projects: Project[]
  onDelete: (id: string) => void
}

export default function ProjectList({ projects, onDelete }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-lg">No projects yet</p>
        <p className="text-sm mt-1">Create a project to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onDelete={onDelete} />
      ))}
    </div>
  )
}

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Film, Trash2 } from "lucide-react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import type { Project } from "@/types"

type ProjectCardProps = {
  project: Project
  onDelete: (id: string) => void
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const navigate = useNavigate()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  return (
    <>
      <div
        onClick={() => navigate(`/project/${project.id}`)}
        className="group relative bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50">
              <Film size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{project.title}</h3>
              {project.description && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{project.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsConfirmOpen(true)
            }}
            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {new Date(project.createdAt).toLocaleDateString()}
        </p>
      </div>
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Delete Project"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete <strong>{project.title}</strong>? This will permanently remove all videos, transcripts, and annotations in this project.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setIsConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onDelete(project.id)
              setIsConfirmOpen(false)
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  )
}

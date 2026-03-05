import { ArrowLeft, Download } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "@/components/ui/Button"

type HeaderProps = {
  title: string
  showBack?: boolean
  onExport?: () => void
}

export default function Header({ title, showBack = false, onExport }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate("/")}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>
      {onExport && (
        <Button variant="secondary" size="sm" onClick={onExport}>
          <Download size={16} className="mr-1.5" />
          Export
        </Button>
      )}
    </header>
  )
}

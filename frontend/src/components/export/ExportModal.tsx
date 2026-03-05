import { useState } from "react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import { exportTranscript, downloadBlob } from "@/api/export-api"
import { FileJson, FileText, File, FileType } from "lucide-react"

type ExportModalProps = {
  isOpen: boolean
  onClose: () => void
  videoId: string
}

const formats = [
  { value: "json", label: "JSON", icon: FileJson, extension: "json" },
  { value: "srt", label: "SRT (Subtitles)", icon: FileText, extension: "srt" },
  { value: "txt", label: "Plain Text", icon: FileType, extension: "txt" },
  { value: "pdf", label: "PDF Report", icon: File, extension: "pdf" },
]

export default function ExportModal({ isOpen, onClose, videoId }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState("json")
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    const format = formats.find((f) => f.value === selectedFormat)
    const blob = await exportTranscript(videoId, selectedFormat)
    downloadBlob(blob, `transcript.${format?.extension || "json"}`)
    setIsExporting(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Transcript">
      <div className="space-y-3">
        {formats.map((format) => {
          const Icon = format.icon
          return (
            <button
              key={format.value}
              onClick={() => setSelectedFormat(format.value)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                selectedFormat === format.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Icon size={20} className={selectedFormat === format.value ? "text-blue-600" : "text-gray-400"} />
              <span className={`text-sm font-medium ${selectedFormat === format.value ? "text-blue-700" : "text-gray-700"}`}>
                {format.label}
              </span>
            </button>
          )
        })}
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? "Exporting..." : "Download"}
        </Button>
      </div>
    </Modal>
  )
}

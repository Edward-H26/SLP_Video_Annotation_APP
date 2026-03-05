import { useState, useCallback } from "react"
import Badge from "@/components/ui/Badge"

type TagSelectorProps = {
  tags: string[]
  onChange: (tags: string[]) => void
}

export default function TagSelector({ tags, onChange }: TagSelectorProps) {
  const [inputValue, setInputValue] = useState("")

  const addTag = useCallback(() => {
    const trimmed = inputValue.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInputValue("")
  }, [inputValue, tags, onChange])

  const removeTag = useCallback(
    (tag: string) => {
      onChange(tags.filter((t) => t !== tag))
    },
    [tags, onChange]
  )

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map((tag) => (
          <Badge key={tag} onRemove={() => removeTag(tag)}>
            {tag}
          </Badge>
        ))}
      </div>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            addTag()
          }
        }}
        placeholder="Add tag and press Enter"
        className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
      />
    </div>
  )
}

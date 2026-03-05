import { clsx } from "clsx"

type BadgeProps = {
  children: React.ReactNode
  color?: string
  variant?: "default" | "outline"
  className?: string
  onRemove?: () => void
}

export default function Badge({ children, color, variant = "default", className, onRemove }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        variant === "default" && "bg-blue-100 text-blue-700",
        variant === "outline" && "border border-gray-300 text-gray-600",
        className
      )}
      style={color ? { backgroundColor: `${color}20`, color, borderColor: color } : undefined}
    >
      {children}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 hover:opacity-70"
        >
          ×
        </button>
      )}
    </span>
  )
}

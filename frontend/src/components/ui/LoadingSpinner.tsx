import { clsx } from "clsx"

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
}

export default function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div className={clsx("flex items-center justify-center", className)}>
      <div
        className={clsx(
          "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
          sizeMap[size]
        )}
      />
    </div>
  )
}

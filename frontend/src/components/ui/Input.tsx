import { type InputHTMLAttributes, forwardRef } from "react"
import { clsx } from "clsx"

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={clsx(
            "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm",
            "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
            "placeholder:text-gray-400",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input

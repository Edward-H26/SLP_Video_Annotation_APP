import type { ReactNode } from "react"

type AppLayoutProps = {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {children}
    </div>
  )
}

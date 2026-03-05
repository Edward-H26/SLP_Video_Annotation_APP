import { BrowserRouter, Routes, Route } from "react-router-dom"
import ProjectListPage from "@/pages/ProjectListPage"
import WorkspacePage from "@/pages/WorkspacePage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProjectListPage />} />
        <Route path="/project/:projectId" element={<WorkspacePage />} />
      </Routes>
    </BrowserRouter>
  )
}

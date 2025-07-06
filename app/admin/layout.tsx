import type React from "react"
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar (example) */}
      <aside className="w-64 bg-gray-100 p-4">
        <h2>Admin Panel</h2>
        {/* Add navigation links here */}
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}

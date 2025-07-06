import type React from "react"
import type { ReactNode } from "react"

interface OperatorDashboardLayoutProps {
  children: ReactNode
}

const OperatorDashboardLayout: React.FC<OperatorDashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-200 p-4">
        <h2 className="text-2xl font-semibold mb-4">Operator Dashboard</h2>
        <nav>
          <ul>
            <li className="mb-2">
              <a href="/operator/dashboard" className="hover:text-blue-500">
                Overview
              </a>
            </li>
            <li className="mb-2">
              <a href="/operator/dashboard/users" className="hover:text-blue-500">
                Users
              </a>
            </li>
            <li className="mb-2">
              <a href="/operator/dashboard/settings" className="hover:text-blue-500">
                Settings
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">{children}</div>
    </div>
  )
}

export default OperatorDashboardLayout

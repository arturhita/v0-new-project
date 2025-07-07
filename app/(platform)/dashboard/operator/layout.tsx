import type { ReactNode } from "react"
import OperatorNavClient from "./nav-client"
import { Card } from "@/components/ui/card"

export default function OperatorDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <aside className="md:col-span-1">
            <Card className="p-4 bg-white shadow-sm rounded-lg">
              <OperatorNavClient />
            </Card>
          </aside>
          <main className="md:col-span-3">
            <Card className="p-6 bg-white shadow-sm rounded-lg">{children}</Card>
          </main>
        </div>
      </div>
    </div>
  )
}

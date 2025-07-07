import type React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs"

import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { OperatorStatusToggle } from "@/components/operator-status-toggle"

export const metadata: Metadata = {
  title: "Operator Dashboard",
}

const OperatorDashboardLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { userId } = auth()

  if (!userId) {
    redirect("/")
  }

  const profile = await currentProfile()

  if (!profile) {
    redirect("/")
  }

  const operator = await db.operator.findUnique({
    where: {
      profileId: profile.id,
    },
  })

  if (!operator) {
    redirect("/(platform)/dashboard")
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <OperatorStatusToggle operatorId={profile.id} initialIsAvailable={profile.is_available ?? false} />
      </div>
      {children}
    </div>
  )
}

export default OperatorDashboardLayout

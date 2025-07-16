"use client"

import { createClient } from "@/lib/supabase/server"
import { getOperators } from "@/lib/actions/data.actions"
import HomePageClient from "./home-page-client"
import type { Operator as OperatorType } from "@/components/operator-card"

export default async function UnveillyHomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const operators = (await getOperators({ limit: 8 })) as OperatorType[]

  const newTalents = operators
    .filter((op) => op.joinedDate && new Date(op.joinedDate) > new Date(Date.now() - 10 * 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(b.joinedDate!).getTime() - new Date(a.joinedDate!).getTime())
    .slice(0, 3)

  return <HomePageClient user={user} operators={operators} newTalents={newTalents} />
}

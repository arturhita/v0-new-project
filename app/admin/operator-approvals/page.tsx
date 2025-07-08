import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { approveOperator, rejectOperator } from "@/lib/actions/admin.actions"

async function getPendingApplications() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("operator_details")
    .select(
      `
      user_id,
      stage_name,
      bio,
      specialties,
      created_at,
      profiles (
        email,
        name
      )
    `,
    )
    .eq("status", "pending")

  if (error) {
    console.error("Error fetching pending applications:", error)
    return []
  }
  return data
}

export default async function OperatorApprovalsPage() {
  const applications = await getPendingApplications()

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Approvazione Operatori</h1>
      <p className="text-slate-500 mb-6">
        Esamina e approva le nuove candidature per diventare esperti sulla piattaforma.
      </p>

      {applications.length === 0 ? (
        <p>Non ci sono nuove candidature in attesa.</p>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <Card key={app.user_id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{app.stage_name}</CardTitle>
                    <CardDescription>
                      Candidatura di: {app.profiles?.name} ({app.profiles?.email})
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">In Attesa</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-semibold mb-1">Biografia</h4>
                  <p className="text-sm text-slate-600 mb-4">{app.bio}</p>
                  <h4 className="font-semibold mb-1">Specializzazioni</h4>
                  <div className="flex flex-wrap gap-2">
                    {app.specialties.map((spec) => (
                      <Badge key={spec}>{spec}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <form action={approveOperator}>
                    <input type="hidden" name="userId" value={app.user_id} />
                    <Button type="submit">Approva</Button>
                  </form>
                  <form action={rejectOperator}>
                    <input type="hidden" name="userId" value={app.user_id} />
                    <Button type="submit" variant="destructive">
                      Rifiuta
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

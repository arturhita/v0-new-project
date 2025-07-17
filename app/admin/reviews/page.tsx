import { getPendingReviews, getModeratedReviews } from "@/lib/actions/reviews.actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ReviewModerationCard } from "./review-moderation-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

// Questo è ora un Server Component che carica i dati all'inizio
export default async function ModerateReviewsPage() {
  // Carichiamo i dati direttamente dal database
  const pendingReviews = await getPendingReviews()
  const moderatedReviews = await getModeratedReviews()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Moderazione Recensioni</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Le recensioni con 4-5 stelle vengono approvate in automatico. Qui visualizzi quelle con 1-3 stelle o segnalate,
        in attesa di approvazione.
      </CardDescription>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">In Attesa ({pendingReviews.length})</TabsTrigger>
          <TabsTrigger value="history">Storico</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          {pendingReviews.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-slate-500">
                Nessuna recensione in attesa di moderazione.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map((rev) => (
                <ReviewModerationCard key={rev.id} review={rev} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg text-slate-700">Storico Recensioni Moderate</CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Elenco delle ultime 50 recensioni già approvate o rifiutate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {moderatedReviews.length > 0 ? (
                    moderatedReviews.map((rev) => (
                      <div key={rev.id} className="p-4 border rounded-lg bg-slate-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-slate-800">{rev.operator_name}</p>
                            <p className="text-sm text-slate-500">
                              Da: {rev.user_name} - {new Date(rev.created_at).toLocaleDateString("it-IT")}
                            </p>
                          </div>
                          <Badge
                            variant={rev.status === "Approved" ? "default" : "destructive"}
                            className={
                              rev.status === "Approved" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                            }
                          >
                            {rev.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-2 italic">"{rev.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-500 pt-6">Nessuna recensione nello storico.</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

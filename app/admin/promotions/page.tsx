import { getPromotions } from "@/lib/actions/promotions.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PromotionFormModal } from "./promotion-form-modal"
import { format } from "date-fns"

export default async function PromotionsPage() {
  const promotions = await getPromotions()

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestione Promozioni</h1>
        <PromotionFormModal />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Promozioni Esistenti</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titolo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valore</TableHead>
                <TableHead>Inizio</TableHead>
                <TableHead>Fine</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell>{promo.title}</TableCell>
                  <TableCell>{promo.special_price ? "Prezzo Fisso" : "Sconto %"}</TableCell>
                  <TableCell>
                    {promo.special_price ? `€${promo.special_price}` : `${promo.discount_percentage}%`}
                  </TableCell>
                  <TableCell>{format(new Date(promo.start_date), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{format(new Date(promo.end_date), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant={promo.is_active ? "default" : "destructive"}>
                      {promo.is_active ? "Attiva" : "Inattiva"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <PromotionFormModal promotion={promo} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

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
          <CardTitle>Promozioni Attive e Passate</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codice</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valore</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Scadenza</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.length > 0 ? (
                promotions.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-medium">{promo.code}</TableCell>
                    <TableCell>{promo.type}</TableCell>
                    <TableCell>
                      {promo.type === "percentage" ? `${promo.value}%` : `€${promo.value.toFixed(2)}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant={promo.is_active ? "default" : "secondary"}>
                        {promo.is_active ? "Attiva" : "Non Attiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(promo.expires_at), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <PromotionFormModal promotion={promo} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nessuna promozione trovata.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

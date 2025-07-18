import { getPromotions } from "@/lib/actions/promotions.actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PromotionFormModal } from "./promotion-form-modal"
import { format } from "date-fns"
import { it } from "date-fns/locale"

export default async function AdminPromotionsPage() {
  const promotions = await getPromotions()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestione Promozioni</h1>
        <PromotionFormModal>
          <Button>Crea Promozione</Button>
        </PromotionFormModal>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titolo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valore</TableHead>
              <TableHead>Inizio</TableHead>
              <TableHead>Fine</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.length > 0 ? (
              promotions.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-medium">{promo.title}</TableCell>
                  <TableCell>{promo.special_price ? "Prezzo Fisso" : "Sconto %"}</TableCell>
                  <TableCell>
                    {promo.special_price
                      ? `€${Number(promo.special_price).toFixed(2)}`
                      : `${promo.discount_percentage}%`}
                  </TableCell>
                  <TableCell>{format(new Date(promo.start_date), "d MMM yyyy", { locale: it })}</TableCell>
                  <TableCell>{format(new Date(promo.end_date), "d MMM yyyy", { locale: it })}</TableCell>
                  <TableCell>
                    <Badge variant={promo.is_active ? "success" : "secondary"}>
                      {promo.is_active ? "Attiva" : "Inattiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <PromotionFormModal promotion={promo}>
                      <Button variant="outline" size="sm">
                        Modifica
                      </Button>
                    </PromotionFormModal>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Nessuna promozione trovata.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

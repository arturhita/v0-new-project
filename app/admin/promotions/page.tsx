import { getPromotions } from "@/lib/actions/promotions.actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { PromotionFormModal } from "./promotion-form-modal"
import { PlusCircle } from "lucide-react"

export default async function PromotionsPage() {
  const promotions = await getPromotions()

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Promozioni Globali</CardTitle>
            <CardDescription>
              Crea promozioni che si applicano a tutti gli operatori per un periodo limitato.
            </CardDescription>
          </div>
          <PromotionFormModal>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crea Promozione
            </Button>
          </PromotionFormModal>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titolo</TableHead>
              <TableHead>Tipo Sconto</TableHead>
              <TableHead>Validità</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.length > 0 ? (
              promotions.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-medium">{promo.title}</TableCell>
                  <TableCell>
                    {promo.special_price ? `Prezzo Fisso: €${promo.special_price.toFixed(2)}` : ""}
                    {promo.discount_percentage ? `Sconto: ${promo.discount_percentage}%` : ""}
                  </TableCell>
                  <TableCell>
                    {format(new Date(promo.start_date), "dd/MM/yy", { locale: it })} -{" "}
                    {format(new Date(promo.end_date), "dd/MM/yy", { locale: it })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={promo.is_active ? "default" : "secondary"}>
                      {promo.is_active ? "Attiva" : "Non Attiva"}
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
                <TableCell colSpan={5} className="text-center py-8">
                  Nessuna promozione trovata.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

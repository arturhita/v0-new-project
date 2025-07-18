import { getPromotions } from "@/lib/actions/promotions.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { PromotionFormModal } from "./promotion-form-modal"

export default async function PromotionsPage() {
  const promotions = await getPromotions()

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestione Promozioni</h1>
          <p className="text-muted-foreground">Crea e gestisci i codici sconto per i tuoi clienti.</p>
        </div>
        <PromotionFormModal>
          <Button>Crea Promozione</Button>
        </PromotionFormModal>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Promozioni Attive e Scadute</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codice</TableHead>
                <TableHead>Sconto</TableHead>
                <TableHead>Validità</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.length > 0 ? (
                promotions.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-medium">{promo.code}</TableCell>
                    <TableCell>{promo.discount_percentage}%</TableCell>
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
    </div>
  )
}

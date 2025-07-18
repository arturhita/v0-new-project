import { getPromotions } from "@/lib/actions/promotions.actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { PromotionFormModal } from "./promotion-form-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function PromotionsPage() {
  const promotions = await getPromotions()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestione Promozioni</h1>
        <PromotionFormModal>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crea Promozione
          </Button>
        </PromotionFormModal>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Promozioni Attive e Programmate</CardTitle>
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
                      {promo.special_price ? `€${promo.special_price.toFixed(2)}` : `${promo.discount_percentage}%`}
                    </TableCell>
                    <TableCell>{new Date(promo.start_date).toLocaleString("it-IT")}</TableCell>
                    <TableCell>{new Date(promo.end_date).toLocaleString("it-IT")}</TableCell>
                    <TableCell>
                      <Badge variant={promo.is_active ? "default" : "secondary"}>
                        {promo.is_active ? "Attiva" : "Inattiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <PromotionFormModal promotion={promo}>
                        <Button variant="ghost" size="sm">
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
        </CardContent>
      </Card>
    </div>
  )
}

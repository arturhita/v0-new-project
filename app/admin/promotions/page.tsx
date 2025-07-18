import { getPromotions } from "@/lib/actions/promotions.actions"
import { CreatePromotionModal } from "@/components/create-promotion-modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EditPromotionButton } from "./promotion-actions"

export default async function AdminPromotionsPage() {
  const promotions = await getPromotions()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestione Promozioni</h1>
        <CreatePromotionModal />
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titolo</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Prezzo Speciale</TableHead>
              <TableHead>Prezzo Originale</TableHead>
              <TableHead>Inizio</TableHead>
              <TableHead>Fine</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.length > 0 ? (
              promotions.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-medium">{promo.title}</TableCell>
                  <TableCell>
                    <Badge variant={promo.is_active ? "default" : "destructive"}>
                      {promo.is_active ? "Attiva" : "Non Attiva"}
                    </Badge>
                  </TableCell>
                  <TableCell>€{promo.special_price}</TableCell>
                  <TableCell className="line-through text-gray-500">€{promo.original_price}</TableCell>
                  <TableCell>{new Date(promo.start_date).toLocaleDateString("it-IT")}</TableCell>
                  <TableCell>{new Date(promo.end_date).toLocaleDateString("it-IT")}</TableCell>
                  <TableCell className="text-right">
                    <EditPromotionButton promotion={promo} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
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

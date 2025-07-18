import { getAllPromotions } from "@/lib/actions/promotions.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreatePromotionModal from "@/components/create-promotion-modal";
import { PlusCircle } from 'lucide-react';

export default async function AdminPromotionsPage() {
  const promotions = await getAllPromotions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promotions Management</h1>
          <p className="text-muted-foreground">Create and manage special offers for your users.</p>
        </div>
        <CreatePromotionModal>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Promotion
          </Button>
        </CreatePromotionModal>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promo) => (
          <Card key={promo.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{promo.title}</CardTitle>
                <Badge variant={promo.is_active ? "default" : "destructive"}>
                  {promo.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>{promo.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-bold text-primary">€{promo.special_price}</span>
                <span className="text-lg line-through text-muted-foreground">€{promo.original_price}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <p><strong>Discount:</strong> {promo.discount_percentage}%</p>
                <p><strong>Validity:</strong> {new Date(promo.start_date).toLocaleDateString()} - {new Date(promo.end_date).toLocaleDateString()}</p>
                <p><strong>Active on:</strong> {promo.valid_days.join(', ')}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {promotions.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No promotions found.</p>
            <p className="text-sm text-muted-foreground">Click "Create Promotion" to add a new one.</p>
        </div>
      )}
    </div>
  );
}

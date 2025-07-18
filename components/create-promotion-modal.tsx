'use client'

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createPromotion } from '@/lib/actions/promotions.actions';
import { useToast } from '@/components/ui/use-toast';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function CreatePromotionModal({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string[] | undefined> | null>(null);

  const handleSubmit = (formData: FormData) => {
    setErrors(null);
    startTransition(async () => {
      const result = await createPromotion(formData);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }
      } else {
        toast({
          title: "Success",
          description: "Promotion created successfully.",
        });
        setIsOpen(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Promotion</DialogTitle>
          <DialogDescription>Fill in the details to create a new special offer.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
              {errors?.title && <p className="text-red-500 text-xs">{errors.title[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="original_price">Original Price (€)</Label>
              <Input id="original_price" name="original_price" type="number" step="0.01" required />
              {errors?.original_price && <p className="text-red-500 text-xs">{errors.original_price[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="special_price">Special Price (€)</Label>
              <Input id="special_price" name="special_price" type="number" step="0.01" required />
              {errors?.special_price && <p className="text-red-500 text-xs">{errors.special_price[0]}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" name="start_date" type="date" required />
              {errors?.start_date && <p className="text-red-500 text-xs">{errors.start_date[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input id="end_date" name="end_date" type="date" required />
              {errors?.end_date && <p className="text-red-500 text-xs">{errors.end_date[0]}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Valid Days</Label>
            <div className="grid grid-cols-4 gap-2">
              {daysOfWeek.map(day => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox id={`day-${day}`} name="valid_days" value={day} />
                  <Label htmlFor={`day-${day}`}>{day}</Label>
                </div>
              ))}
            </div>
            {errors?.valid_days && <p className="text-red-500 text-xs">{errors.valid_days[0]}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Promotion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

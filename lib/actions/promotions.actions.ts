'use server'

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PromotionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  special_price: z.coerce.number().positive("Special price must be positive"),
  original_price: z.coerce.number().positive("Original price must be positive"),
  start_date: z.string().date("Invalid start date"),
  end_date: z.string().date("Invalid end date"),
  valid_days: z.array(z.string()).min(1, "At least one valid day is required"),
});

export async function createPromotion(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    special_price: formData.get('special_price'),
    original_price: formData.get('original_price'),
    start_date: formData.get('start_date'),
    end_date: formData.get('end_date'),
    valid_days: formData.getAll('valid_days'),
  };

  const validatedFields = PromotionSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Validation errors:", validatedFields.error.flatten().fieldErrors);
    return {
      error: "Invalid data provided.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { data: promotionData, error } = await supabase
    .from('promotions')
    .insert([
      {
        ...validatedFields.data,
        discount_percentage: Math.round(((validatedFields.data.original_price - validatedFields.data.special_price) / validatedFields.data.original_price) * 100)
      }
    ])
    .select();

  if (error) {
    console.error("Error creating promotion:", error);
    return {
      error: "Could not create promotion.",
    };
  }

  revalidatePath('/admin/promotions');
  return {
    success: "Promotion created successfully.",
    data: promotionData
  };
}

export async function getAllPromotions() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc('get_all_promotions');

    if (error) {
        console.error('Error fetching promotions:', error);
        return [];
    }
    return data;
}

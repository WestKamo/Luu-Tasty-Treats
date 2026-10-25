import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});
export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export const createCakeSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  description: z.string().max(2000).optional(),
  basePrice: z.coerce.number().min(0, "Price cannot be negative"),
});
export type CreateCakeFormValues = z.infer<typeof createCakeSchema>;

export const cakeEditSchema = createCakeSchema.extend({
  isActive: z.boolean()
});
export type CakeEditFormValues = z.infer<typeof cakeEditSchema>;

export const checkoutSchema = z.object({
  customerFullName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  deliveryMethod: z.enum(["Pickup", "Delivery"]),
  requestedDate: z.string().min(1, "Requested date is required"),
  deliveryAddress: z.object({
    line1: z.string().min(1, "Address is required"),
    line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    provinceState: z.string().min(1, "Province/State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required")
  }).optional()
});
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

import { z } from "zod";
export const adminLoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export const checkoutSchema = z.object({
  customerEmail: z.string().email("Enter a valid email"),
  customerFullName: z.string().min(1, "Full name is required").max(150),
  customerPhone: z.string().optional(),
  deliveryMethod: z.enum(["pickup", "delivery"]),
  requestedDate: z.string().min(1, "Pick a date"),
  line1: z.string().optional(),
  line2: z.string().optional(),
  city: z.string().optional(),
  provinceState: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.deliveryMethod === "delivery") {
    if (!data.line1) ctx.addIssue({ code: "custom", path: ["line1"], message: "Address line 1 is required" });
    if (!data.city) ctx.addIssue({ code: "custom", path: ["city"], message: "City is required" });
    if (!data.country) ctx.addIssue({ code: "custom", path: ["country"], message: "Country is required" });
  }
});
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const cakeEditSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  description: z.string().max(2000).optional(),
  basePrice: z.coerce.number().min(0, "Price cannot be negative"),
  isActive: z.boolean(),
});
export type CakeEditFormValues = z.infer<typeof cakeEditSchema>;

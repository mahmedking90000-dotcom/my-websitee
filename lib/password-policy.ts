import { z } from "zod";

// bcrypt only considers the first 72 UTF-8 bytes, so keep passwords within that limit.
export const strongPasswordSchema = z
  .string()
  .min(12, "كلمة المرور يجب أن تكون 12 حرفًا على الأقل.")
  .max(72, "كلمة المرور طويلة جدًا.")
  .regex(/[a-z]/, "أضف حرفًا إنجليزيًا صغيرًا واحدًا على الأقل.")
  .regex(/[A-Z]/, "أضف حرفًا إنجليزيًا كبيرًا واحدًا على الأقل.")
  .regex(/[0-9]/, "أضف رقمًا واحدًا على الأقل.")
  .regex(/[\p{P}\p{S}]/u, "أضف رمزًا خاصًا واحدًا على الأقل مثل ! أو @ أو #.")
  .refine(value => new TextEncoder().encode(value).length <= 72, "كلمة المرور طويلة جدًا.");

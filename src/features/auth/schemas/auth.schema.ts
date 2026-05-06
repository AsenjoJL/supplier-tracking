import { z } from "zod";

export const authFormSchema = z
  .object({
    mode: z.enum(["login", "register"]),
    displayName: z.string(),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .superRefine((values, context) => {
    if (values.mode !== "register") return;

    if (values.displayName.trim().length < 2) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["displayName"],
        message: "Name must be at least 2 characters",
      });
    }

    if (values.password !== values.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export type AuthFormValues = z.infer<typeof authFormSchema>;

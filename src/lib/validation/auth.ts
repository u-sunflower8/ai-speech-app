import { z } from "zod";

export const signUpSchema = z.object({
  email: z.email({ error: "有効なメールアドレスを入力してください。" }),
  password: z
    .string()
    .min(8, { error: "パスワードは8文字以上で入力してください。" }),
});

export const signInSchema = z.object({
  email: z.email({ error: "有効なメールアドレスを入力してください。" }),
  password: z.string().min(1, { error: "パスワードを入力してください。" }),
});

export const resetPasswordSchema = z.object({
  email: z.email({ error: "有効なメールアドレスを入力してください。" }),
});

export const confirmPasswordResetSchema = z
  .object({
    email: z.email({ error: "有効なメールアドレスを入力してください。" }),
    code: z
      .string()
      .trim()
      .min(6, { error: "メールに記載されたコードを入力してください。" }),
    password: z
      .string()
      .min(8, { error: "パスワードは8文字以上で入力してください。" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "パスワードが一致しません。",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ConfirmPasswordResetInput = z.infer<typeof confirmPasswordResetSchema>;

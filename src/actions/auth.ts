"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  signUpSchema,
  signInSchema,
  resetPasswordSchema,
  confirmPasswordResetSchema,
  type SignUpInput,
  type SignInInput,
  type ResetPasswordInput,
  type ConfirmPasswordResetInput,
} from "@/lib/validation/auth";

export type ActionResult = { error?: string; message?: string } | undefined;

export async function signUp(input: SignUpInput): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" };
  }

  // Supabaseの標準サインアップ(確認メール送信)は使わず、サーバー側で
  // 確認済みアカウントを直接作成して即ログインさせる。開発用の共有メール
  // 送信サービスのレート制限に左右されず、ユーザーはメールを待たずに使い始められる。
  const admin = createAdminClient();
  const { error: createError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (createError) {
    if (createError.code === "email_exists") {
      return { error: "このメールアドレスは既に登録されています。" };
    }
    return { error: "登録に失敗しました。時間をおいてもう一度お試しください。" };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);

  if (signInError) {
    return { error: "登録は完了しましたが、ログインに失敗しました。ログイン画面からお試しください。" };
  }

  redirect("/dashboard");
}

export async function signIn(input: SignInInput): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "メールアドレスまたはパスワードが正しくありません。" };
  }

  redirect("/dashboard");
}

export async function signOut(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(
  input: ResetPasswordInput
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email);

  if (error) {
    return { error: error.message };
  }

  return { message: "確認コードをメールで送信しました。" };
}

export async function confirmPasswordReset(
  input: ConfirmPasswordResetInput
): Promise<ActionResult> {
  const parsed = confirmPasswordResetSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" };
  }

  const supabase = await createClient();

  // メールのリンクはGmail等のセキュリティスキャナに事前アクセスされ、
  // 本人がクリックする前に無効化されてしまうことがあるため、リンク方式ではなく
  // メールに記載された確認コードを本人に入力してもらう方式にしている。
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.code,
    type: "recovery",
  });

  if (verifyError) {
    return { error: "コードが正しくないか、有効期限が切れています。もう一度お試しください。" };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (updateError) {
    return { error: "パスワードの更新に失敗しました。もう一度お試しください。" };
  }

  redirect("/dashboard");
}

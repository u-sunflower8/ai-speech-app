"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordReset, confirmPasswordReset } from "@/actions/auth";
import {
  resetPasswordSchema,
  confirmPasswordResetSchema,
  type ResetPasswordInput,
  type ConfirmPasswordResetInput,
} from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

function RequestStep({
  onSent,
}: {
  onSent: (email: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = (data: ResetPasswordInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await requestPasswordReset(data);
      if (result?.error) setFormError(result.error);
      if (result?.message) onSent(getValues("email"));
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">登録済みのメールアドレス</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "送信しています..." : "確認コードを送信する"}
      </Button>
    </form>
  );
}

function ConfirmStep({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmPasswordResetInput>({
    resolver: zodResolver(confirmPasswordResetSchema),
    defaultValues: { email },
  });

  const onSubmit = (data: ConfirmPasswordResetInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await confirmPasswordReset(data);
      if (result?.error) setFormError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <input type="hidden" {...register("email")} />
      <p className="text-sm text-neutral-600">
        {email} 宛に確認コードを送信しました。メールに記載のコードと、新しいパスワードを入力してください。
      </p>

      <div className="space-y-2">
        <Label htmlFor="code">確認コード</Label>
        <Input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          {...register("code")}
        />
        {errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">新しいパスワード</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "更新しています..." : "パスワードを更新する"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>パスワード再設定</CardTitle>
      </CardHeader>
      <CardContent>
        {sentToEmail ? (
          <ConfirmStep email={sentToEmail} />
        ) : (
          <RequestStep onSent={setSentToEmail} />
        )}

        <p className="mt-4 text-center text-sm text-neutral-600">
          <Link href="/login" className="font-medium underline">
            ログインへ戻る
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

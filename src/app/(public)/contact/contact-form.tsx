"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/schemas/contact.schema";
import { submitContactAction } from "./actions";
import { Button } from "@/components/ui/button";
import { FormField, Input, InputErrorMessage } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * お問い合わせフォーム（クライアントコンポーネント）
 * 送信に成功すると同一ページ内で「送信完了」表示に切り替えます。
 */
export function ContactForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(values: ContactInput) {
    setFormError(null);
    const result = await submitContactAction(values);

    if (result.success) {
      setSubmitted(true);
      return;
    }

    if (result.fieldErrors) {
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        setError(field as keyof ContactInput, { message });
      }
    }
    setFormError(result.error ?? "送信に失敗しました。");
  }

  // 送信完了画面
  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-surface px-6 py-12 text-center">
        <span className="mb-3 inline-block text-4xl" aria-hidden="true">
          ✅
        </span>
        <h2 className="mb-2 text-xl font-bold text-foreground">
          お問い合わせを受け付けました
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          お問い合わせいただきありがとうございます。
          <br />
          内容を確認のうえ、担当者よりご連絡いたします。
        </p>
        <div className="mt-6">
          <Button href="/" variant="outline">
            トップへ戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {formError && (
        <p
          role="alert"
          className="rounded-xl bg-accent-light px-4 py-3 text-sm text-accent"
        >
          {formError}
        </p>
      )}

      <FormField>
        <Label htmlFor="name" required>
          お名前
        </Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          hasError={!!errors.name}
          placeholder="山田 太郎"
          {...register("name")}
        />
        <InputErrorMessage message={errors.name?.message} />
      </FormField>

      <FormField>
        <Label htmlFor="email" required>
          メールアドレス
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          hasError={!!errors.email}
          placeholder="example@email.com"
          {...register("email")}
        />
        <InputErrorMessage message={errors.email?.message} />
      </FormField>

      <FormField>
        <Label htmlFor="subject" required>
          件名
        </Label>
        <Input
          id="subject"
          type="text"
          hasError={!!errors.subject}
          placeholder="サービスについて"
          {...register("subject")}
        />
        <InputErrorMessage message={errors.subject?.message} />
      </FormField>

      <FormField>
        <Label htmlFor="message" required>
          お問い合わせ内容
        </Label>
        <Textarea
          id="message"
          rows={6}
          hasError={!!errors.message}
          placeholder="お問い合わせ内容をご記入ください"
          {...register("message")}
        />
        <InputErrorMessage message={errors.message?.message} />
      </FormField>

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "送信中..." : "送信する"}
      </Button>
    </form>
  );
}

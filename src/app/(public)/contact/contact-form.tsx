"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/schemas/contact.schema";
import {
  CONTACT_TOPICS,
  getContactTopic,
  type ContactTopicValue,
} from "@/constants/contact";
import { submitContactAction } from "./actions";
import { Button } from "@/components/ui/button";
import { FormField, Input, InputErrorMessage } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TurnstileWidget } from "@/components/security/turnstile-widget";
import { useTurnstile } from "@/components/security/use-turnstile";
import { TURNSTILE_ERROR_MESSAGE } from "@/constants/turnstile";

/**
 * お問い合わせフォーム（クライアントコンポーネント）
 * turnstileSiteKey / initialTopic は Server Component から渡す。
 */
export function ContactForm({
  turnstileSiteKey,
  initialTopic = "general",
}: {
  turnstileSiteKey: string;
  initialTopic?: ContactTopicValue;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedTopic, setSubmittedTopic] =
    useState<ContactTopicValue>("general");
  const {
    siteKey,
    token: turnstileToken,
    setToken: setTurnstileToken,
    resetSignal: turnstileResetSignal,
    reset: resetTurnstile,
  } = useTurnstile(turnstileSiteKey);

  const topicMeta = getContactTopic(initialTopic);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      topic: topicMeta.value,
      subject: topicMeta.subject,
      name: "",
      email: "",
      message:
        topicMeta.value === "disclosure"
          ? "特定商取引法に基づく表記に関し、販売事業者の住所および電話番号の開示を請求します。"
          : "",
    },
  });

  const topic = watch("topic");

  useEffect(() => {
    const meta = getContactTopic(topic);
    if (meta.subject) {
      setValue("subject", meta.subject, { shouldValidate: true });
    }
  }, [topic, setValue]);

  async function onSubmit(values: ContactInput) {
    setFormError(null);

    if (!turnstileToken) {
      setFormError(TURNSTILE_ERROR_MESSAGE);
      return;
    }

    const result = await submitContactAction(values, turnstileToken);

    if (result.success) {
      setSubmittedTopic(values.topic);
      setSubmitted(true);
      return;
    }

    resetTurnstile();

    if (result.fieldErrors) {
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        setError(field as keyof ContactInput, { message });
      }
    }
    setFormError(result.error ?? "送信に失敗しました。");
  }

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
          {submittedTopic === "disclosure"
            ? "住所・電話番号の開示請求として受け付けました。申込みの意思決定に先立ち十分な余裕をもって、遅滞なく電子メール等によりご案内いたします。"
            : "内容を確認のうえ、担当者よりご連絡いたします。"}
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
    <form
      method="post"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      {formError && (
        <p
          role="alert"
          className="rounded-xl bg-accent-light px-4 py-3 text-sm text-accent"
        >
          {formError}
        </p>
      )}

      {topic === "disclosure" ? (
        <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
          特定商取引法に基づく表記における住所・電話番号の開示請求です。
          ご入力のメールアドレス宛に、遅滞なく電子メール等でご案内します。
        </p>
      ) : null}

      <FormField>
        <Label htmlFor="topic" required>
          お問い合わせ種別
        </Label>
        <select
          id="topic"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          {...register("topic")}
        >
          {CONTACT_TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <InputErrorMessage message={errors.topic?.message} />
      </FormField>

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

      {siteKey ? (
        <TurnstileWidget
          siteKey={siteKey}
          onToken={setTurnstileToken}
          resetSignal={turnstileResetSignal}
        />
      ) : (
        <p className="rounded-xl bg-accent-light px-4 py-3 text-sm text-accent">
          スパム対策の認証が利用できません。時間をおいて再度お試しください。
        </p>
      )}

      <Button
        type="submit"
        fullWidth
        disabled={isSubmitting || !siteKey || !turnstileToken}
      >
        {isSubmitting ? "送信中..." : "送信する"}
      </Button>
    </form>
  );
}

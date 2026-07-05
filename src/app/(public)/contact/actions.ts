"use server";

import { db } from "@/lib/db";
import { contactSchema, type ContactInput } from "@/schemas/contact.schema";
import type { FormActionResult } from "@/types/action";

/**
 * お問い合わせ送信 Server Action
 *
 * 入力をサーバー側で再検証し、Inquiry として保存します。
 * ログイン不要（公開フォーム）です。
 */
export async function submitContactAction(
  input: ContactInput,
): Promise<FormActionResult> {
  const parsed = contactSchema.safeParse(input);

  if (!parsed.success) {
    // フィールド単位のエラーへ変換して返す
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      success: false,
      error: "入力内容をご確認ください。",
      fieldErrors,
    };
  }

  try {
    await db.inquiry.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
      },
    });
    return { success: true };
  } catch {
    return {
      success: false,
      error:
        "送信中にエラーが発生しました。時間をおいて再度お試しください。",
    };
  }
}

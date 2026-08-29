import { SITE } from "@/constants/site";
import { getAppBaseUrl } from "@/lib/auth/app-url";
import { sendEmail, type SendEmailResult } from "@/lib/email/send-email";

/** HTML メール用に危険な文字をエスケープする */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface PaymentReportedMailPayload {
  purchaseId: string;
  studentName: string;
  studentEmail: string;
  teacherName: string;
  amount: number;
  bankTransferName: string;
  transferDateLabel: string;
  studentMemo?: string | null;
}

/** 生徒の振込報告を管理者へ通知する */
export async function sendPaymentReportedAdminNotification(
  to: string | string[],
  payload: PaymentReportedMailPayload,
): Promise<SendEmailResult> {
  const adminUrl = `${getAppBaseUrl()}/admin/purchases`;
  const subject = `【${SITE.name}】振込報告がありました（入金確認待ち）`;

  const text = [
    "生徒から振込報告がありました。銀行口座の入金を確認してください。",
    "",
    `生徒: ${payload.studentName}（${payload.studentEmail}）`,
    `先生: ${payload.teacherName}`,
    `金額: ¥${payload.amount.toLocaleString()}`,
    `振込名義: ${payload.bankTransferName}`,
    `振込日: ${payload.transferDateLabel}`,
    payload.studentMemo ? `メモ: ${payload.studentMemo}` : null,
    "",
    "管理画面で確認する:",
    adminUrl,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const html = [
    "<p>生徒から振込報告がありました。銀行口座の入金を確認してください。</p>",
    '<table cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;">',
    `<tr><td style="color:#666;padding:2px 12px 2px 0;">生徒</td><td>${escapeHtml(payload.studentName)}（${escapeHtml(payload.studentEmail)}）</td></tr>`,
    `<tr><td style="color:#666;padding:2px 12px 2px 0;">先生</td><td>${escapeHtml(payload.teacherName)}</td></tr>`,
    `<tr><td style="color:#666;padding:2px 12px 2px 0;">金額</td><td>¥${payload.amount.toLocaleString()}</td></tr>`,
    `<tr><td style="color:#666;padding:2px 12px 2px 0;">振込名義</td><td>${escapeHtml(payload.bankTransferName)}</td></tr>`,
    `<tr><td style="color:#666;padding:2px 12px 2px 0;">振込日</td><td>${escapeHtml(payload.transferDateLabel)}</td></tr>`,
    payload.studentMemo
      ? `<tr><td style="color:#666;padding:2px 12px 2px 0;">メモ</td><td>${escapeHtml(payload.studentMemo)}</td></tr>`
      : "",
    "</table>",
    `<p><a href="${adminUrl}">管理画面で確認する</a></p>`,
  ].join("");

  return sendEmail({ to, subject, text, html });
}

export interface PaymentConfirmedMailPayload {
  teacherName: string;
  amount: number;
  purchaseId: string;
}

/** 入金確認完了を生徒へ通知する */
export async function sendPaymentConfirmedStudentNotification(
  to: string,
  payload: PaymentConfirmedMailPayload,
): Promise<SendEmailResult> {
  const detailUrl = `${getAppBaseUrl()}/mypage/purchases/${payload.purchaseId}`;
  const subject = `【${SITE.name}】入金を確認しました（連絡先がご覧いただけます）`;

  const text = [
    `${SITE.name}をご利用いただきありがとうございます。`,
    "",
    `${payload.teacherName} 先生への連絡先購入（¥${payload.amount.toLocaleString()}）について、入金を確認しました。`,
    "マイページの購入詳細から、先生の連絡先をご確認いただけます。",
    "",
    detailUrl,
  ].join("\n");

  const html = [
    `<p>${SITE.name}をご利用いただきありがとうございます。</p>`,
    `<p>${escapeHtml(payload.teacherName)} 先生への連絡先購入（¥${payload.amount.toLocaleString()}）について、入金を確認しました。</p>`,
    "<p>マイページの購入詳細から、先生の連絡先をご確認いただけます。</p>",
    `<p><a href="${detailUrl}" style="display:inline-block;padding:12px 24px;background:#0d9488;color:#fff;text-decoration:none;border-radius:8px;">連絡先を見る</a></p>`,
  ].join("");

  return sendEmail({ to, subject, text, html });
}

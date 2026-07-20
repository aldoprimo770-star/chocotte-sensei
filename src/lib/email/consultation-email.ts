import { SITE } from "@/constants/site";
import { getAppBaseUrl } from "@/lib/auth/app-url";
import { sendEmail, type SendEmailResult } from "@/lib/email/send-email";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(escaped: string): string {
  return escaped.replace(/\n/g, "<br>");
}

/** 先生へ：新しい事前相談が届いた通知 */
export async function sendConsultationToTeacherEmail(params: {
  to: string;
  teacherName: string;
  studentName: string;
  preview: string;
  conversationId: string;
}): Promise<SendEmailResult> {
  const url = `${getAppBaseUrl()}/consultations/${params.conversationId}`;
  const subject = `【${SITE.name}】事前相談が届きました`;
  const preview = params.preview.slice(0, 200);

  const text = [
    `${params.teacherName} 様`,
    "",
    `${params.studentName} さんから事前相談が届きました。`,
    "",
    "内容（抜粋）:",
    preview,
    "",
    "返信する:",
    url,
  ].join("\n");

  const html = [
    `<p>${escapeHtml(params.teacherName)} 様</p>`,
    `<p>${escapeHtml(params.studentName)} さんから事前相談が届きました。</p>`,
    `<p style="color:#666;margin-bottom:4px;">内容（抜粋）:</p>`,
    `<p style="white-space:pre-wrap;">${nl2br(escapeHtml(preview))}</p>`,
    `<p><a href="${url}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;">返信する</a></p>`,
  ].join("");

  return sendEmail({ to: params.to, subject, text, html });
}

/** 生徒へ：先生からの返信通知 */
export async function sendConsultationReplyToStudentEmail(params: {
  to: string;
  studentName: string;
  teacherName: string;
  preview: string;
  conversationId: string;
}): Promise<SendEmailResult> {
  const url = `${getAppBaseUrl()}/mypage/consultations/${params.conversationId}`;
  const subject = `【${SITE.name}】先生から返信が届きました`;
  const preview = params.preview.slice(0, 200);

  const text = [
    `${params.studentName} 様`,
    "",
    `${params.teacherName} 先生から事前相談への返信が届きました。`,
    "",
    "内容（抜粋）:",
    preview,
    "",
    "確認する:",
    url,
  ].join("\n");

  const html = [
    `<p>${escapeHtml(params.studentName)} 様</p>`,
    `<p>${escapeHtml(params.teacherName)} 先生から事前相談への返信が届きました。</p>`,
    `<p style="color:#666;margin-bottom:4px;">内容（抜粋）:</p>`,
    `<p style="white-space:pre-wrap;">${nl2br(escapeHtml(preview))}</p>`,
    `<p><a href="${url}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;">確認する</a></p>`,
  ].join("");

  return sendEmail({ to: params.to, subject, text, html });
}

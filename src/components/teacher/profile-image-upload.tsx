"use client";

import { useRef, useState } from "react";
import { uploadProfileImageAction } from "@/app/(teacher)/profile/upload-image-action";
import { FormField } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ProfileImageUploadProps {
  /** 現在の画像 URL（DB 保存済み） */
  value: string;
  /** アップロード成功時にフォームへ反映 */
  onChange: (url: string) => void;
  /** フィールドエラー（公開時の必須チェック等） */
  fieldError?: string;
  disabled?: boolean;
}

/**
 * プロフィール写真のアップロード UI
 * スマホ・PC からファイル選択し、R2 へ保存後に URL を親フォームへ渡します。
 */
export function ProfileImageUpload({
  value,
  onChange,
  fieldError,
  disabled = false,
}: ProfileImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displayUrl = previewUrl ?? (value.trim() || null);

  async function handleFileChange(file: File | undefined) {
    if (!file) return;

    setUploadError(null);
    setUploading(true);

    // ローカルプレビュー（アップロード完了まで表示）
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadProfileImageAction(formData);

    URL.revokeObjectURL(objectUrl);

    if (result.success) {
      onChange(result.url);
      setPreviewUrl(result.url);
      setUploadError(null);
    } else {
      setPreviewUrl(value.trim() || null);
      setUploadError(result.error);
    }

    setUploading(false);
  }

  return (
    <FormField>
      <Label htmlFor="profileImageFile">プロフィール写真</Label>

      {displayUrl ? (
        // R2 公開 URL またはローカルプレビュー
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displayUrl}
          alt="プロフィール写真プレビュー"
          className="mb-3 h-24 w-24 rounded-full border border-border object-cover"
        />
      ) : (
        <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-border bg-surface text-xs text-muted">
          未設定
        </div>
      )}

      <input
        ref={inputRef}
        id="profileImageFile"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="user"
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(e) => {
          void handleFileChange(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "アップロード中..." : displayUrl ? "写真を変更" : "写真を選択"}
        </Button>
      </div>

      <p className="mt-2 text-xs text-muted">
        JPEG・PNG・WebP形式、5MB以内。スマホではカメラ撮影も利用できます。
      </p>

      {uploadError && (
        <p role="alert" className="mt-2 text-sm text-accent">
          {uploadError}
        </p>
      )}
      {fieldError && (
        <p role="alert" className="mt-2 text-sm text-accent">
          {fieldError}
        </p>
      )}
    </FormField>
  );
}

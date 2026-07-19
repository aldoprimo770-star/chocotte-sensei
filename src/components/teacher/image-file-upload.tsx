"use client";

import { useEffect, useRef, useState } from "react";
import { FormField } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export type ImageUploadActionResult =
  | { success: true; url: string }
  | { success: false; error: string };

interface ImageFileUploadProps {
  /** 現在の保存値（公開 URL または内部参照） */
  value: string;
  /** アップロード成功時に親フォームへ反映 */
  onChange: (url: string) => void;
  /** Server Action（FormData に file を載せて呼ぶ） */
  uploadAction: (formData: FormData) => Promise<ImageUploadActionResult>;
  label: string;
  inputId: string;
  /**
   * value を img src として使えるか。
   * 本人確認の内部参照（r2:…）は false にし、ローカルプレビューのみ表示する。
   */
  canPreviewValue?: boolean;
  helpText?: string;
  selectLabel?: string;
  changeLabel?: string;
  previewVariant?: "avatar" | "document";
  fieldError?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * 画像ファイル選択・アップロード UI（プロフィール写真 / 本人確認書類で共用）
 */
export function ImageFileUpload({
  value,
  onChange,
  uploadAction,
  label,
  inputId,
  canPreviewValue = true,
  helpText,
  selectLabel = "ファイルを選択",
  changeLabel = "画像を変更",
  previewVariant = "avatar",
  fieldError,
  disabled = false,
  required = false,
}: ImageFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const localPreviewRef = useRef<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  function clearLocalPreview() {
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = null;
    }
    setLocalPreview(null);
  }

  useEffect(() => {
    return () => {
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
      }
    };
  }, []);

  const storedPreview =
    canPreviewValue && value.trim() ? value.trim() : null;
  const displayUrl = localPreview ?? storedPreview;

  async function handleFileChange(file: File | undefined) {
    if (!file) return;

    setUploadError(null);
    setUploading(true);

    clearLocalPreview();
    const objectUrl = URL.createObjectURL(file);
    localPreviewRef.current = objectUrl;
    setLocalPreview(objectUrl);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadAction(formData);

    if (result.success) {
      onChange(result.url);
      if (canPreviewValue) {
        clearLocalPreview();
      }
      // canPreviewValue=false のときはローカルプレビューを残す
      setUploadError(null);
    } else {
      clearLocalPreview();
      setUploadError(result.error);
    }

    setUploading(false);
  }

  const previewClass =
    previewVariant === "avatar"
      ? "mb-3 h-24 w-24 rounded-full border border-border object-cover"
      : "mb-3 max-h-56 w-full max-w-sm rounded-xl border border-border object-contain bg-surface";

  const emptyClass =
    previewVariant === "avatar"
      ? "mb-3 flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-border bg-surface text-xs text-muted"
      : "mb-3 flex h-40 max-w-sm items-center justify-center rounded-xl border border-dashed border-border bg-surface text-xs text-muted";

  return (
    <FormField>
      <Label htmlFor={inputId} required={required}>
        {label}
      </Label>

      {displayUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displayUrl}
          alt={`${label}プレビュー`}
          className={previewClass}
        />
      ) : (
        <div className={emptyClass}>未設定</div>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
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
          {uploading
            ? "アップロード中..."
            : displayUrl
              ? changeLabel
              : selectLabel}
        </Button>
      </div>

      {helpText && <p className="mt-2 text-xs text-muted">{helpText}</p>}

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

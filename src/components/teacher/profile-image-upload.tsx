"use client";

import { uploadProfileImageAction } from "@/app/(teacher)/profile/upload-image-action";
import { ImageFileUpload } from "@/components/teacher/image-file-upload";

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
  return (
    <ImageFileUpload
      value={value}
      onChange={onChange}
      uploadAction={uploadProfileImageAction}
      label="プロフィール写真"
      inputId="profileImageFile"
      canPreviewValue
      previewVariant="avatar"
      selectLabel="写真を選択"
      changeLabel="写真を変更"
      helpText="JPEG・PNG・WebP形式、5MB以内。スマホではカメラ撮影・フォトライブラリから選択できます。"
      fieldError={fieldError}
      disabled={disabled}
    />
  );
}

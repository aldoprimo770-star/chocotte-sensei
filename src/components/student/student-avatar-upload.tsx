"use client";

import { uploadStudentAvatarAction } from "@/app/(student)/mypage/upload-avatar-action";
import { ImageFileUpload } from "@/components/teacher/image-file-upload";

interface StudentAvatarUploadProps {
  value: string;
  onChange: (url: string) => void;
  fieldError?: string;
  disabled?: boolean;
}

/**
 * 生徒プロフィール画像のアップロード UI
 * 先生プロフィール画像と同じ ImageFileUpload + R2 アップロードを利用します。
 */
export function StudentAvatarUpload({
  value,
  onChange,
  fieldError,
  disabled = false,
}: StudentAvatarUploadProps) {
  return (
    <ImageFileUpload
      value={value}
      onChange={onChange}
      uploadAction={uploadStudentAvatarAction}
      label="プロフィール画像"
      inputId="studentAvatarFile"
      canPreviewValue
      previewVariant="avatar"
      selectLabel="ファイルを選択"
      changeLabel="画像を変更"
      helpText="JPEG・PNG・WebP形式、5MB以内。スマホではカメラ撮影・フォトライブラリから選択できます。"
      fieldError={fieldError}
      disabled={disabled}
    />
  );
}

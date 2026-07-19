"use client";

import { uploadIdentityDocumentAction } from "@/app/(teacher)/verification/upload-document-action";
import { ImageFileUpload } from "@/components/teacher/image-file-upload";

interface IdentityDocumentUploadProps {
  /** 内部参照（r2:…）または旧外部 URL。プレビューには使わない */
  value: string;
  onChange: (ref: string) => void;
  fieldError?: string;
  disabled?: boolean;
}

/**
 * 本人確認書類のアップロード UI（プロフィール画像と同じ方式）
 * アップロード後はローカルプレビューのみ表示し、公開 URL は発行しない。
 */
export function IdentityDocumentUpload({
  value,
  onChange,
  fieldError,
  disabled = false,
}: IdentityDocumentUploadProps) {
  return (
    <ImageFileUpload
      value={value}
      onChange={onChange}
      uploadAction={uploadIdentityDocumentAction}
      label="本人確認書類の画像"
      inputId="identityDocumentFile"
      canPreviewValue={false}
      previewVariant="document"
      selectLabel="ファイルを選択"
      changeLabel="画像を変更"
      helpText="JPEG・PNG・WebP形式、10MB以内。提出画像は管理者のみが確認します。公開ページ・先生本人のプロフィールには表示されません。"
      fieldError={fieldError}
      disabled={disabled}
      required
    />
  );
}

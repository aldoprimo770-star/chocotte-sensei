/** SiteSetting に保存する特商法・事業者情報のキー */
export const OPERATOR_LEGAL_SETTING_KEY = "operator_legal_info";

/** 住所・電話の公開方針。未設定時は必ず請求時開示 */
export const ADDRESS_PHONE_DISCLOSURE_MODES = ["on_request", "public"] as const;
export type AddressPhoneDisclosure =
  (typeof ADDRESS_PHONE_DISCLOSURE_MODES)[number];

/** 管理者画面で保存する事業者情報（住所・電話の実値を含む） */
export interface OperatorLegalInfo {
  legalName: string;
  email: string;
  address: string;
  phone: string;
  addressPhoneDisclosure: AddressPhoneDisclosure;
}

/** 公開ページ用。請求時開示では住所・電話の実値を持たない */
export interface OperatorLegalPublic {
  legalName: string;
  legalNameDisplay: string;
  isLegalNameSet: boolean;
  email: string;
  hasPublicEmail: boolean;
  contactDisplay: string;
  serviceName: string;
  addressPhoneDisclosure: AddressPhoneDisclosure;
  /** disclosure が public かつ入力があるときのみ */
  publicAddress: string | null;
  publicPhone: string | null;
}

export const EMPTY_OPERATOR_LEGAL_INFO: OperatorLegalInfo = {
  legalName: "",
  email: "",
  address: "",
  phone: "",
  addressPhoneDisclosure: "on_request",
};

export const LEGAL_NAME_UNSET_LABEL = "（未設定）";
export const CONTACT_FORM_FALLBACK =
  "サイト内のお問い合わせフォームよりご連絡ください";

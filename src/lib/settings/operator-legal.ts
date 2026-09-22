import { getDb } from "@/lib/db";
import { SITE } from "@/constants/site";
import {
  ADDRESS_PHONE_DISCLOSURE_MODES,
  CONTACT_FORM_FALLBACK,
  EMPTY_OPERATOR_LEGAL_INFO,
  LEGAL_NAME_UNSET_LABEL,
  OPERATOR_LEGAL_SETTING_KEY,
  type AddressPhoneDisclosure,
  type OperatorLegalInfo,
  type OperatorLegalPublic,
} from "@/constants/operator-legal";

function parseDisclosure(value: unknown): AddressPhoneDisclosure {
  if (
    typeof value === "string" &&
    (ADDRESS_PHONE_DISCLOSURE_MODES as readonly string[]).includes(value)
  ) {
    return value as AddressPhoneDisclosure;
  }
  return "on_request";
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** JSON から既知フィールドだけを読む。未知キーは捨て、未設定は請求時開示 */
export function parseOperatorLegalInfo(value: unknown): OperatorLegalInfo {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...EMPTY_OPERATOR_LEGAL_INFO };
  }
  const v = value as Record<string, unknown>;
  return {
    legalName: asTrimmedString(v.legalName),
    email: asTrimmedString(v.email),
    address: asTrimmedString(v.address),
    phone: asTrimmedString(v.phone),
    addressPhoneDisclosure: parseDisclosure(v.addressPhoneDisclosure),
  };
}

function toPublicView(info: OperatorLegalInfo): OperatorLegalPublic {
  const legalName = info.legalName.trim();
  const email = info.email.trim();
  const isPublic = info.addressPhoneDisclosure === "public";
  return {
    legalName,
    legalNameDisplay: legalName || LEGAL_NAME_UNSET_LABEL,
    isLegalNameSet: Boolean(legalName),
    email,
    hasPublicEmail: Boolean(email),
    contactDisplay: email || CONTACT_FORM_FALLBACK,
    serviceName: SITE.name,
    addressPhoneDisclosure: isPublic ? "public" : "on_request",
    publicAddress: isPublic && info.address.trim() ? info.address.trim() : null,
    publicPhone: isPublic && info.phone.trim() ? info.phone.trim() : null,
  };
}

/**
 * 管理者用。住所・電話の実値を含む。
 * 公開ページからは呼ばないこと。
 */
export async function getOperatorLegalInfoAdmin(): Promise<OperatorLegalInfo> {
  const row = await getDb().siteSetting.findUnique({
    where: { key: OPERATOR_LEGAL_SETTING_KEY },
    select: { value: true },
  });
  return parseOperatorLegalInfo(row?.value);
}

/**
 * 公開用。請求時開示では住所・電話の実値を返さない。
 */
export async function getOperatorLegalInfoPublic(): Promise<OperatorLegalPublic> {
  const admin = await getOperatorLegalInfoAdmin();
  return toPublicView(admin);
}

/** 管理者専用。呼び出し側で権限チェックすること */
export async function saveOperatorLegalInfo(
  input: OperatorLegalInfo,
): Promise<OperatorLegalInfo> {
  const cleaned = parseOperatorLegalInfo(input);
  await getDb().siteSetting.upsert({
    where: { key: OPERATOR_LEGAL_SETTING_KEY },
    create: {
      key: OPERATOR_LEGAL_SETTING_KEY,
      value: cleaned as unknown as object,
    },
    update: { value: cleaned as unknown as object },
  });
  return cleaned;
}

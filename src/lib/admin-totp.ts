import { generateSecret, verifySync, generateURI } from "otplib";
import QRCode from "qrcode";

const APP_NAME = "FGS Admin";

export function createTotpSecret(): string {
  return generateSecret();
}

export function verifyTotpCode(secret: string, code: string): boolean {
  const normalized = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(normalized)) return false;
  try {
    return verifySync({ secret, token: normalized, epochTolerance: 1 }).valid;
  } catch {
    return false;
  }
}

export function buildTotpUri(email: string, secret: string): string {
  return generateURI({
    issuer: APP_NAME,
    label: email,
    secret,
  });
}

export async function buildTotpQrDataUrl(email: string, secret: string): Promise<string> {
  const uri = buildTotpUri(email, secret);
  return QRCode.toDataURL(uri, { margin: 1, width: 220 });
}

import { createHmac, timingSafeEqual } from "crypto";

function getSecret(): string | null {
  return process.env.NEXTAUTH_SECRET?.trim() || null;
}

export function signAdminToken<T extends Record<string, unknown>>(
  payload: T,
  maxAgeSeconds: number
): string {
  const body = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  };
  const encoded = Buffer.from(JSON.stringify(body)).toString("base64url");
  const secret = getSecret();
  if (!secret) throw new Error("NEXTAUTH_SECRET is not configured");
  const sig = createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyAdminToken<T extends Record<string, unknown>>(
  token: string
): (T & { exp: number }) | null {
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;

  const secret = getSecret();
  if (!secret) return null;
  const expected = createHmac("sha256", secret).update(encoded).digest("base64url");
  try {
    if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as T & { exp: number };
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

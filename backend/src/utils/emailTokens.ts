// Tokens firmados para los links de los correos (desuscribirse sin iniciar sesión).
// No vencen: un link de un correo viejo debe seguir funcionando.
import jwt from "jsonwebtoken";
import config from "./config";
import logger from "./logger";

const UNSUBSCRIBE_PURPOSE = "unsubscribe:price-drops";
const DEV_SECRET = "solo-para-desarrollo-no-usar-en-produccion";

let warnedDevSecret = false;

/** Secreto para firmar; en desarrollo hay uno fijo, en producción es obligatorio EMAIL_TOKEN_SECRET. */
export function getEmailTokenSecret(): string | null {
  if (process.env.EMAIL_TOKEN_SECRET) return process.env.EMAIL_TOKEN_SECRET;
  if (config.IS_PRODUCTION_DB) return null;
  if (!warnedDevSecret) {
    logger.info("EMAIL_TOKEN_SECRET no está definido: usando un secreto de desarrollo para los links de correo");
    warnedDevSecret = true;
  }
  return DEV_SECRET;
}

export function signUnsubscribeToken(userId: string): string {
  const secret = getEmailTokenSecret();
  if (!secret) throw new Error("Falta EMAIL_TOKEN_SECRET para firmar los links de desuscripción");
  return jwt.sign({ sub: userId, purpose: UNSUBSCRIBE_PURPOSE }, secret, { algorithm: "HS256" });
}

/** Devuelve el id del usuario si el token es válido para desuscribirse, o null. */
export function verifyUnsubscribeToken(token: unknown): string | null {
  const secret = getEmailTokenSecret();
  if (!secret || typeof token !== "string" || !token) return null;
  try {
    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] }) as jwt.JwtPayload;
    return payload.purpose === UNSUBSCRIBE_PURPOSE && typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

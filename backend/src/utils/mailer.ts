// Envío de correos. Render gratis bloquea SMTP (puertos 25/465/587), así que en producción
// se usa la API HTTPS de Brevo. Sin BREVO_API_KEY se usa Ethereal (correos de prueba que no
// llegan a nadie; la consola muestra un link para verlos).
import axios from "axios";
import nodemailer, { type Transporter } from "nodemailer";
import logger from "./logger";

export type EmailMessage = {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
};

export type SendResult = { messageId?: string; previewUrl?: string };

export type MailerMode = "brevo" | "ethereal";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

export const getMailerMode = (): MailerMode => (process.env.BREVO_API_KEY ? "brevo" : "ethereal");

/** "SoloRopa <alertas@dominio.cl>" o "alertas@dominio.cl" → { name, email } */
export function parseSender(value: string | undefined): { name?: string; email: string } | null {
  const raw = (value || "").trim();
  if (!raw) return null;
  const match = raw.match(/^(.*)<([^>]+)>$/);
  if (match) {
    const name = match[1].trim().replace(/^"|"$/g, "");
    return { name: name || undefined, email: match[2].trim() };
  }
  return { email: raw };
}

async function sendWithBrevo(message: EmailMessage): Promise<SendResult> {
  const sender = parseSender(process.env.MAIL_FROM);
  if (!sender) throw new Error("Falta MAIL_FROM (remitente verificado en Brevo)");

  try {
    const res = await axios.post(
      BREVO_URL,
      {
        sender,
        to: [{ email: message.to, ...(message.toName ? { name: message.toName } : {}) }],
        subject: message.subject,
        htmlContent: message.html,
        textContent: message.text,
        ...(message.headers ? { headers: message.headers } : {}),
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY as string,
          "content-type": "application/json",
          accept: "application/json",
        },
        timeout: 15000,
      }
    );
    return { messageId: res.data?.messageId };
  } catch (err: any) {
    // El error de axios incluye los headers del request (con la API key): nunca relanzarlo tal cual.
    const status = err?.response?.status;
    const detail = err?.response?.data?.message || err?.code || "error desconocido";
    throw new Error(`Brevo rechazó el envío${status ? ` (HTTP ${status})` : ""}: ${detail}`);
  }
}

let etherealTransport: Promise<Transporter> | null = null;

function getEtherealTransport() {
  etherealTransport ??= nodemailer.createTestAccount().then((account) =>
    nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: { user: account.user, pass: account.pass },
    })
  );
  return etherealTransport;
}

async function sendWithEthereal(message: EmailMessage): Promise<SendResult> {
  const transport = await getEtherealTransport();
  const info = await transport.sendMail({
    from: process.env.MAIL_FROM || '"SoloRopa" <no-reply@soloropa.test>',
    to: message.toName ? `"${message.toName}" <${message.to}>` : message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
    headers: message.headers,
  });
  const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
  logger.info(`Correo de prueba (Ethereal) para ${message.to}: ${previewUrl}`);
  return { messageId: info.messageId, previewUrl };
}

export async function sendEmail(message: EmailMessage): Promise<SendResult> {
  return getMailerMode() === "brevo" ? sendWithBrevo(message) : sendWithEthereal(message);
}

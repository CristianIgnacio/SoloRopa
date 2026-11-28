// Correo "bajaron tus favoritos". HTML con estilos en línea y tablas (los clientes de correo
// ignoran casi todo el CSS) y versión en texto plano. Los títulos vienen de las tiendas: se escapan.
import type { DigestItem } from "../utils/priceAlerts";

export type PriceDropEmailInput = {
  username: string;
  items: DigestItem[];   // ya recortados (DIGEST_MAX_ITEMS)
  extraCount: number;    // cuántos más bajaron y no caben en el correo
  frontendUrl: string;
  unsubscribeUrl: string;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const clp = (value: number) => `$${value.toLocaleString("es-CL")}`;

const truncate = (value: string, max: number) => (value.length > max ? `${value.slice(0, max - 1)}…` : value);

const FONT = "font-family:Arial,Helvetica,sans-serif;";

export function priceDropSubject(items: DigestItem[], extraCount: number): string {
  const total = items.length + extraCount;
  return total === 1
    ? `Bajó de precio: ${truncate(items[0].title, 60)}`
    : `${total} de tus favoritos bajaron de precio`;
}

function itemHtml(item: DigestItem, frontendUrl: string): string {
  const url = escapeHtml(`${frontendUrl}/producto/${item.productId}`);
  const image = item.imageUrl
    ? `<td width="96" valign="top" style="padding-right:16px">
         <a href="${url}"><img src="${escapeHtml(item.imageUrl)}" width="96" height="120" alt=""
           style="display:block;width:96px;height:120px;object-fit:cover;border:2px solid #000000"></a>
       </td>`
    : "";
  const lowest = item.isLowest30d
    ? `<div style="margin-top:8px"><span style="${FONT}background:#4ade80;color:#000000;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;padding:3px 6px">Mínimo en 30 días</span></div>`
    : "";

  return `
  <tr><td style="padding:20px 0;border-bottom:2px solid #000000">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
      ${image}
      <td valign="top" style="${FONT}">
        ${item.brandName ? `<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#64748b">${escapeHtml(item.brandName)}</div>` : ""}
        <div style="font-size:16px;font-weight:bold;color:#000000;margin:4px 0 10px">${escapeHtml(item.title)}</div>
        <div>
          <span style="font-size:14px;color:#64748b;text-decoration:line-through">${clp(item.oldPrice)}</span>
          &nbsp;<span style="font-size:20px;font-weight:bold;color:#000000">${clp(item.newPrice)}</span>
          &nbsp;<span style="background:#facc15;color:#000000;font-size:12px;font-weight:bold;padding:3px 6px">-${item.percent}%</span>
        </div>
        ${lowest}
        <div style="margin-top:14px">
          <a href="${url}" style="display:inline-block;background:#000000;color:#ffffff;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;padding:10px 16px;text-decoration:none">Ver producto</a>
        </div>
      </td>
    </tr></table>
  </td></tr>`;
}

export function renderPriceDropEmail(input: PriceDropEmailInput): { subject: string; html: string; text: string } {
  const { username, items, extraCount, frontendUrl, unsubscribeUrl } = input;
  const total = items.length + extraCount;
  const subject = priceDropSubject(items, extraCount);
  const intro = total === 1
    ? "Bajó el precio de un producto que guardaste en favoritos."
    : `Bajó el precio de ${total} productos que guardaste en favoritos.`;
  const first = items[0];
  const preheader = `${truncate(first.title, 50)}: ahora ${clp(first.newPrice)} (-${first.percent}%)`;
  const favoritesUrl = `${frontendUrl}/favorites`;
  const settingsUrl = `${frontendUrl}/profile/edit`;

  const extra = extraCount > 0
    ? `<tr><td style="${FONT}padding:20px 0;font-size:14px;color:#000000">
         Y ${extraCount} ${extraCount === 1 ? "producto más bajó" : "productos más bajaron"} de precio.
         <a href="${escapeHtml(favoritesUrl)}" style="color:#000000;font-weight:bold">Ver mis favoritos</a>
       </td></tr>`
    : "";

  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f5"><tr><td align="center" style="padding:24px 12px">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border:3px solid #000000">
      <tr><td style="${FONT}background:#000000;color:#ffffff;padding:16px 24px;font-size:20px;font-weight:bold;letter-spacing:1px">SOLOROPA</td></tr>
      <tr><td style="padding:24px 24px 8px">
        <div style="${FONT}font-size:22px;font-weight:bold;color:#000000;text-transform:uppercase">Hola ${escapeHtml(username)}</div>
        <div style="${FONT}font-size:15px;color:#334155;margin-top:8px">${intro}</div>
      </td></tr>
      <tr><td style="padding:0 24px">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${items.map((item) => itemHtml(item, frontendUrl)).join("")}
          ${extra}
        </table>
      </td></tr>
      <tr><td style="${FONT}padding:20px 24px 24px;font-size:12px;line-height:18px;color:#64748b">
        Recibes este correo porque guardaste estos productos en favoritos en SoloRopa. Los precios son los que vimos
        al revisar la tienda y pueden cambiar.<br>
        <a href="${escapeHtml(unsubscribeUrl)}" style="color:#64748b">Dejar de recibir estos avisos</a>
        &nbsp;·&nbsp;<a href="${escapeHtml(settingsUrl)}" style="color:#64748b">Administrar avisos</a>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  const textItems = items.map((item) => [
    `- ${item.brandName ? `${item.brandName} · ` : ""}${item.title}`,
    `  ${clp(item.oldPrice)} → ${clp(item.newPrice)} (-${item.percent}%)${item.isLowest30d ? " · Mínimo en 30 días" : ""}`,
    `  ${frontendUrl}/producto/${item.productId}`,
  ].join("\n"));

  const text = [
    `Hola ${username},`,
    "",
    intro,
    "",
    ...textItems,
    ...(extraCount > 0 ? ["", `Y ${extraCount} más. Ver mis favoritos: ${favoritesUrl}`] : []),
    "",
    "Recibes este correo porque guardaste estos productos en favoritos en SoloRopa.",
    `Dejar de recibir estos avisos: ${unsubscribeUrl}`,
    `Administrar avisos: ${settingsUrl}`,
  ].join("\n");

  return { subject, html, text };
}

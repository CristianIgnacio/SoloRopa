// Scrapea todas las marcas conectándose directo a MongoDB, sin pasar por el servidor web.
// Después recalcula priceStats y envía los avisos de bajada de precio del día.
// Lo usa el cron diario de GitHub Actions (.github/workflows/scrape.yml).
//
// npm run scrape:all
//
// Termina con código 1 si falló alguna marca o algún correo, para que Actions marque la corrida en rojo.
import fs from "node:fs";
import mongoose from "mongoose";
import config from "../../utils/config";
import { runAllScrapers, type ScrapeFeedItem } from "..";
import { refreshRecentPriceStats } from "../../services/priceHistory";
import { sendPendingPriceAlerts, type PriceAlertRunStats } from "../../services/priceAlerts";

function describeAlerts(alerts: PriceAlertRunStats): string {
  if (alerts.blocked) return `Avisos de precio: sin enviar (${alerts.blocked}).`;
  return `Avisos de precio (${alerts.mode}): ${alerts.emailsSent} correos a ${alerts.users} usuarios` +
    ` · ${alerts.alertsSent} avisos enviados · ${alerts.alertsSkipped} descartados · ${alerts.alertsExpired} vencidos` +
    (alerts.emailsFailed ? ` · ${alerts.emailsFailed} correos fallidos` : "");
}

// En GitHub Actions, el resumen aparece en la página de la corrida.
function writeStepSummary(feed: ScrapeFeedItem[], total: number, seconds: number, statsRefreshed: number, alerts: PriceAlertRunStats) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;

  const rows = feed.map((f) =>
    `| ${f.brand} | ${f.success ? "✅" : "❌"} | ${f.count} | ${f.priceChanges} | ${(f.error ?? "").replace(/\|/g, "\\|")} |`
  );
  const markdown = [
    `## Scraping: ${total} productos en ${seconds}s`,
    "",
    "| Marca | Estado | Productos | Cambios de precio | Error |",
    "|---|---|---|---|---|",
    ...rows,
    "",
    `priceStats recalculado en ${statsRefreshed} productos.`,
    "",
    describeAlerts(alerts),
    "",
  ].join("\n");

  fs.appendFileSync(summaryPath, markdown);
}

async function main() {
  if (!config.MONGODB_URI) throw new Error("Falta la URI de MongoDB (MONGODB_URI o MONGODB_URI_LOCAL)");

  await mongoose.connect(config.MONGODB_URI, { dbName: config.MONGODB_DBNAME });
  console.log(`Conectado a ${config.MONGODB_DBNAME}`);

  const startedAt = Date.now();
  const { total, feed } = await runAllScrapers();
  // La etiqueta "precio más bajo en 30 días" también cambia con el paso del tiempo, sin scrape.
  const statsRefreshed = await refreshRecentPriceStats();
  // Va después de priceStats para que el correo muestre la etiqueta de 30 días al día.
  const alerts = await sendPendingPriceAlerts();
  const seconds = Math.round((Date.now() - startedAt) / 1000);

  console.table(feed.map(({ brand, success, count, priceChanges, error }) => ({ brand, success, count, priceChanges, error: error ?? "" })));
  console.log(`Total: ${total} productos en ${seconds}s · priceStats recalculado en ${statsRefreshed} productos`);
  console.log(describeAlerts(alerts));
  for (const url of alerts.previewUrls) console.log(`  Vista previa: ${url}`);
  writeStepSummary(feed, total, seconds, statsRefreshed, alerts);

  const failed = feed.filter((f) => !f.success);
  if (failed.length) {
    console.error(`Fallaron ${failed.length} marca(s): ${failed.map((f) => f.brand).join(", ")}`);
    process.exitCode = 1;
  }
  if (alerts.emailsFailed) process.exitCode = 1;
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

const detectPlatform = (html: string): "shopify" | "woocommerce" | "jumpseller" | "unknown" => {
  const h = html.toLowerCase();
  if (h.includes("cdn.shopify.com") || h.includes("window.shopify") || h.includes("/collections/")) return "shopify";
  if (h.includes("woocommerce") || h.includes("wp-content")) return "woocommerce";
  if (h.includes("jumpseller")) return "jumpseller";
  return "unknown";
}

export default detectPlatform
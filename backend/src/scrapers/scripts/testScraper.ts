import scrapeWooCommerceBase from "../platforms/woocommerce";

const test = async () => {
  const result = await scrapeWooCommerceBase("https://subcomplot.cl");
  console.log("First product mapped TITLE:");
  console.log(result[0].title);
  console.log("First product mapped VARIANTS:");
  console.log(JSON.stringify(result[0].variants, null, 2));
}
test();

const fs = require('fs');
let content = fs.readFileSync('src/lib/products.ts', 'utf8');

const formatPriceFunc = `
export function formatPrice(price: number, currency: Currency): string {
  const symbols: Record<string, string> = {
    LYD: "د.ل",
    USD: "$",
    EUR: "€",
  };
  return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + symbols[currency];
}
`;

if (!content.includes('export function formatPrice')) {
  fs.writeFileSync('src/lib/products.ts', content + formatPriceFunc);
  console.log('Appended formatPrice');
}

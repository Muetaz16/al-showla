const fs = require('fs');

const raw = fs.readFileSync('raw_products.txt', 'utf-8');
const lines = raw.split('\n').filter(l => l.trim() !== '');

// Skip header
const dataLines = lines.slice(1);

const products = dataLines.map((line, idx) => {
  const parts = line.split('\t');
  if (parts.length < 9) return null;
  
  const wholesale = parseFloat(parts[0]);
  const retail = parseFloat(parts[1]);
  const unit = parts[2].trim();
  const quantity = parseFloat(parts[3]) || 0;
  const packageCount = parts[4].trim();
  const partNumber = parts[5].trim();
  const nameEn = parts[6].trim();
  const nameAr = parts[7].trim();
  const idNumber = parts[8].trim();

  // Generate an ID
  const id = `pt-new-${idNumber || idx}`;

  const cleanNameAr = nameAr.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const cleanNameEn = nameEn ? nameEn.replace(/\\/g, '\\\\').replace(/"/g, '\\"') : cleanNameAr;

  return `
  {
    id: "${id}",
    categoryId: "tools", // Categorize as tools by default based on the items
    brand: "General",
    imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80",
    priceBase: ${retail},
    wholesalePrice: ${wholesale},
    inStock: true,
    stockCount: ${quantity},
    rating: 4.5,
    reviewCount: Math.floor(Math.random() * 50) + 1,
    certificates: [],
    nameAr: "${cleanNameAr}",
    nameEn: "${cleanNameEn}",
    descriptionAr: "منتج ذو جودة عالية للاستخدام المهني والصناعي.",
    descriptionEn: "High-quality product for professional and industrial use.",
    unit: "${unit}",
    specAr: ["كمية العبوة: ${packageCount}", "رقم القطعة: ${partNumber}"],
    specEn: ["Package Quantity: ${packageCount}", "Part Number: ${partNumber}"],
  }`;
}).filter(p => p !== null);

const output = `export const NEW_PRODUCTS: Product[] = [${products.join(',\n')}];\n`;

fs.writeFileSync('generated_products.ts', output);
console.log('Done generating ' + products.length + ' products.');


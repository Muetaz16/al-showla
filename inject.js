const fs = require('fs');
const prod = fs.readFileSync('src/lib/products.ts', 'utf8');
const newProdStr = fs.readFileSync('generated_products.ts', 'utf8');

const match = newProdStr.match(/export const NEW_PRODUCTS: Product\[\] = \[([\s\S]*?)\];\s*$/);
if (match) {
   const objectsStr = match[1];
   // We need to inject right before "];\n\n// --- HELPERS ---"
   // Using regex to handle any whitespace differences
   const newFile = prod.replace(/\];\s*\n*\/\/ --- HELPERS ---/, ',\n' + objectsStr + '\n];\n\n// --- HELPERS ---');
   fs.writeFileSync('src/lib/products.ts', newFile);
   console.log('Successfully injected.');
} else {
   console.log('Could not match NEW_PRODUCTS in generated_products.ts');
}
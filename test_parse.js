const fs = require('fs');

async function run() {
  try {
     // I'll just regex parse the file since it's much safer than risking Node module resolution errors with TS.
     let content = fs.readFileSync('./src/lib/products.ts', 'utf-8');
     
     // Extract the array using regex
     // We look for export const PRODUCTS: Product[] = [ ... ];
     const match = content.match(/export const PRODUCTS: Product\[\] = (\[[\s\S]*\]);/);
     if (!match) {
         console.log("Could not find PRODUCTS array.");
         return;
     }
     
     // Evaluate the array! This is safe because it's local trusted code and just an object literal.
     // To eval it safely we need to mock any imported constants if they exist. But wait, it uses CURRENCY_SYMBOLS? No, the products array is just static JSON.
     let productsArray;
     try {
        productsArray = eval(match[1]);
     } catch (err) {
        console.log("Eval failed:", err.message);
        return;
     }
     console.log("Parsed products:", productsArray.length);
  } catch (e) {
     console.error(e);
  }
}
run();

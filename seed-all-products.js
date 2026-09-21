// Direct Firestore seeder - seeds all products bypassing Next.js
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && key.trim()) env[key.trim()] = vals.join('=').trim().replace(/^"|"$/g, '');
});

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: 'alshola-b7aa3',
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const db = getFirestore();

// Parse products.ts - extract each product object block using a simple state machine
function parseProducts(content) {
  const products = [];
  
  // Find the start of PRODUCTS array
  const startIdx = content.indexOf('export const PRODUCTS: Product[] = [');
  if (startIdx === -1) return products;
  
  // Find the end of PRODUCTS array (before helpers)
  const endIdx = content.indexOf('// --- HELPERS ---');
  const arrayContent = content.substring(startIdx, endIdx);
  
  // Find each product by matching id: "..." pattern
  const idRegex = /id:\s*"([^"]+)"/g;
  const nameArRegex = /nameAr:\s*"([^"]+)"/;
  const nameEnRegex = /nameEn:\s*"([^"]+)"/;
  const priceRegex = /priceBase:\s*([0-9.]+)/;
  const wholesaleRegex = /wholesalePrice:\s*([0-9.]+)/;
  const categoryRegex = /categoryId:\s*"([^"]+)"/;
  const brandRegex = /brand:\s*"([^"]+)"/;
  const imageRegex = /imageUrl:\s*"([^"]+)"/;
  const inStockRegex = /inStock:\s*(true|false)/;
  const stockCountRegex = /stockCount:\s*([0-9]+)/;
  const ratingRegex = /rating:\s*([0-9.]+)/;
  const unitRegex = /unit:\s*"([^"]+)"/;
  
  let match;
  while ((match = idRegex.exec(arrayContent)) !== null) {
    const id = match[1];
    // Find this product's block
    const blockStart = arrayContent.lastIndexOf('{', match.index);
    // Find the closing brace
    let depth = 0;
    let blockEnd = blockStart;
    for (let i = blockStart; i < arrayContent.length; i++) {
      if (arrayContent[i] === '{') depth++;
      else if (arrayContent[i] === '}') {
        depth--;
        if (depth === 0) { blockEnd = i; break; }
      }
    }
    
    const block = arrayContent.substring(blockStart, blockEnd + 1);
    
    const nameArM = block.match(nameArRegex);
    const nameEnM = block.match(nameEnRegex);
    const priceM = block.match(priceRegex);
    const wholesaleM = block.match(wholesaleRegex);
    const categoryM = block.match(categoryRegex);
    const brandM = block.match(brandRegex);
    const imageM = block.match(imageRegex);
    const inStockM = block.match(inStockRegex);
    const stockCountM = block.match(stockCountRegex);
    const ratingM = block.match(ratingRegex);
    const unitM = block.match(unitRegex);
    
    if (nameArM && priceM && categoryM) {
      products.push({
        id,
        nameAr: nameArM[1],
        nameEn: nameEnM ? nameEnM[1] : nameArM[1],
        priceBase: parseFloat(priceM[1]),
        wholesalePrice: wholesaleM ? parseFloat(wholesaleM[1]) : undefined,
        categoryId: categoryM[1],
        brand: brandM ? brandM[1] : 'General',
        imageUrl: imageM ? imageM[1] : 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80',
        inStock: inStockM ? inStockM[1] === 'true' : true,
        stockCount: stockCountM ? parseInt(stockCountM[1]) : 50,
        rating: ratingM ? parseFloat(ratingM[1]) : 4.5,
        reviewCount: Math.floor(Math.random() * 50) + 1,
        certificates: [],
        descriptionAr: 'منتج ذو جودة عالية للاستخدام المهني والصناعي.',
        descriptionEn: 'High-quality product for professional and industrial use.',
        unit: unitM ? unitM[1] : 'قطعة',
        specAr: [],
        specEn: [],
      });
    }
  }
  
  return products;
}

async function main() {
  try {
    const content = fs.readFileSync('src/lib/products.ts', 'utf8');
    const products = parseProducts(content);
    console.log(`Parsed ${products.length} products from products.ts`);
    
    if (products.length === 0) {
      console.log('No products found! Aborting.');
      process.exit(1);
    }
    
    // Seed in batches of 400 (Firestore limit per batch)
    const batchSize = 400;
    let seeded = 0;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const chunk = products.slice(i, i + batchSize);
      const batch = db.batch();
      chunk.forEach(p => {
        const ref = db.collection('products').doc(p.id);
        // Remove undefined fields
        const doc = Object.fromEntries(Object.entries(p).filter(([_, v]) => v !== undefined));
        batch.set(ref, doc);
      });
      await batch.commit();
      seeded += chunk.length;
      console.log(`Seeded ${seeded}/${products.length} products...`);
    }
    
    console.log(`\n✅ Successfully seeded ${seeded} products to Firestore!`);
    console.log('Now open http://localhost:3000/products and refresh to see all products!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();

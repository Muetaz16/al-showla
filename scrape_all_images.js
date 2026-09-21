const fs = require('fs');
const { execSync } = require('child_process');

// Step 1: Compile products.ts to JS
console.log('Compiling products.ts...');
try {
  execSync('npx tsc src/lib/products.ts --target es2015 --module commonjs --outDir ./temp_seed --skipLibCheck', { stdio: 'inherit' });
} catch (e) {
  console.log('TSC had warnings but continuing...');
}

// Step 2: Load compiled products
const { PRODUCTS } = require('./temp_seed/products.js');
console.log(`Loaded ${PRODUCTS.length} products.`);

// Step 3: Scrape images from Bing
async function scrapeImage(query) {
  try {
    const res = await fetch(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}&first=1`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    const html = await res.text();
    const m = html.match(/murl&quot;:&quot;(https?[^&]*?)&quot;/);
    if (m && m[1]) return m[1];
    return null;
  } catch (e) {
    return null;
  }
}

// Small delay to avoid rate limiting
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function processProducts() {
  let updated = 0;
  let failed = 0;
  
  const concurrency = 3; // conservative to avoid rate limits
  
  for (let i = 0; i < PRODUCTS.length; i += concurrency) {
    const batch = PRODUCTS.slice(i, i + concurrency);
    
    const promises = batch.map(async (p) => {
      // Build a good search query using brand + English name
      const query = `${p.brand} ${p.nameEn} product`;
      let url = await scrapeImage(query);
      
      if (!url) {
        // Retry with just English name
        url = await scrapeImage(p.nameEn + ' product image');
      }
      
      if (url) {
        p.imageUrl = url;
        updated++;
      } else {
        failed++;
      }
    });
    
    await Promise.all(promises);
    await delay(300); // small delay between batches
    
    // Progress
    const done = Math.min(i + concurrency, PRODUCTS.length);
    process.stdout.write(`\r  Progress: ${done}/${PRODUCTS.length} (${updated} found, ${failed} failed)`);
  }
  
  console.log(`\n\nDone! Updated: ${updated}, Failed: ${failed}`);
  
  // Step 4: Write back to products.ts
  let content = fs.readFileSync('src/lib/products.ts', 'utf8');
  const regex = /export const PRODUCTS: Product\[\] = \[[\s\S]*?\n\];/;
  
  // Build the new array string
  let lines = ['export const PRODUCTS: Product[] = ['];
  for (const p of PRODUCTS) {
    lines.push('  {');
    for (const [k, v] of Object.entries(p)) {
      if (v === undefined) continue;
      if (Array.isArray(v)) {
        if (v.length === 0) {
          lines.push(`    ${k}: [],`);
        } else if (typeof v[0] === 'object') {
          // certificates array
          lines.push(`    ${k}: [`);
          for (const cert of v) {
            lines.push(`      { nameAr: ${JSON.stringify(cert.nameAr)}, nameEn: ${JSON.stringify(cert.nameEn)} },`);
          }
          lines.push(`    ],`);
        } else {
          lines.push(`    ${k}: [`);
          for (const item of v) {
            lines.push(`      ${JSON.stringify(item)},`);
          }
          lines.push(`    ],`);
        }
      } else if (typeof v === 'boolean') {
        lines.push(`    ${k}: ${v},`);
      } else if (typeof v === 'number') {
        lines.push(`    ${k}: ${v},`);
      } else {
        lines.push(`    ${k}: ${JSON.stringify(v)},`);
      }
    }
    lines.push('  },');
  }
  lines.push('];');
  
  const newArray = lines.join('\n');
  content = content.replace(regex, newArray);
  
  fs.writeFileSync('src/lib/products.ts', content, 'utf8');
  console.log('Written to src/lib/products.ts!');
  
  // Step 5: Re-compile and seed to Firestore
  console.log('Re-compiling and seeding to Firestore...');
  execSync('npx tsc src/lib/products.ts --target es2015 --module commonjs --outDir ./temp_seed --skipLibCheck', { stdio: 'inherit' });
  
  // Load fresh
  delete require.cache[require.resolve('./temp_seed/products.js')];
  const fresh = require('./temp_seed/products.js');
  
  // Firestore seed
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
  
  const batchSize = 400;
  let seeded = 0;
  for (let i = 0; i < fresh.PRODUCTS.length; i += batchSize) {
    const chunk = fresh.PRODUCTS.slice(i, i + batchSize);
    const batch = db.batch();
    chunk.forEach(p => {
      const ref = db.collection('products').doc(p.id);
      const doc = Object.fromEntries(Object.entries(p).filter(([_, v]) => v !== undefined));
      batch.set(ref, doc);
    });
    await batch.commit();
    seeded += chunk.length;
  }
  
  console.log(`\n✅ Successfully seeded ${seeded} products with real images to Firestore!`);
}

processProducts().catch(console.error);

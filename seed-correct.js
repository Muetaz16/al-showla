const fs = require('fs');
const { execSync } = require('child_process');

console.log('Compiling products.ts...');
execSync('npx tsc src/lib/products.ts --target es2015 --module commonjs --outDir ./temp_seed', { stdio: 'inherit' });

const { PRODUCTS } = require('./temp_seed/products.js');

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

async function main() {
  try {
    console.log(`Found ${PRODUCTS.length} products to seed.`);
    
    const batchSize = 400;
    let seeded = 0;
    
    for (let i = 0; i < PRODUCTS.length; i += batchSize) {
      const chunk = PRODUCTS.slice(i, i + batchSize);
      const batch = db.batch();
      chunk.forEach(p => {
        const ref = db.collection('products').doc(p.id);
        const doc = Object.fromEntries(Object.entries(p).filter(([_, v]) => v !== undefined));
        batch.set(ref, doc);
      });
      await batch.commit();
      seeded += chunk.length;
      console.log(`Seeded ${seeded}/${PRODUCTS.length} products...`);
    }
    
    console.log(`\n✅ Successfully seeded ${seeded} products to Firestore with all specs intact!`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

// We must compile products.ts to js or just read it. Better to register ts-node.
require('ts-node').register({ transpileOnly: true });
const { PRODUCTS } = require('./src/lib/products.ts');

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
};

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function reseed() {
  console.log(`Starting to re-seed ${PRODUCTS.length} products...`);
  let count = 0;
  let batch = db.batch();
  for (const p of PRODUCTS) {
    const ref = db.collection('products').doc(p.id);
    batch.set(ref, p);
    count++;
    if (count % 100 === 0) {
      await batch.commit();
      console.log(`Committed ${count}`);
      batch = db.batch();
    }
  }
  if (count % 100 !== 0) {
    await batch.commit();
    console.log(`Committed ${count}`);
  }
  console.log('Finished re-seeding!');
}

reseed().catch(console.error);

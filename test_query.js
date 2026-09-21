const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
};

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function test() {
  try {
    const snap = await db.collection("products").orderBy("nameAr").get();
    console.log("Empty?", snap.empty);
    console.log("Size:", snap.size);
    if (!snap.empty) {
      console.log("First doc nameAr:", snap.docs[0].data().nameAr);
    }
  } catch (err) {
    console.error("Query failed:", err.message);
  }
}
test().catch(console.error);

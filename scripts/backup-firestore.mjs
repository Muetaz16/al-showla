#!/usr/bin/env node
/**
 * Manual Firestore backup script.
 * Usage: node scripts/backup-firestore.mjs [output-dir]
 * Requires: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const COLLECTIONS = [
  "products", "orders", "users", "contractors", "notifications", "logs",
  "sample_requests", "contact_messages", "career_applications", "appointments",
  "return_requests", "satisfaction_surveys", "faq_items", "blog_posts", "banners",
  "coupons", "chat_sessions", "chat_messages", "boq_metadata",
];

function getApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID || "alshola-b7aa3",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const outDir = process.argv[2] || join(process.cwd(), "backups", new Date().toISOString().slice(0, 10));
mkdirSync(outDir, { recursive: true });

const db = getFirestore(getApp());
const backup = { date: new Date().toISOString(), collections: {} };

for (const col of COLLECTIONS) {
  try {
    const snap = await db.collection(col).get();
    backup.collections[col] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log(`✓ ${col}: ${snap.size} docs`);
  } catch (e) {
    console.warn(`⚠ ${col}:`, e.message);
    backup.collections[col] = [];
  }
}

const file = join(outDir, `firestore-backup-${Date.now()}.json`);
writeFileSync(file, JSON.stringify(backup, null, 2));
console.log(`\nBackup saved: ${file}`);

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminDb = getFirestore();

export async function getAIConfig() {
  try {
    const configDoc = await adminDb.collection('aiConfig').doc('default').get();
    if (!configDoc.exists) {
      return {
        systemPrompt: "Bonjour, je suis votre assistant vocal. Comment puis-je vous aider ?",
        personality: 'professional'
      };
    }
    return configDoc.data();
  } catch (error) {
    console.error('Error getting AI config:', error);
    return {
      systemPrompt: "Bonjour, je suis votre assistant vocal. Comment puis-je vous aider ?",
      personality: 'professional'
    };
  }
} 
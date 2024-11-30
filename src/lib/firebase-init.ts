import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { auth } from './firebase';

export async function initializeFirestore() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user logged in');
      return;
    }

    // Créer la collection config si elle n'existe pas
    const configRef = doc(db, 'config', 'default');
    await setDoc(configRef, {
      voiceType: 'alice',
      language: 'fr-FR',
      aiTemperature: 0.7,
      responseLength: 'medium',
      lastUpdatedBy: user.uid,
      lastUpdatedAt: new Date().toISOString()
    }, { merge: true });

    // Créer un document initial dans callLogs si nécessaire
    const callLogsInitialRef = doc(db, 'callLogs', 'initial');
    await setDoc(callLogsInitialRef, {
      timestamp: new Date().toISOString(),
      type: 'initialization',
      userId: user.uid
    }, { merge: true });

    // Créer ou mettre à jour le document utilisateur
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      email: user.email,
      lastLogin: new Date().toISOString()
    }, { merge: true });

  } catch (error) {
    console.error('Error initializing Firestore:', error);
  }
} 
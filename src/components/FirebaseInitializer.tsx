'use client';

import { useEffect } from 'react';
import { initializeFirestore } from '@/lib/firebase-init';

export default function FirebaseInitializer() {
  useEffect(() => {
    initializeFirestore();
  }, []);

  return null;
} 
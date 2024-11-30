import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface Config {
  voiceType: 'alice' | 'man' | 'woman';
  language: 'fr-FR' | 'en-US';
  aiTemperature: number;
  responseLength: 'short' | 'medium' | 'long';
}

const CONFIG_DOC_ID = 'default';

export async function GET() {
  try {
    const configRef = doc(db, 'config', CONFIG_DOC_ID);
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      return NextResponse.json(configSnap.data());
    }
    
    // Configuration par défaut
    const defaultConfig: Config = {
      voiceType: 'alice',
      language: 'fr-FR',
      aiTemperature: 0.7,
      responseLength: 'medium',
    };
    
    await setDoc(configRef, defaultConfig);
    return NextResponse.json(defaultConfig);
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const newConfig = await req.json() as Partial<Config>;
    const configRef = doc(db, 'config', CONFIG_DOC_ID);
    
    const configSnap = await getDoc(configRef);
    const currentConfig = configSnap.exists() ? configSnap.data() as Config : {};
    
    const updatedConfig = { ...currentConfig, ...newConfig };
    await setDoc(configRef, updatedConfig);
    
    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
} 
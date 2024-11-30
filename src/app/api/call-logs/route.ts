import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, DocumentData } from 'firebase/firestore';

interface CallLog {
  id: string;
  userInput: string;
  aiResponse: string;
  timestamp: string;
}

export async function GET() {
  try {
    const callLogsRef = collection(db, 'callLogs');
    const q = query(callLogsRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const logs: CallLog[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<CallLog, 'id'>
    }));

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching call logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call logs' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const newLog = {
      userInput: data.userInput,
      aiResponse: data.aiResponse,
      timestamp: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'callLogs'), newLog);
    return NextResponse.json({ id: docRef.id, ...newLog }, { status: 201 });
  } catch (error) {
    console.error('Error saving call log:', error);
    return NextResponse.json(
      { error: 'Failed to save call log' },
      { status: 500 }
    );
  }
} 
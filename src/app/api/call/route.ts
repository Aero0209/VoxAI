import { NextResponse } from 'next/server';
import twilio from 'twilio';
import openai from '@/lib/openai';
import { getAIConfig } from '@/lib/firebase-admin';
import { adminDb } from '@/lib/firebase-admin';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER || '+17753078897';

const client = twilio(accountSid, authToken);

// Liste des numéros autorisés pour les tests
const ALLOWED_NUMBERS = [
  '+32479991225', // Ajoutez vos numéros de test ici
];

interface TwilioError {
  code: string;
  message: string;
  status: number;
}

export async function POST(req: Request) {
  try {
    const { to } = await req.json();

    if (!to) {
      return NextResponse.json(
        { error: 'Numéro de téléphone requis' },
        { status: 400 }
      );
    }

    // Vérifier si le numéro est autorisé
    if (!ALLOWED_NUMBERS.includes(to)) {
      return NextResponse.json(
        { error: 'Ce numéro n\'est pas autorisé pendant la phase de test' },
        { status: 403 }
      );
    }

    // Debug: Vérifier directement dans Firestore
    const configDoc = await adminDb.collection('aiConfig').doc('default').get();
    console.log('Call route - Raw Firestore data:', configDoc.data());

    // Récupérer la configuration IA
    const aiConfig = await getAIConfig();
    console.log('Call route - AI Config retrieved:', aiConfig);
    
    if (!aiConfig) {
      console.log('Call route - No AI config found, using default');
      throw new Error('AI config not found');
    }

    // Générer le message d'accueil avec ChatGPT
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `${aiConfig.systemPrompt}. En tant qu'assistant vocal, maintenez votre personnalité tout au long de la conversation. Répondez de manière concise et naturelle.`
        },
        {
          role: "user",
          content: "Présentez-vous brièvement et demandez comment vous pouvez aider."
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    console.log('Call route - OpenAI response:', completion.choices[0]?.message?.content);

    const greeting = completion.choices[0]?.message?.content?.trim() || "Bonjour, comment puis-je vous aider ?";
    
    // Construire le TwiML avec Say au lieu de Play
    let twiml = '<?xml version="1.0" encoding="UTF-8"?><Response>';
    
    // Ajouter le Gather pour la reconnaissance vocale
    twiml += `<Gather input="speech" language="fr-FR" action="${process.env.NEXT_PUBLIC_APP_URL}/api/voice" method="POST" speechTimeout="auto">`;
    
    // Utiliser Say avec une voix améliorée de Twilio
    twiml += `<Say language="fr-FR" voice="Carole">${greeting}</Say>`;
    
    twiml += '</Gather></Response>';

    console.log('Generated TwiML:', twiml);

    const call = await client.calls.create({
      twiml: twiml,
      to: to,
      from: twilioNumber,
    });

    return NextResponse.json({ callSid: call.sid });
  } catch (error: TwilioError | Error) {
    console.error('Erreur lors de l\'initiation de l\'appel:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'initiation de l\'appel',
        details: 'code' in error ? error.code : error.message 
      },
      { status: 500 }
    );
  }
} 
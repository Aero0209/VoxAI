import { NextResponse } from 'next/server';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import openai from '@/lib/openai';
import { getAIConfig } from '@/lib/firebase-admin';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  const twiml = new VoiceResponse();
  
  try {
    const formData = await req.formData();
    const speechResult = formData.get('SpeechResult');

    console.log('Speech result received:', speechResult);

    if (!speechResult) {
      const gather = twiml.gather({
        input: ['speech'],
        language: 'fr-FR',
        action: `${process.env.NEXT_PUBLIC_APP_URL}/api/voice`,
        method: 'POST',
        speechTimeout: 'auto'
      });

      gather.say({
        language: 'fr-FR',
        voice: 'Carole'
      }, "Je n'ai pas compris. Pouvez-vous répéter ?");

      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Debug: Vérifier directement dans Firestore
    const configDoc = await adminDb.collection('aiConfig').doc('default').get();
    console.log('Voice route - Raw Firestore data:', configDoc.data());

    // Récupérer la configuration IA
    const aiConfig = await getAIConfig();
    console.log('Voice route - AI Config retrieved:', aiConfig);
    
    if (!aiConfig) {
      console.log('Voice route - No AI config found, using default');
      throw new Error('AI config not found');
    }

    // Générer la réponse avec ChatGPT
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `${aiConfig.systemPrompt}. En tant qu'assistant vocal, maintenez votre personnalité tout au long de la conversation. Répondez de manière concise et naturelle.`
        },
        {
          role: "assistant",
          content: "Je suis là pour vous aider selon mes directives. Comment puis-je vous être utile ?"
        },
        {
          role: "user",
          content: speechResult.toString()
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    console.log('Voice route - OpenAI response:', completion.choices[0]?.message?.content);

    const response = completion.choices[0]?.message?.content?.trim() || "Je n'ai pas pu générer une réponse appropriée.";
    
    // Configurer le Gather
    const gather = twiml.gather({
      input: ['speech'],
      language: 'fr-FR',
      action: `${process.env.NEXT_PUBLIC_APP_URL}/api/voice`,
      method: 'POST',
      speechTimeout: 'auto'
    });
    
    // Utiliser Say avec la voix Carole
    gather.say({
      language: 'fr-FR',
      voice: 'Carole'
    }, response);

  } catch (error) {
    console.error('Error in voice processing:', error);
    const gather = twiml.gather({
      input: ['speech'],
      language: 'fr-FR',
      action: `${process.env.NEXT_PUBLIC_APP_URL}/api/voice`,
      method: 'POST',
      speechTimeout: 'auto'
    });

    gather.say({
      language: 'fr-FR',
      voice: 'Carole'
    }, "Désolé, une erreur s'est produite. Pouvez-vous réessayer ?");
  }

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
} 
import { NextResponse } from 'next/server';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import { getAIConfig } from '@/lib/firebase-admin';
import openai from '@/lib/openai';
import { adminDb } from '@/lib/firebase-admin';

type GatherInput = 'dtmf' | 'speech';

export async function GET() {
  const twiml = new VoiceResponse();
  
  try {
    // Debug: Vérifier directement dans Firestore
    const configDoc = await adminDb.collection('aiConfig').doc('default').get();
    console.log('Raw Firestore data:', configDoc.data());

    // Récupérer la configuration IA
    const aiConfig = await getAIConfig();
    console.log('AI Config retrieved:', aiConfig);
    
    if (!aiConfig) {
      console.log('No AI config found, using default');
      throw new Error('AI config not found');
    }

    // Générer le message d'accueil avec ChatGPT
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `${aiConfig.systemPrompt}. Répondez de manière concise et naturelle, comme dans une vraie conversation téléphonique.`
        },
        {
          role: "user",
          content: "Présentez-vous brièvement et demandez comment vous pouvez aider."
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    console.log('OpenAI response:', completion.choices[0]?.message?.content);

    const greeting = completion.choices[0]?.message?.content?.trim() || "Bonjour, comment puis-je vous aider ?";
    
    // Diviser la réponse en phrases si elle est trop longue
    const sentences = greeting.split(/[.!?]+/).filter(Boolean);
    
    // Dire chaque phrase séparément pour une meilleure fluidité
    for (const sentence of sentences) {
      twiml.say({
        language: 'fr-FR',
        voice: 'alice'
      }, sentence.trim() + '.');
    }
    
    const gather = twiml.gather({
      input: ['speech'] as GatherInput[],
      language: 'fr-FR',
      action: '/api/voice',
      method: 'POST'
    });
    
    gather.say({
      language: 'fr-FR',
      voice: 'alice'
    }, 'Je vous écoute.');

  } catch (error) {
    console.error('Error in TwiML generation:', error);
    // Message de repli en cas d'erreur
    twiml.say({
      language: 'fr-FR',
      voice: 'alice'
    }, "Bonjour, comment puis-je vous aider ?");
  }

  return new NextResponse(twiml.toString(), {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
} 
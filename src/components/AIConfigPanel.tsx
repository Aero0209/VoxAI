'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthProvider';
import toast from 'react-hot-toast';

interface AIConfig {
  systemPrompt: string;
  maxResponseLength: number;
  personality: 'professional' | 'friendly' | 'casual';
  expertise: string[];
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

const DEFAULT_PROMPTS = {
  professional: "Je suis un assistant virtuel professionnel spécialisé dans le service client. Je communique de manière claire, précise et courtoise.",
  friendly: "Je suis un assistant amical et chaleureux, toujours prêt à aider avec enthousiasme tout en restant professionnel.",
  casual: "Je suis un assistant décontracté qui communique de manière naturelle et accessible, tout en restant utile et pertinent."
};

export default function AIConfigPanel() {
  const { user } = useAuth();
  const [config, setConfig] = useState<AIConfig>({
    systemPrompt: DEFAULT_PROMPTS.professional,
    maxResponseLength: 150,
    personality: 'professional',
    expertise: ['service_client', 'support_technique']
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Charger la configuration depuis Firestore
    const loadConfig = async () => {
      try {
        const configRef = doc(db, 'aiConfig', 'default');
        const configSnap = await getDoc(configRef);
        
        if (configSnap.exists()) {
          console.log('Loading config from Firestore:', configSnap.data());
          setConfig(configSnap.data() as AIConfig);
        } else {
          console.log('No config found in Firestore, using default');
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        toast.error('Erreur lors du chargement de la configuration');
      }
    };

    if (user) {
      loadConfig();
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour sauvegarder');
      return;
    }

    setIsSaving(true);
    try {
      const configToSave = {
        ...config,
        lastUpdatedBy: user.uid,
        lastUpdatedAt: new Date().toISOString()
      };
      console.log('Saving config to Firestore:', configToSave);

      const configRef = doc(db, 'aiConfig', 'default');
      await setDoc(configRef, configToSave);

      // Vérifier immédiatement que la sauvegarde a réussi
      const savedConfig = await getDoc(configRef);
      console.log('Verified saved config:', savedConfig.data());

      setIsEditing(false);
      toast.success('Configuration sauvegardée');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePersonalityChange = (personality: AIConfig['personality']) => {
    setConfig(prev => ({
      ...prev,
      personality,
      systemPrompt: DEFAULT_PROMPTS[personality]
    }));
  };

  if (!user) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Connectez-vous pour accéder à la configuration</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Configuration de l&apos;IA</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personnalité de l&apos;assistant
          </label>
          <select
            value={config.personality}
            onChange={(e) => handlePersonalityChange(e.target.value as AIConfig['personality'])}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={!isEditing}
          >
            <option value="professional">Professionnel</option>
            <option value="friendly">Amical</option>
            <option value="casual">Décontracté</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prompt système
          </label>
          <div className="relative">
            <textarea
              value={config.systemPrompt}
              onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-32"
              placeholder="Décrivez la personnalité et le comportement de l'assistant..."
              disabled={!isEditing}
            />
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="absolute top-2 right-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              {isEditing ? 'Annuler' : 'Modifier'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Longueur maximale des réponses
          </label>
          <input
            type="range"
            min="50"
            max="300"
            step="10"
            value={config.maxResponseLength}
            onChange={(e) => setConfig(prev => ({ ...prev, maxResponseLength: parseInt(e.target.value) }))}
            className="mt-1 block w-full"
            disabled={!isEditing}
          />
          <span className="text-sm text-gray-500">{config.maxResponseLength} caractères</span>
        </div>

        {isEditing && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`${
                isSaving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white px-4 py-2 rounded-md flex items-center`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sauvegarde...
                </>
              ) : (
                'Sauvegarder'
              )}
            </button>
          </div>
        )}

        {config.lastUpdatedAt && (
          <div className="text-sm text-gray-500 mt-4">
            Dernière mise à jour : {new Date(config.lastUpdatedAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
} 
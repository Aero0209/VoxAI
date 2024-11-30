'use client';

import { useState } from 'react';

interface ConfigSettings {
  voiceType: 'alice' | 'man' | 'woman';
  language: 'fr-FR' | 'en-US';
  aiTemperature: number;
  responseLength: 'short' | 'medium' | 'long';
}

export default function ConfigPanel() {
  const [config, setConfig] = useState<ConfigSettings>({
    voiceType: 'alice',
    language: 'fr-FR',
    aiTemperature: 0.7,
    responseLength: 'medium',
  });

  const handleConfigChange = (
    key: keyof ConfigSettings,
    value: string | number
  ) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));

    saveConfig({ ...config, [key]: value });
  };

  const saveConfig = async (configData: ConfigSettings) => {
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde de la configuration');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Configuration</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type de voix
          </label>
          <select
            value={config.voiceType}
            onChange={(e) => handleConfigChange('voiceType', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="alice">Alice</option>
            <option value="man">Homme</option>
            <option value="woman">Femme</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Langue
          </label>
          <select
            value={config.language}
            onChange={(e) => handleConfigChange('language', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="fr-FR">Français</option>
            <option value="en-US">Anglais</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Température IA (Créativité)
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.aiTemperature}
            onChange={(e) => handleConfigChange('aiTemperature', parseFloat(e.target.value))}
            className="mt-1 block w-full"
          />
          <span className="text-sm text-gray-500">{config.aiTemperature}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Longueur des réponses
          </label>
          <select
            value={config.responseLength}
            onChange={(e) => handleConfigChange('responseLength', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="short">Courte</option>
            <option value="medium">Moyenne</option>
            <option value="long">Longue</option>
          </select>
        </div>
      </div>
    </div>
  );
} 
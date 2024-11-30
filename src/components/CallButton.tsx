'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import PhoneNumberInput from './PhoneNumberInput';

export default function CallButton() {
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  const initiateCall = async (phoneNumber: string) => {
    try {
      const response = await fetch('/api/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Erreur lors de l\'appel');
      }

      toast.success('Appel initié avec succès');
      setShowPhoneInput(false);
      return data;
    } catch (error) {
      console.error('Erreur:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erreur lors de l\'initiation de l\'appel');
      }
      throw error;
    }
  };

  if (showPhoneInput) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Démarrer un appel
            </h2>
            <button
              onClick={() => setShowPhoneInput(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <PhoneNumberInput onCallInitiated={initiateCall} />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowPhoneInput(true)}
      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
    >
      Démarrer un appel
    </button>
  );
} 
'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface PhoneNumberInputProps {
  onCallInitiated: (phoneNumber: string) => Promise<void>;
}

export default function PhoneNumberInput({ onCallInitiated }: PhoneNumberInputProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onCallInitiated(phoneNumber);
    } catch (error) {
      console.error('Erreur:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erreur lors de l\'initiation de l\'appel');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Garder uniquement les chiffres et le +
    let formatted = value.replace(/[^\d+]/g, '');
    
    // S'assurer qu'il n'y a qu'un seul + au début
    if (formatted.startsWith('+')) {
      formatted = '+' + formatted.substring(1).replace(/\+/g, '');
    }
    
    return formatted;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Numéro de téléphone
        </label>
        <div className="mt-1">
          <input
            type="tel"
            name="phone"
            id="phone"
            className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="+32479991225"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            pattern="^\+[1-9]\d{1,14}$"
            required
            disabled={isLoading}
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Format: +32479991225 (avec l&apos;indicatif pays)
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !phoneNumber.match(/^\+[1-9]\d{1,14}$/)}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Appel en cours...
          </>
        ) : (
          'Démarrer l\'appel'
        )}
      </button>
    </form>
  );
} 
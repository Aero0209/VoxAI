'use client';

import { useEffect, useState } from 'react';

interface CallLog {
  id: string;
  userInput: string;
  aiResponse: string;
  timestamp: string;
}

export default function CallLogs() {
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/call-logs');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des logs');
        }
        const data = await response.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching logs:', error);
        setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        Aucun historique d&apos;appel disponible
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Historique des appels</h2>
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="border rounded-lg p-4 bg-white shadow">
            <div className="text-sm text-gray-500">
              {new Date(log.timestamp).toLocaleString()}
            </div>
            <div className="mt-2">
              <p className="font-semibold">Utilisateur:</p>
              <p className="ml-4">{log.userInput}</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold">IA:</p>
              <p className="ml-4">{log.aiResponse}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
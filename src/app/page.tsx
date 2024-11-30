import Link from 'next/link';
import CallButton from '@/components/CallButton';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            VoxAI
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Assistant vocal intelligent alimenté par l'IA pour vos appels
          </p>
          
          <div className="space-y-4">
            <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">
                Fonctionnalités principales
              </h2>
              <ul className="space-y-2 text-gray-300">
                <li>• Réponses intelligentes en temps réel</li>
                <li>• Support multilingue (Français/Anglais)</li>
                <li>• Personnalisation de la voix</li>
                <li>• Historique des conversations</li>
              </ul>
            </div>

            <div className="flex justify-center gap-4">
              <Link 
                href="/dashboard"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Accéder au tableau de bord
              </Link>
              <CallButton />
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3">
              Intelligence Artificielle
            </h3>
            <p className="text-gray-300">
              Powered by OpenAI GPT pour des réponses contextuelles et pertinentes
            </p>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3">
              Téléphonie Cloud
            </h3>
            <p className="text-gray-300">
              Intégration Twilio pour une qualité d'appel optimale
            </p>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3">
              Personnalisation
            </h3>
            <p className="text-gray-300">
              Configurez la voix et le comportement selon vos besoins
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

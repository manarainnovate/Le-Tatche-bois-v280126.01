import { Award } from 'lucide-react';

export default function AttestationTravailPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
          <Award className="w-6 h-6 text-amber-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attestations de travail</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestion des attestations de travail</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Bientôt disponible
        </h2>
        <p className="text-gray-400 dark:text-gray-500 max-w-md mx-auto">
          Cette fonctionnalité est en cours de développement.
          Vous pourrez bientôt créer et gérer vos attestations de travail ici.
        </p>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Attestations de travail',
  description: 'Gestion des attestations de travail',
};

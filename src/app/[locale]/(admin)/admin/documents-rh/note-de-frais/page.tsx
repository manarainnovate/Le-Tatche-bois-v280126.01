import { Receipt } from 'lucide-react';

export default function NoteDeFraisPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
          <Receipt className="w-6 h-6 text-amber-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notes de frais</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestion des notes de frais</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Bientôt disponible
        </h2>
        <p className="text-gray-400 dark:text-gray-500 max-w-md mx-auto">
          Cette fonctionnalité est en cours de développement.
          Vous pourrez bientôt créer et gérer vos notes de frais ici.
        </p>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Notes de frais',
  description: 'Gestion des notes de frais',
};

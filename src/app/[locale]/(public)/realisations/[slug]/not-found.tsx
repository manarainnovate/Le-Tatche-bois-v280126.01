import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <div className="text-8xl mb-6">🪵</div>
        <h1 className="text-6xl font-bold text-amber-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Projet non trouvé
        </h2>
        <p className="text-gray-600 mb-8">
          Ce projet n&apos;existe pas ou a été supprimé.
        </p>
        <Link
          href="/fr/realisations"
          className="inline-block px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
        >
          Voir tous les projets
        </Link>
      </div>
    </div>
  );
}

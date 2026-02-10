import Link from "next/link";

export default function LocaleNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8">
        <h1 className="text-9xl font-bold text-amber-600">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mt-4">
          Page non trouvée
        </h2>
        <p className="text-gray-600 mt-2 mb-8">
          La page que vous cherchez n&apos;existe pas.
        </p>
        <Link
          href="/fr"
          className="inline-block px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

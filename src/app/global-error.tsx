"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-8">
            <h1 className="text-6xl font-bold text-red-600">Erreur Critique</h1>
            <p className="text-gray-600 mt-4 mb-8">
              Une erreur critique est survenue.
            </p>
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

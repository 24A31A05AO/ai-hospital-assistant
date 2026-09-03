import { Suspense } from "react";
import StartClient from "./StartClient";

export default function StartPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <p className="text-slate-600">
              Loading hospital information...
            </p>
          </div>
        </main>
      }
    >
      <StartClient />
    </Suspense>
  );
}
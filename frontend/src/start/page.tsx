"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function StartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hospitalQr = searchParams.get("hospital") || "";

  function handleStart() {
    if (!hospitalQr) {
      return;
    }

    router.push(
      `/consultation?hospital=${encodeURIComponent(hospitalQr)}`
    );
  }

  return (
    <main>
      <h1>AI Hospital Assistant</h1>

      <p>Hospital: {hospitalQr || "Not specified"}</p>

      <button onClick={handleStart}>
        Start Pre-Consultation
      </button>
    </main>
  );
}
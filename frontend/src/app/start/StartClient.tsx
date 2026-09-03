"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  getHospitalByQr,
  type Hospital,
} from "@/lib/api";

export default function StartClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // GET HOSPITAL QR FROM URL
  // ============================================================

  const hospitalQr =
    searchParams.get("hospital") ||
    searchParams.get("qr") ||
    searchParams.get("qr_code_id") ||
    "";

  // ============================================================
  // LOAD HOSPITAL
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function loadHospital() {
      setLoading(true);
      setError("");

      if (!hospitalQr.trim()) {
        setHospital(null);
        setError(
          "Hospital information is missing from this QR link."
        );
        setLoading(false);
        return;
      }

      try {
        const data = await getHospitalByQr(hospitalQr);

        if (!cancelled) {
          setHospital(data);
        }
      } catch (err) {
        console.error("Hospital lookup failed:", err);

        if (!cancelled) {
          setHospital(null);
          setError(
            err instanceof Error
              ? err.message
              : "Hospital could not be found."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHospital();

    return () => {
      cancelled = true;
    };
  }, [hospitalQr]);

  // ============================================================
  // START PRE-CONSULTATION
  // ============================================================

  function handleStart() {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      router.push(
        `/login?next=${encodeURIComponent(
          `/start?hospital=${hospitalQr}`
        )}`
      );

      return;
    }

    router.push(
      `/consultation?hospital=${encodeURIComponent(
        hospitalQr
      )}`
    );
  }

  // ============================================================
  // GO HOME
  // ============================================================

  function handleHome() {
    router.push("/");
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <h1 className="text-2xl font-bold text-slate-900">
              AI Hospital Assistant
            </h1>

            <p className="mt-2 text-slate-600">
              Identifying hospital...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error || !hospital) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white text-3xl">
              +
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              AI Hospital Assistant
            </h1>

            <p className="mt-2 text-slate-600">
              Pre-consultation support for patients
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 text-3xl">
              !
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Hospital not found
            </h2>

            <p className="mt-3 text-slate-600">
              {error ||
                "Hospital information is missing from this QR link."}
            </p>

            <button
              type="button"
              onClick={handleHome}
              className="mt-8 rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Go to Home
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            AI Hospital Assistant • Information support for
            healthcare visits
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // HOSPITAL FOUND
  // ============================================================

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">

        {/* Header */}

        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white text-3xl shadow-lg">
            +
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            AI Hospital Assistant
          </h1>

          <p className="mt-2 text-slate-600">
            Pre-consultation support for patients
          </p>
        </div>

        {/* Hospital Card */}

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

          {/* Success Header */}

          <div className="bg-blue-600 px-6 py-5 text-white">
            <p className="text-sm font-medium text-blue-100">
              Hospital identified
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              {hospital.name}
            </h2>
          </div>

          {/* Hospital Details */}

          <div className="p-7">

            <div className="space-y-5">

              {/* Address */}

              {hospital.address && (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    📍
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Address
                    </p>

                    <p className="font-medium text-slate-900">
                      {hospital.address}
                    </p>
                  </div>
                </div>
              )}

              {/* Phone */}

              {hospital.phone && (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    📞
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Phone
                    </p>

                    <p className="font-medium text-slate-900">
                      {hospital.phone}
                    </p>
                  </div>
                </div>
              )}

              {/* Email */}

              {hospital.email && (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    ✉️
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Email
                    </p>

                    <p className="font-medium text-slate-900 break-all">
                      {hospital.email}
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Divider */}

            <div className="my-7 border-t border-slate-200" />

            {/* Information */}

            <div className="rounded-xl bg-blue-50 border border-blue-100 p-5">
              <h3 className="font-semibold text-blue-900">
                Before you begin
              </h3>

              <p className="mt-2 text-sm leading-6 text-blue-800">
                The AI Hospital Assistant will collect basic
                information about your symptoms and medical
                history before your consultation.
              </p>
            </div>

            {/* Start Button */}

            <button
              type="button"
              onClick={handleStart}
              className="mt-7 w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-700 active:scale-[0.99]"
            >
              Start Pre-Consultation
            </button>

            <p className="mt-3 text-center text-xs text-slate-500">
              You may need to log in before starting your
              consultation.
            </p>
          </div>
        </div>

        {/* Footer */}

        <p className="mt-6 text-center text-sm text-slate-500">
          AI Hospital Assistant • Information support for
          healthcare visits
        </p>
      </div>
    </main>
  );
}
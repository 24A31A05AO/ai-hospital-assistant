"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  getHospitalByQr,
  type Hospital,
} from "@/lib/api";

export default function StartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hospitalQr = searchParams.get("hospital")?.trim() || "";

  const [hospital, setHospital] =
    useState<Hospital | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadHospital() {
      if (!hospitalQr) {
        setError(
          "Hospital information is missing from this QR link."
        );
        setLoading(false);
        return;
      }

      try {
        setError("");

        const data =
          await getHospitalByQr(hospitalQr);

        setHospital(data);
      } catch (error: unknown) {
        console.error(
          "Hospital lookup error:",
          error
        );

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Unable to find this hospital."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadHospital();
  }, [hospitalQr]);

  function handleStart() {
    const token =
      localStorage.getItem(
        "access_token"
      );

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">

      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-12">

        <div className="w-full">

          {/* BRAND */}

          <div className="mb-8 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg">
              +
            </div>

            <h1 className="mt-4 text-2xl font-bold text-gray-950">
              AI Hospital Assistant
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Pre-consultation support for patients
            </p>

          </div>

          {/* CARD */}

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl sm:p-10">

            {loading && (
              <div className="py-10 text-center">

                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

                <p className="mt-5 text-sm text-gray-600">
                  Finding your hospital...
                </p>

              </div>
            )}

            {!loading && error && (
              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">
                  !
                </div>

                <h2 className="mt-5 text-2xl font-bold text-gray-900">
                  Hospital not found
                </h2>

                <p className="mx-auto mt-3 max-w-md whitespace-pre-line text-sm leading-6 text-gray-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/")
                  }
                  className="mt-7 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Go to Home
                </button>

              </div>
            )}

            {!loading &&
              !error &&
              hospital && (
                <div>

                  {/* QR IDENTIFICATION */}

                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-green-500" />
                    Hospital identified
                  </div>

                  {/* HOSPITAL */}

                  <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6">

                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                      Hospital
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-gray-950">
                      {hospital.name}
                    </h2>

                    {hospital.address && (
                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        {hospital.address}
                      </p>
                    )}

                    {hospital.phone && (
                      <p className="mt-1 text-sm text-gray-600">
                        {hospital.phone}
                      </p>
                    )}

                  </div>

                  {/* EXPLANATION */}

                  <div className="mt-8">

                    <h3 className="text-xl font-bold text-gray-900">
                      Start your pre-consultation
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-gray-600">
                      Answer a few guided questions about
                      your symptoms and health history.
                      Your information will be organized
                      into a summary that can help the
                      healthcare team prepare for your visit.
                    </p>

                  </div>

                  {/* SAFETY */}

                  <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">

                    <p className="text-sm font-semibold text-gray-800">
                      Important
                    </p>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      This assistant does not diagnose
                      diseases or prescribe medicines.
                      Your doctor will examine you and
                      decide your diagnosis and treatment.
                    </p>

                  </div>

                  {/* ACTION */}

                  <button
                    type="button"
                    onClick={handleStart}
                    className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    Start Pre-Consultation
                  </button>

                  <p className="mt-4 text-center text-xs text-gray-400">
                    Hospital QR: {hospital.qr_code_id}
                  </p>

                </div>
              )}

          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            AI Hospital Assistant • Information support for
            healthcare visits
          </p>

        </div>

      </div>

    </main>
  );
}
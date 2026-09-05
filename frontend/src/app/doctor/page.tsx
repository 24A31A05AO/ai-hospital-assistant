"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DoctorDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">
            Doctor Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Manage patient consultations and appointments.
          </p>
        </div>

        {/* TWO MAIN SECTIONS */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* CONSULTATIONS */}
          <button
            type="button"
            onClick={() =>
              router.push("/doctor/consultations")
            }
            className="group rounded-2xl border border-blue-200 bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-3xl">
              🩺
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Consultations
            </h2>

            <p className="mt-3 text-slate-600">
              Review patient symptoms, medical history,
              AI-generated summaries and provide doctor notes.
            </p>

            <div className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white group-hover:bg-blue-700">
              View Consultations →
            </div>
          </button>

          {/* APPOINTMENTS */}
          <button
            type="button"
            onClick={() =>
              router.push("/doctor/appointments")
            }
            className="group rounded-2xl border border-green-200 bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-green-400 hover:shadow-lg"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-3xl">
              📅
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Appointments
            </h2>

            <p className="mt-3 text-slate-600">
              View your scheduled appointments, patient
              details, queue numbers and appointment times.
            </p>

            <div className="mt-6 inline-flex rounded-lg bg-green-600 px-5 py-3 font-semibold text-white group-hover:bg-green-700">
              View Appointments →
            </div>
          </button>

        </div>
      </div>
    </main>
  );
}
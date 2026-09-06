"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PatientDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Patient Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Manage your consultations and appointments.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">

          {/* CONSULTATIONS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              My Consultations
            </h2>

            <p className="mt-2 text-slate-600">
              View your previous AI consultations and medical summaries.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/consultations/patient")
              }
              className="mt-6 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700"
            >
              View Consultations
            </button>
          </div>

          {/* BOOK APPOINTMENT */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Book Appointment
            </h2>

            <p className="mt-2 text-slate-600">
              Schedule an appointment with a doctor.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/patient/appointments/book")
              }
              className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Book Appointment
            </button>
          </div>

          {/* MY APPOINTMENTS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              My Appointments
            </h2>

            <p className="mt-2 text-slate-600">
              View your upcoming and previous appointments.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/patient/appointments")
              }
              className="mt-6 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
            >
              View Appointments
            </button>
          </div>

          {/* START CONSULTATION */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Start Consultation
            </h2>

            <p className="mt-2 text-slate-600">
              Start a new AI-assisted health consultation.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/start")
              }
              className="mt-6 rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
            >
              Start Consultation
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
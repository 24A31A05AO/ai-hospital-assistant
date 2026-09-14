"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PatientDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");

    if (!token || role !== "patient") {
      router.replace("/login");
    }
  }, [router]);

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    router.replace("/login");
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Patient Dashboard
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Patient Dashboard
            </h1>
            <p className="mt-2 text-slate-600">
              Manage your consultations and appointments.
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-full bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <button
            onClick={() => router.push("/consultation")}
            className="rounded-2xl bg-white p-6 text-left shadow-md transition hover:-translate-y-1"
          >
            <h2 className="text-xl font-bold text-slate-900">
              Start Consultation
            </h2>
            <p className="mt-2 text-slate-600">
              Tell the AI Hospital Assistant about your health problem.
            </p>
          </button>

          <button
            onClick={() => router.push("/patient/consultations")}
            className="rounded-2xl bg-white p-6 text-left shadow-md transition hover:-translate-y-1"
          >
            <h2 className="text-xl font-bold text-slate-900">
              Consultation History
            </h2>
            <p className="mt-2 text-slate-600">
              View your previous consultations and statuses.
            </p>
          </button>

          <button
            onClick={() => router.push("/patient/appointments/book")}
            className="rounded-2xl bg-white p-6 text-left shadow-md transition hover:-translate-y-1"
          >
            <h2 className="text-xl font-bold text-slate-900">
              Book Appointment
            </h2>
            <p className="mt-2 text-slate-600">
              Schedule a hospital appointment.
            </p>
          </button>

          <button
            onClick={() => router.push("/patient/appointments")}
            className="rounded-2xl bg-white p-6 text-left shadow-md transition hover:-translate-y-1"
          >
            <h2 className="text-xl font-bold text-slate-900">
              My Appointments
            </h2>
            <p className="mt-2 text-slate-600">
              View your booked appointments.
            </p>
          </button>
        </div>
      </div>
    </main>
  );
}
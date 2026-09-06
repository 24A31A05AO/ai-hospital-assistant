"use client";

import { useRouter } from "next/navigation";

export default function PatientDashboardPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
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
            type="button"
            onClick={() => {
              localStorage.removeItem("access_token");
              localStorage.removeItem("user_role");
              localStorage.removeItem("user_id");

              router.push("/login");
            }}
            className="rounded-lg border border-red-200 bg-white px-4 py-2 font-semibold text-red-600 transition hover:bg-red-50"
          >
            Logout
          </button>
        </div>

        {/* CARDS */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* CONSULTATION */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Consultation
            </h2>

            <p className="mt-2 text-slate-600">
              Tell the AI Hospital Assistant about your current
              health problem.
            </p>

            <button
              type="button"
              onClick={() => router.push("/consultation")}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Start Consultation
            </button>
          </div>

          {/* CONSULTATION HISTORY */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Consultation History
            </h2>

            <p className="mt-2 text-slate-600">
              View all your previous consultations and their
              current status.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/patient/consultations")
              }
              className="mt-6 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
            >
              View History
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
              className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
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
              className="mt-6 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              View Appointments
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
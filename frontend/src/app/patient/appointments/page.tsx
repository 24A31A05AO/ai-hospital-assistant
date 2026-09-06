"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getMyAppointments,
  Appointment,
} from "@/lib/api";

export default function MyAppointmentsPage() {
  const router = useRouter();

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadAppointments() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getMyAppointments();

        setAppointments(data);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load appointments."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              My Appointments
            </h1>

            <p className="mt-2 text-slate-600">
              Your booked appointments.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/patient/dashboard")
            }
            className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700"
          >
            Dashboard
          </button>
        </div>

        {loading && (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            Loading appointments...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-bold text-red-800">
              Unable to load appointments
            </h2>

            <p className="mt-2 text-red-700">
              {error}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          appointments.length === 0 && (
            <div className="rounded-xl bg-white p-10 text-center shadow">
              <h2 className="text-xl font-bold text-slate-900">
                No appointments
              </h2>

              <p className="mt-2 text-slate-500">
                You have not booked any appointments yet.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/patient/appointments/book"
                  )
                }
                className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Book Appointment
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          appointments.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2">

              {appointments.map(
                (appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-500">
                          Appointment
                        </p>

                        <h2 className="text-xl font-bold text-slate-900">
                          #{appointment.id}
                        </h2>
                      </div>

                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        {appointment.status}
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">

                      <div>
                        <p className="text-sm text-slate-500">
                          Department
                        </p>

                        <p className="font-semibold text-slate-900">
                          {appointment.department}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Date
                        </p>

                        <p className="font-semibold text-slate-900">
                          {appointment.appointment_date}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Time
                        </p>

                        <p className="font-semibold text-slate-900">
                          {appointment.appointment_time}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Priority
                        </p>

                        <p className="font-semibold text-slate-900">
                          {appointment.priority}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Queue Number
                        </p>

                        <p className="font-semibold text-slate-900">
                          {appointment.queue_number ??
                            "Not assigned"}
                        </p>
                      </div>

                      {appointment.notes && (
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-sm font-semibold text-slate-500">
                            Notes
                          </p>

                          <p className="mt-1 text-sm text-slate-700">
                            {appointment.notes}
                          </p>
                        </div>
                      )}

                    </div>
                  </div>
                )
              )}

            </div>
          )}

      </div>
    </main>
  );
}
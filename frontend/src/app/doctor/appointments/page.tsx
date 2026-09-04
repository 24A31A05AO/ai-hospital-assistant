"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type Appointment = {
  id: number;
  patient_id: number;
  hospital_id: number;
  doctor_id?: number | null;
  consultation_id?: number | null;
  department: string;
  appointment_date: string;
  appointment_time: string;
  queue_number?: number | null;
  priority: string;
  status: string;
  notes?: string | null;
  created_at: string;
};

export default function DoctorAppointmentsPage() {
  const router = useRouter();

  const [appointments, setAppointments] = useState<
    Appointment[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function loadAppointments() {
      try {
        setLoading(true);
        setError("");

        const data =
          await apiRequest<Appointment[]>(
            "/doctor/appointments"
          );

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
              Doctor Appointments
            </h1>

            <p className="mt-2 text-slate-600">
              View appointments assigned to you.
            </p>
          </div>

          <button
            onClick={() => router.push("/doctor")}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-white hover:bg-slate-800"
          >
            Back to Dashboard
          </button>
        </div>

        {loading && (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <p className="text-slate-600">
              Loading appointments...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load appointments
            </h2>

            <p className="mt-2 whitespace-pre-line text-red-700">
              {error}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          appointments.length === 0 && (
            <div className="rounded-xl bg-white p-10 text-center shadow">
              <h2 className="text-xl font-semibold text-slate-900">
                No appointments
              </h2>

              <p className="mt-2 text-slate-500">
                You currently have no assigned appointments.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          appointments.length > 0 && (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Appointment #{appointment.id}
                      </h2>

                      <p className="mt-2 text-sm text-slate-600">
                        Patient ID: {appointment.patient_id}
                      </p>

                      <p className="text-sm text-slate-600">
                        Department: {appointment.department}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="font-semibold text-slate-900">
                        {appointment.appointment_date}
                      </p>

                      <p className="text-slate-600">
                        {appointment.appointment_time}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">

                    <div>
                      <p className="text-xs uppercase text-slate-400">
                        Priority
                      </p>

                      <p className="font-medium text-slate-800">
                        {appointment.priority}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-slate-400">
                        Status
                      </p>

                      <p className="font-medium text-slate-800">
                        {appointment.status}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-slate-400">
                        Queue
                      </p>

                      <p className="font-medium text-slate-800">
                        {appointment.queue_number ??
                          "Not assigned"}
                      </p>
                    </div>
                  </div>

                  {appointment.consultation_id && (
                    <div className="mt-4">
                      <p className="text-sm text-slate-600">
                        Consultation ID:{" "}
                        {appointment.consultation_id}
                      </p>
                    </div>
                  )}

                  {appointment.notes && (
                    <div className="mt-4 rounded-lg bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Notes
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {appointment.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
      </div>
    </main>
  );
}
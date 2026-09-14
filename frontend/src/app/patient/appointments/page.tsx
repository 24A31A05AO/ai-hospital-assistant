"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getMyAppointments,
  type Appointment,
} from "@/lib/api";

function formatDate(dateValue: string): string {
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(timeValue: string): string {
  const [hoursText, minutesText] = timeValue.split(":");
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return timeValue;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClasses(status: string): string {
  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus === "completed" ||
    normalizedStatus === "in_consultation"
  ) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (
    normalizedStatus === "cancelled" ||
    normalizedStatus === "no_show"
  ) {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  if (normalizedStatus === "called") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }

  return "border-amber-500/30 bg-amber-500/10 text-amber-300";
}

function formatStatus(status: string): string {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getPriorityClasses(priority: string): string {
  const normalizedPriority = priority.toLowerCase();

  if (normalizedPriority === "high") {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  if (normalizedPriority === "medium") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  return "border-slate-600 bg-slate-800 text-slate-300";
}

export default function PatientAppointmentsPage() {
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAppointments() {
      const token = localStorage.getItem("access_token");
      const role = localStorage.getItem("user_role");

      if (!token || role !== "patient") {
        router.replace("/login");
        return;
      }

      try {
        const data = await getMyAppointments();

        if (isMounted) {
          setAppointments(data);
        }
      } catch (err) {
        console.error("Failed to load appointments:", err);

        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your appointments."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAppointments();

    return () => {
      isMounted = false;
    };
  }, [router]);

  function goToDashboard() {
    router.push("/dashboard");
  }

  function goToBookingPage() {
    router.push("/patient/appointments/book");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6">
        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
          <div className="w-full rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

            <h1 className="text-xl font-bold">
              Loading your appointments
            </h1>

            <p className="mt-2 text-slate-400">
              Please wait while we retrieve your appointment details.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              Patient Portal
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My Appointments
            </h1>

            <p className="mt-3 text-slate-400">
              View and manage your hospital appointment details.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={goToDashboard}
              className="rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-blue-500 hover:bg-slate-800"
            >
              ← Dashboard
            </button>

            <button
              type="button"
              onClick={goToBookingPage}
              className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              + Book Appointment
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
          >
            <strong>Error: </strong>
            {error}
          </div>
        )}

        {/* Empty state */}
        {!error && appointments.length === 0 && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-3xl">
              📅
            </div>

            <h2 className="text-2xl font-bold">
              No appointments found
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-400">
              You have not booked any appointments yet. Book your first
              appointment to get started.
            </p>

            <button
              type="button"
              onClick={goToBookingPage}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              Book Your First Appointment
            </button>
          </div>
        )}

        {/* Appointment cards */}
        {appointments.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            {appointments.map((appointment) => {
              const status = appointment.status || "booked";
              const priority = appointment.priority || "Low";

              return (
                <article
                  key={appointment.id}
                  className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl"
                >
                  {/* Card header */}
                  <div className="border-b border-slate-800 bg-slate-900/80 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                          Appointment
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-white">
                          #{appointment.id}
                        </h2>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            status
                          )}`}
                        >
                          {formatStatus(status)}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityClasses(
                            priority
                          )}`}
                        >
                          {priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="space-y-5 p-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Department
                      </p>

                      <p className="mt-1 text-lg font-semibold text-white">
                        {appointment.department || "Not specified"}
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Date
                        </p>

                        <p className="mt-2 font-semibold text-slate-200">
                          {formatDate(appointment.appointment_date)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Time
                        </p>

                        <p className="mt-2 font-semibold text-slate-200">
                          {formatTime(appointment.appointment_time)}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Hospital ID
                        </p>

                        <p className="mt-1 text-slate-300">
                          {appointment.hospital_id}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Doctor ID
                        </p>

                        <p className="mt-1 text-slate-300">
                          {appointment.doctor_id ?? "Not assigned"}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Consultation ID
                        </p>

                        <p className="mt-1 text-slate-300">
                          {appointment.consultation_id ?? "Not linked"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Queue Number
                        </p>

                        <p className="mt-1 text-slate-300">
                          {appointment.queue_number ?? "Not assigned"}
                        </p>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Notes
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {appointment.notes}
                        </p>
                      </div>
                    )}

                    {appointment.patient && (
                      <div className="border-t border-slate-800 pt-5">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Patient Information
                        </p>

                        <div className="space-y-1 text-sm text-slate-300">
                          <p>
                            <span className="text-slate-500">Name: </span>
                            {appointment.patient.full_name}
                          </p>

                          {appointment.patient.phone && (
                            <p>
                              <span className="text-slate-500">Phone: </span>
                              {appointment.patient.phone}
                            </p>
                          )}

                          {appointment.patient.email && (
                            <p>
                              <span className="text-slate-500">Email: </span>
                              {appointment.patient.email}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
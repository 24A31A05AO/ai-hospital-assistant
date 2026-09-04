"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getDoctorConsultations,
  updateDoctorConsultation,
  getDoctorAppointments,
  type Consultation,
  type Appointment,
} from "@/lib/api";

/* =========================================================
   HELPERS
========================================================= */

function parseList(
  value: string | string[] | null | undefined
): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item).trim())
        .filter(Boolean);
    }

    if (parsed !== null && parsed !== undefined) {
      return [String(parsed).trim()].filter(Boolean);
    }
  } catch {
    // Not JSON.
  }

  return value
    .split(/(?=[A-Z][a-z])/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function priorityClass(
  priority: string | null | undefined
): string {
  const value = (priority || "normal").toLowerCase();

  if (
    value === "emergency" ||
    value === "high"
  ) {
    return "border border-red-200 bg-red-100 text-red-800";
  }

  if (
    value === "medium" ||
    value === "moderate"
  ) {
    return "border border-yellow-200 bg-yellow-100 text-yellow-800";
  }

  return "border border-green-200 bg-green-100 text-green-800";
}

function statusClass(
  status: string | null | undefined
): string {
  const value = (status || "pending").toLowerCase();

  if (value === "completed") {
    return "bg-green-100 text-green-800";
  }

  if (
    value === "in_progress" ||
    value === "in progress"
  ) {
    return "bg-blue-100 text-blue-800";
  }

  if (value === "reviewed") {
    return "bg-purple-100 text-purple-800";
  }

  if (value === "referred") {
    return "bg-orange-100 text-orange-800";
  }

  if (value === "cancelled") {
    return "bg-red-100 text-red-800";
  }

  return "bg-slate-100 text-slate-700";
}

function appointmentStatusClass(
  status: string | null | undefined
): string {
  const value = (status || "booked").toLowerCase();

  if (
    value === "completed" ||
    value === "done"
  ) {
    return "bg-green-100 text-green-800";
  }

  if (
    value === "cancelled" ||
    value === "canceled"
  ) {
    return "bg-red-100 text-red-800";
  }

  if (
    value === "in_progress" ||
    value === "in progress"
  ) {
    return "bg-blue-100 text-blue-800";
  }

  if (value === "booked") {
    return "bg-purple-100 text-purple-800";
  }

  return "bg-slate-100 text-slate-700";
}

function formatDate(
  value: string | null | undefined
): string {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString();
}

function formatAppointmentDate(
  value: string | null | undefined
): string {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAppointmentTime(
  value: string | null | undefined
): string {
  if (!value) {
    return "Time unavailable";
  }

  const parts = value.split(":");

  if (parts.length < 2) {
    return value;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return value;
  }

  const date = new Date();

  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/* =========================================================
   PATIENT DISPLAY
========================================================= */

type PatientDisplay = {
  id?: number;
  full_name?: string;
  email?: string;
  phone?: string;
  village?: string;
  role?: string;
};

function getPatient(
  consultation: Consultation
): PatientDisplay | null {
  if (!consultation.patient) {
    return null;
  }

  return consultation.patient as PatientDisplay;
}

/* =========================================================
   DOCTOR DASHBOARD
========================================================= */

export default function DoctorDashboard() {
  const router = useRouter();

  /* =======================================================
     CONSULTATION STATE
  ======================================================= */

  const [consultations, setConsultations] =
    useState<Consultation[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selected, setSelected] =
    useState<Consultation | null>(null);

  const [status, setStatus] =
    useState("");

  const [doctorNotes, setDoctorNotes] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  /* =======================================================
     APPOINTMENT STATE
  ======================================================= */

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [appointmentsLoading, setAppointmentsLoading] =
    useState(true);

  const [appointmentsError, setAppointmentsError] =
    useState("");

  /* =======================================================
     LOAD CONSULTATIONS
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadConsultations(
      isInitialLoad = false
    ) {
      const token =
        localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        if (isInitialLoad) {
          setLoading(true);
        }

        const data =
          await getDoctorConsultations();

        if (cancelled) {
          return;
        }

        console.log(
          "Doctor consultations:",
          data
        );

        setConsultations(data);

        setSelected((currentSelected) => {
          if (!currentSelected) {
            return null;
          }

          const updated =
            data.find(
              (item) =>
                item.id === currentSelected.id
            );

          return updated || currentSelected;
        });

        setError("");
      } catch (err) {
        console.error(
          "Failed to load doctor consultations:",
          err
        );

        if (!cancelled) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError(
              "Failed to load consultations"
            );
          }
        }
      } finally {
        if (!cancelled && isInitialLoad) {
          setLoading(false);
        }
      }
    }

    loadConsultations(true);

    const interval =
      window.setInterval(() => {
        loadConsultations(false);
      }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [router]);

  /* =======================================================
     LOAD APPOINTMENTS
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadAppointments() {
      const token =
        localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        setAppointmentsLoading(true);
        setAppointmentsError("");

        const data =
          await getDoctorAppointments();

        if (cancelled) {
          return;
        }

        console.log(
          "Doctor appointments:",
          data
        );

        setAppointments(data);
      } catch (err) {
        console.error(
          "Failed to load doctor appointments:",
          err
        );

        if (!cancelled) {
          if (err instanceof Error) {
            setAppointmentsError(
              err.message
            );
          } else {
            setAppointmentsError(
              "Failed to load appointments"
            );
          }
        }
      } finally {
        if (!cancelled) {
          setAppointmentsLoading(false);
        }
      }
    }

    loadAppointments();

    /*
      Refresh appointments every 5 seconds.
      This means an appointment assigned by
      the admin will appear automatically.
    */
    const interval =
      window.setInterval(() => {
        loadAppointments();
      }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [router]);

  /* =======================================================
     OPEN CONSULTATION
  ======================================================= */

  function openConsultation(
    consultation: Consultation
  ) {
    setSelected(consultation);

    setStatus(
      consultation.status || "pending"
    );

    setDoctorNotes(
      consultation.doctor_notes || ""
    );

    setError("");
  }

  /* =======================================================
     CLOSE CONSULTATION
  ======================================================= */

  function closeConsultation() {
    if (saving) {
      return;
    }

    setSelected(null);
    setStatus("");
    setDoctorNotes("");
    setError("");
  }

  /* =======================================================
     SAVE DOCTOR REVIEW
  ======================================================= */

  async function saveReview() {
    if (!selected) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updated =
        await updateDoctorConsultation(
          selected.id,
          status,
          doctorNotes
        );

      console.log(
        "Doctor review saved successfully:",
        updated
      );

      setConsultations((current) =>
        current.map((item) =>
          item.id === selected.id
            ? updated
            : item
        )
      );

      setSelected(null);
      setStatus("");
      setDoctorNotes("");
    } catch (err) {
      console.error(
        "Failed to update consultation:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Failed to update consultation"
        );
      }
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     LOGOUT
  ======================================================= */

  function logout() {
    localStorage.removeItem(
      "access_token"
    );

    router.push("/login");
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              AI Hospital Assistant
            </h1>

            <p className="text-sm text-slate-500">
              Doctor Dashboard
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Logout
          </button>

        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* =================================================
            PAGE TITLE
        ================================================= */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Doctor Dashboard
            </h2>

            <p className="mt-2 text-slate-600">
              Review patient consultations and
              manage your appointments.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 sm:self-auto">

            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />

            Live

          </div>

        </div>

        {/* =================================================
            CONSULTATIONS SECTION
        ================================================= */}

        <div className="mb-14">

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-slate-900">
              Patient Consultations
            </h2>

            <p className="mt-1 text-slate-600">
              Review consultations assigned to you.
            </p>

          </div>

          {/* CONSULTATION COUNT */}

          {!loading &&
            !error &&
            consultations.length > 0 && (
              <div className="mb-6 text-sm text-slate-500">
                {consultations.length}{" "}
                {consultations.length === 1
                  ? "consultation"
                  : "consultations"}{" "}
                available
              </div>
            )}

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">

              <p className="font-semibold">
                Error
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>

            </div>
          )}

          {/* LOADING */}

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

              <p className="mt-4 text-slate-700">
                Loading consultations...
              </p>

            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            consultations.length === 0 &&
            !error && (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                <div className="text-4xl">
                  📋
                </div>

                <h3 className="mt-4 text-xl font-semibold text-slate-900">
                  No consultations
                </h3>

                <p className="mt-2 text-slate-600">
                  No patient consultations are
                  available yet.
                </p>

                <p className="mt-4 text-sm text-slate-400">
                  This dashboard checks automatically
                  for new consultations.
                </p>

              </div>
            )}

          {/* CONSULTATION CARDS */}

          {!loading &&
            consultations.length > 0 && (

              <div className="grid gap-6 lg:grid-cols-2">

                {consultations.map(
                  (consultation) => {

                    const patient =
                      getPatient(
                        consultation
                      );

                    const patientName =
                      patient?.full_name ||
                      "Unknown Patient";

                    const village =
                      patient?.village ||
                      "Village not provided";

                    return (
                      <article
                        key={consultation.id}
                        className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm"
                      >

                        {/* PATIENT */}

                        <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-5">

                          <div className="flex items-start gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl text-white">
                              👤
                            </div>

                            <div className="min-w-0">

                              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                                Patient
                              </p>

                              <h3 className="mt-1 break-words text-xl font-bold text-slate-900">
                                {patientName}
                              </h3>

                              <div className="mt-2 space-y-1 text-sm text-slate-600">

                                <p>
                                  <span className="font-semibold">
                                    Village:
                                  </span>{" "}
                                  {village}
                                </p>

                                <p>
                                  <span className="font-semibold">
                                    Patient ID:
                                  </span>{" "}
                                  {consultation.user_id}
                                </p>

                                {patient?.phone && (
                                  <p>
                                    <span className="font-semibold">
                                      Phone:
                                    </span>{" "}
                                    {patient.phone}
                                  </p>
                                )}

                                {patient?.email && (
                                  <p className="break-all">
                                    <span className="font-semibold">
                                      Email:
                                    </span>{" "}
                                    {patient.email}
                                  </p>
                                )}

                              </div>

                            </div>

                          </div>

                        </div>

                        {/* HEADER */}

                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0">

                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Chief Complaint
                            </p>

                            <h3 className="mt-1 break-words text-xl font-bold text-slate-900">
                              {consultation.chief_complaint ||
                                "Not provided"}
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                              {formatDate(
                                consultation.created_at
                              )}
                            </p>

                          </div>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${priorityClass(
                              consultation.priority
                            )}`}
                          >
                            {consultation.priority ||
                              "Normal"}
                          </span>

                        </div>

                        {/* DEPARTMENT */}

                        <div className="mt-5 rounded-lg bg-slate-50 p-4">

                          <p className="text-sm font-semibold text-slate-700">
                            Department
                          </p>

                          <p className="mt-1 font-medium text-slate-900">
                            {consultation.department ||
                              "Not assigned"}
                          </p>

                        </div>

                        {/* AI SUMMARY */}

                        <div className="mt-5">

                          <p className="text-sm font-semibold text-slate-700">
                            AI Summary
                          </p>

                          <p className="mt-2 leading-6 text-slate-700">
                            {consultation.ai_summary ||
                              "No AI summary available."}
                          </p>

                        </div>

                        {/* STATUS */}

                        <div className="mt-5">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                              consultation.status
                            )}`}
                          >
                            Status:{" "}
                            {consultation.status ||
                              "Pending"}
                          </span>

                        </div>

                        {/* REVIEW */}

                        <button
                          type="button"
                          onClick={() =>
                            openConsultation(
                              consultation
                            )
                          }
                          className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
                        >
                          Review Consultation
                        </button>

                      </article>
                    );
                  }
                )}

              </div>
            )}

        </div>

        {/* =================================================
            APPOINTMENTS SECTION
        ================================================= */}

        <div>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <h2 className="text-2xl font-bold text-slate-900">
                My Appointments
              </h2>

              <p className="mt-1 text-slate-600">
                Appointments assigned to you.
              </p>

            </div>

            {!appointmentsLoading &&
              !appointmentsError && (
                <span className="self-start rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800 sm:self-auto">
                  {appointments.length}{" "}
                  {appointments.length === 1
                    ? "appointment"
                    : "appointments"}
                </span>
              )}

          </div>

          {/* APPOINTMENT ERROR */}

          {appointmentsError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">

              <p className="font-semibold">
                Unable to load appointments
              </p>

              <p className="mt-1 text-sm">
                {appointmentsError}
              </p>

            </div>
          )}

          {/* APPOINTMENT LOADING */}

          {appointmentsLoading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

              <p className="mt-4 text-slate-700">
                Loading appointments...
              </p>

            </div>
          )}

          {/* NO APPOINTMENTS */}

          {!appointmentsLoading &&
            !appointmentsError &&
            appointments.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                <div className="text-4xl">
                  📅
                </div>

                <h3 className="mt-4 text-xl font-semibold text-slate-900">
                  No appointments
                </h3>

                <p className="mt-2 text-slate-600">
                  You currently have no appointments
                  assigned to you.
                </p>

                <p className="mt-4 text-sm text-slate-400">
                  New appointments will appear
                  automatically.
                </p>

              </div>
            )}

          {/* APPOINTMENTS */}

          {!appointmentsLoading &&
            !appointmentsError &&
            appointments.length > 0 && (

              <div className="grid gap-6 lg:grid-cols-2">

                {appointments.map(
                  (appointment) => {

                    const patient =
                      appointment.patient;

                    return (
                      <article
                        key={appointment.id}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                      >

                        {/* APPOINTMENT HEADER */}

                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0">

                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Appointment #
                              {appointment.id}
                            </p>

                            <h3 className="mt-1 break-words text-xl font-bold text-slate-900">
                              {patient?.full_name ||
                                "Unknown Patient"}
                            </h3>

                          </div>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${appointmentStatusClass(
                              appointment.status
                            )}`}
                          >
                            {appointment.status ||
                              "booked"}
                          </span>

                        </div>

                        {/* PATIENT INFORMATION */}

                        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">

                          <p className="text-sm">
                            <span className="font-semibold">
                              Patient ID:
                            </span>{" "}
                            {appointment.patient_id}
                          </p>

                          {patient?.village && (
                            <p className="mt-2 text-sm">
                              <span className="font-semibold">
                                Village:
                              </span>{" "}
                              {patient.village}
                            </p>
                          )}

                          {patient?.phone && (
                            <p className="mt-2 text-sm">
                              <span className="font-semibold">
                                Phone:
                              </span>{" "}
                              {patient.phone}
                            </p>
                          )}

                          {patient?.email && (
                            <p className="mt-2 break-all text-sm">
                              <span className="font-semibold">
                                Email:
                              </span>{" "}
                              {patient.email}
                            </p>
                          )}

                        </div>

                        {/* DATE AND TIME */}

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">

                          <div className="rounded-xl border border-slate-200 p-4">

                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Appointment Date
                            </p>

                            <p className="mt-2 font-bold text-slate-900">
                              {formatAppointmentDate(
                                appointment.appointment_date
                              )}
                            </p>

                          </div>

                          <div className="rounded-xl border border-slate-200 p-4">

                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Appointment Time
                            </p>

                            <p className="mt-2 font-bold text-slate-900">
                              {formatAppointmentTime(
                                appointment.appointment_time
                              )}
                            </p>

                          </div>

                        </div>

                        {/* DEPARTMENT AND QUEUE */}

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">

                          <div className="rounded-xl bg-slate-50 p-4">

                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Department
                            </p>

                            <p className="mt-2 font-semibold text-slate-900">
                              {appointment.department ||
                                "Not assigned"}
                            </p>

                          </div>

                          <div className="rounded-xl bg-slate-50 p-4">

                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Queue Number
                            </p>

                            <p className="mt-2 text-xl font-bold text-blue-700">
                              {appointment.queue_number ??
                                "Not assigned"}
                            </p>

                          </div>

                        </div>

                        {/* PRIORITY */}

                        <div className="mt-5">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityClass(
                              appointment.priority
                            )}`}
                          >
                            Priority:{" "}
                            {appointment.priority ||
                              "Normal"}
                          </span>

                        </div>

                        {/* CONSULTATION */}

                        {appointment.consultation_id && (
                          <div className="mt-4">

                            <p className="text-sm text-slate-600">
                              <span className="font-semibold">
                                Consultation:
                              </span>{" "}
                              #
                              {
                                appointment.consultation_id
                              }
                            </p>

                          </div>
                        )}

                        {/* NOTES */}

                        {appointment.notes && (
                          <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4">

                            <p className="text-sm font-semibold text-yellow-800">
                              Appointment Notes
                            </p>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-yellow-900">
                              {appointment.notes}
                            </p>

                          </div>
                        )}

                      </article>
                    );
                  }
                )}

              </div>
            )}

        </div>

      </section>

      {/* ===================================================
          CONSULTATION REVIEW MODAL
      =================================================== */}

      {selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 sm:p-6">

          <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl sm:p-8">

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">

              <div>

                <h2 className="text-2xl font-bold text-slate-900">
                  Consultation #{selected.id}
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Patient ID:{" "}
                  {selected.user_id}
                </p>

                {getPatient(selected)?.full_name && (
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    Patient:{" "}
                    {getPatient(selected)?.full_name}
                  </p>
                )}

                {getPatient(selected)?.village && (
                  <p className="mt-1 text-sm text-slate-600">
                    Village:{" "}
                    {getPatient(selected)?.village}
                  </p>
                )}

              </div>

              <button
                type="button"
                onClick={closeConsultation}
                disabled={saving}
                className="rounded-lg px-3 py-1 text-2xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                aria-label="Close consultation"
              >
                ×
              </button>

            </div>

            <div className="mt-6 space-y-6">

              {/* SYMPTOMS */}

              <div className="rounded-xl border border-slate-200 bg-white p-5">

                <h3 className="font-bold text-slate-900">
                  Symptoms
                </h3>

                <p className="mt-2 leading-6 text-slate-700">
                  {selected.symptoms ||
                    "None provided"}
                </p>

              </div>

              {/* MEDICAL HISTORY */}

              <div className="rounded-xl border border-slate-200 bg-white p-5">

                <h3 className="font-bold text-slate-900">
                  Medical History
                </h3>

                <p className="mt-2 leading-6 text-slate-700">
                  {selected.medical_history ||
                    "None provided"}
                </p>

              </div>

              {/* MEDICATIONS */}

              <div className="rounded-xl border border-slate-200 bg-white p-5">

                <h3 className="font-bold text-slate-900">
                  Medications
                </h3>

                <p className="mt-2 leading-6 text-slate-700">
                  {selected.medications ||
                    "None provided"}
                </p>

              </div>

              {/* ALLERGIES */}

              <div className="rounded-xl border border-slate-200 bg-white p-5">

                <h3 className="font-bold text-slate-900">
                  Allergies
                </h3>

                <p className="mt-2 leading-6 text-slate-700">
                  {selected.allergies ||
                    "None provided"}
                </p>

              </div>

              {/* AI SUMMARY */}

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">

                <h3 className="font-bold text-blue-900">
                  AI Summary
                </h3>

                <p className="mt-2 leading-6 text-blue-900">
                  {selected.ai_summary ||
                    "No AI summary available."}
                </p>

              </div>

              {/* AI INFORMATION */}

              <div className="grid gap-6 md:grid-cols-3">

                {/* POSSIBLE CONDITIONS */}

                <div className="rounded-xl border border-slate-200 bg-white p-5">

                  <h3 className="font-bold text-slate-900">
                    Possible Conditions
                  </h3>

                  {parseList(
                    selected.possible_conditions
                  ).length > 0 ? (
                    <ul className="mt-3 list-disc space-y-2 pl-5">

                      {parseList(
                        selected.possible_conditions
                      ).map(
                        (item, index) => (
                          <li
                            key={index}
                            className="text-sm leading-5 text-slate-700"
                          >
                            {item}
                          </li>
                        )
                      )}

                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      None provided
                    </p>
                  )}

                </div>

                {/* RECOMMENDED TESTS */}

                <div className="rounded-xl border border-slate-200 bg-white p-5">

                  <h3 className="font-bold text-slate-900">
                    Recommended Tests
                  </h3>

                  {parseList(
                    selected.recommended_tests
                  ).length > 0 ? (
                    <ul className="mt-3 list-disc space-y-2 pl-5">

                      {parseList(
                        selected.recommended_tests
                      ).map(
                        (item, index) => (
                          <li
                            key={index}
                            className="text-sm leading-5 text-slate-700"
                          >
                            {item}
                          </li>
                        )
                      )}

                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      None provided
                    </p>
                  )}

                </div>

                {/* RED FLAGS */}

                <div className="rounded-xl border border-red-200 bg-red-50 p-5">

                  <h3 className="font-bold text-red-800">
                    Red Flags
                  </h3>

                  {parseList(
                    selected.red_flags
                  ).length > 0 ? (
                    <ul className="mt-3 list-disc space-y-2 pl-5">

                      {parseList(
                        selected.red_flags
                      ).map(
                        (item, index) => (
                          <li
                            key={index}
                            className="text-sm leading-5 text-red-800"
                          >
                            {item}
                          </li>
                        )
                      )}

                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-red-700">
                      None provided
                    </p>
                  )}

                </div>

              </div>

              {/* STATUS */}

              <div>

                <label
                  htmlFor="consultation-status"
                  className="mb-2 block font-bold text-slate-900"
                >
                  Consultation Status
                </label>

                <select
                  id="consultation-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                >

                  <option value="pending">
                    Pending
                  </option>

                  <option value="reviewed">
                    Reviewed
                  </option>

                  <option value="in_progress">
                    In Progress
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="referred">
                    Referred
                  </option>

                </select>

              </div>

              {/* DOCTOR NOTES */}

              <div>

                <label
                  htmlFor="doctor-notes"
                  className="mb-2 block font-bold text-slate-900"
                >
                  Doctor Notes
                </label>

                <textarea
                  id="doctor-notes"
                  value={doctorNotes}
                  onChange={(event) =>
                    setDoctorNotes(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  rows={6}
                  placeholder="Enter clinical notes..."
                  className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />

              </div>

              {/* ACTIONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeConsultation}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveReview}
                  disabled={saving}
                  className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Doctor Review"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}
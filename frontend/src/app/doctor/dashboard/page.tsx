"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getDoctorAppointments,
  Appointment,
} from "@/lib/api";


// ============================================================
// HELPERS
// ============================================================

function formatDate(
  value: string
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


function formatTime(
  value: string
): string {
  if (!value) {
    return "—";
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

  date.setHours(
    hours,
    minutes,
    0,
    0
  );

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


function priorityClass(
  priority: string
): string {
  const value =
    priority?.toLowerCase();

  if (value === "high") {
    return "bg-red-100 text-red-700";
  }

  if (value === "medium") {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-green-100 text-green-700";
}


function statusClass(
  status: string
): string {
  const value =
    status?.toLowerCase();

  if (value === "completed") {
    return "bg-green-100 text-green-700";
  }

  if (value === "cancelled") {
    return "bg-red-100 text-red-700";
  }

  if (value === "in_progress") {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-purple-100 text-purple-700";
}


// ============================================================
// PAGE
// ============================================================

export default function DoctorAppointmentsPage() {

  const [
    appointments,
    setAppointments,
  ] = useState<Appointment[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  // ==========================================================
  // LOAD APPOINTMENTS
  // ==========================================================

  const loadAppointments =
    useCallback(
      async (
        showRefresh = false
      ) => {

        try {

          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const data =
            await getDoctorAppointments();

          setAppointments(data);

        } catch (err) {

          console.error(
            "Unable to load doctor appointments:",
            err
          );

          if (
            err instanceof Error
          ) {
            setError(
              err.message
            );
          } else {
            setError(
              "Unable to load appointments."
            );
          }

        } finally {

          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    const token =
      localStorage.getItem(
        "access_token"
      );

    if (!token) {

      window.location.href =
        "/login";

      return;
    }

    loadAppointments();

  }, [
    loadAppointments,
  ]);


  // ==========================================================
  // AUTO REFRESH
  // ==========================================================

  useEffect(() => {

    const interval =
      window.setInterval(
        () => {
          loadAppointments(true);
        },
        10000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };

  }, [
    loadAppointments,
  ]);


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <main className="min-h-screen bg-slate-50 p-8">

        <div className="mx-auto max-w-6xl">

          <h1 className="text-3xl font-bold text-slate-900">
            My Appointments
          </h1>

          <p className="mt-2 text-slate-600">
            Loading appointments...
          </p>

        </div>

      </main>
    );
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-50 p-8">

      <div className="mx-auto max-w-6xl">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <h1 className="text-3xl font-bold text-slate-900">
              My Appointments
            </h1>

            <p className="mt-2 text-slate-600">
              Appointments assigned to you.
            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              loadAppointments(true)
            }
            disabled={refreshing}
            className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>


        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (

          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5">

            <h2 className="font-bold text-red-700">
              Unable to load appointments
            </h2>

            <p className="mt-1 text-red-600">
              {error}
            </p>

          </div>

        )}


        {/* ====================================================
            EMPTY
        ==================================================== */}

        {!error &&
          appointments.length === 0 && (

            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">

              <h2 className="text-xl font-bold text-slate-800">
                No appointments
              </h2>

              <p className="mt-2 text-slate-500">
                You currently have no appointments assigned to you.
              </p>

            </div>
          )}


        {/* ====================================================
            APPOINTMENTS
        ==================================================== */}

        {appointments.length > 0 && (

          <div className="grid gap-6 md:grid-cols-2">

            {appointments.map(
              (
                appointment
              ) => (

                <article
                  key={
                    appointment.id
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >

                  {/* ==========================================
                      TOP
                  ========================================== */}

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        Appointment
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-slate-900">
                        #{appointment.id}
                      </h2>

                    </div>


                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${priorityClass(
                        appointment.priority
                      )}`}
                    >
                      {appointment.priority ||
                        "Low"}
                    </span>

                  </div>


                  {/* ==========================================
                      PATIENT
                  ========================================== */}

                  <div className="mt-6 rounded-xl bg-slate-50 p-4">

                    <p className="text-sm font-semibold text-slate-500">
                      Patient
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {appointment.patient
                        ?.full_name ||
                        "Unknown patient"}
                    </p>

                    {appointment.patient
                      ?.phone && (

                      <p className="mt-1 text-sm text-slate-600">
                        Phone:{" "}
                        {
                          appointment
                            .patient
                            .phone
                        }
                      </p>
                    )}

                    {appointment.patient
                      ?.village && (

                      <p className="mt-1 text-sm text-slate-600">
                        Village:{" "}
                        {
                          appointment
                            .patient
                            .village
                        }
                      </p>
                    )}

                  </div>


                  {/* ==========================================
                      APPOINTMENT DETAILS
                  ========================================== */}

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">

                    <div>

                      <p className="text-sm font-semibold text-slate-500">
                        Department
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {
                          appointment
                            .department
                        }
                      </p>

                    </div>


                    <div>

                      <p className="text-sm font-semibold text-slate-500">
                        Date
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {formatDate(
                          appointment
                            .appointment_date
                        )}
                      </p>

                    </div>


                    <div>

                      <p className="text-sm font-semibold text-slate-500">
                        Time
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {formatTime(
                          appointment
                            .appointment_time
                        )}
                      </p>

                    </div>


                    <div>

                      <p className="text-sm font-semibold text-slate-500">
                        Queue Number
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {appointment
                          .queue_number ??
                          "Not assigned"}
                      </p>

                    </div>

                  </div>


                  {/* ==========================================
                      STATUS
                  ========================================== */}

                  <div className="mt-5">

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                        appointment.status
                      )}`}
                    >
                      Status:{" "}
                      {
                        appointment
                          .status
                      }
                    </span>

                  </div>


                  {/* ==========================================
                      NOTES
                  ========================================== */}

                  {appointment.notes && (

                    <div className="mt-5">

                      <p className="text-sm font-semibold text-slate-500">
                        Notes
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-slate-700">
                        {
                          appointment
                            .notes
                        }
                      </p>

                    </div>
                  )}


                  {/* ==========================================
                      CONSULTATION
                  ========================================== */}

                  {appointment
                    .consultation_id !==
                    null && (

                    <div className="mt-5 rounded-lg bg-blue-50 p-3">

                      <p className="text-sm font-semibold text-blue-700">
                        Consultation
                      </p>

                      <p className="mt-1 text-sm text-blue-600">
                        Consultation #
                        {
                          appointment
                            .consultation_id
                        }
                      </p>

                    </div>
                  )}

                </article>
              )
            )}

          </div>
        )}

      </div>

    </main>
  );
}
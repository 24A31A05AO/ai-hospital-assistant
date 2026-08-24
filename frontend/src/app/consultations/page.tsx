"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getPatientConsultations,
  type Consultation,
} from "@/lib/api";

export default function PatientConsultationsPage() {
  const router = useRouter();

  const [consultations, setConsultations] = useState<Consultation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD CONSULTATIONS
  // ============================================================

  const loadConsultations = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const data = await getPatientConsultations();

      setConsultations(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to load consultations:",
        err
      );

      if (err instanceof Error) {
        const message = err.message.toLowerCase();

        if (
          message.includes("401") ||
          message.includes("unauthorized") ||
          message.includes("token")
        ) {
          localStorage.removeItem(
            "access_token"
          );

          router.replace("/login");
          return;
        }

        setError(err.message);
      } else {
        setError(
          "Unable to load your consultations."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadConsultations();
  }, []);

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (
    date: string | null | undefined
  ) => {
    if (!date) {
      return "Date not available";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Date not available";
    }

    return parsedDate.toLocaleString();
  };

  // ============================================================
  // PRIORITY STYLE
  // ============================================================

  const priorityClass = (
    priority?: string | null
  ) => {
    const value =
      priority?.toLowerCase();

    if (value === "emergency") {
      return "bg-red-100 text-red-700";
    }

    if (value === "high") {
      return "bg-orange-100 text-orange-700";
    }

    if (value === "medium") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-green-100 text-green-700";
  };

  // ============================================================
  // STATUS STYLE
  // ============================================================

  const statusClass = (
    status?: string | null
  ) => {
    const value =
      status?.toLowerCase();

    if (value === "reviewed") {
      return "bg-green-100 text-green-700";
    }

    if (
      value === "in_progress" ||
      value === "in progress"
    ) {
      return "bg-blue-100 text-blue-700";
    }

    if (value === "pending") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (value === "completed") {
      return "bg-green-100 text-green-700";
    }

    if (value === "referred") {
      return "bg-purple-100 text-purple-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  // ============================================================
  // FORMAT STATUS
  // ============================================================

  const formatStatus = (
    status: string | null | undefined
  ) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {
    localStorage.removeItem(
      "access_token"
    );

    router.replace("/login");
  };

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Consultations
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                View your previous consultations
                and AI summaries.
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-6xl items-center justify-center px-6 py-20">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800" />

            <p className="mt-4 text-gray-600">
              Loading consultations...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // ERROR SCREEN
  // ============================================================

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Consultations
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                View your previous consultations
                and AI summaries.
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-700">
              Unable to load consultations
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={loadConsultations}
              className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Consultations
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View your previous consultations
              and AI summaries.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                router.push("/dashboard")
              }
              className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Dashboard
            </button>

            <button
              onClick={logout}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      {/* ========================================================
          CONTENT
      ======================================================== */}

      <div className="mx-auto max-w-6xl px-6 py-8">

        {/* ======================================================
            TITLE + NEW CONSULTATION
        ====================================================== */}

        <div className="mb-6 flex items-center justify-between">

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Consultation History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {consultations.length}{" "}
              {consultations.length === 1
                ? "consultation"
                : "consultations"}
            </p>
          </div>

          <button
            onClick={() =>
              router.push("/consultation")
            }
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Start New Consultation
          </button>

        </div>

        {/* ======================================================
            NO CONSULTATIONS
        ====================================================== */}

        {consultations.length === 0 ? (

          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">

            <div className="text-5xl">
              📋
            </div>

            <h3 className="mt-5 text-xl font-semibold text-gray-900">
              No consultations yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              You have not submitted any
              consultations yet. Start your
              first consultation to get an
              AI-generated patient summary.
            </p>

            <button
              onClick={() =>
                router.push("/consultation")
              }
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              Start Consultation
            </button>

          </div>

        ) : (

          /* ====================================================
             CONSULTATION LIST
          ==================================================== */

          <div className="space-y-5">

            {consultations.map(
              (consultation) => (

                <div
                  key={consultation.id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >

                  {/* ==========================================
                      TOP SECTION
                  ========================================== */}

                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                    <div>

                      <p className="text-sm font-medium text-gray-500">
                        Consultation #
                        {consultation.id}
                      </p>

                      <h3 className="mt-1 text-xl font-semibold text-gray-900">
                        {consultation.chief_complaint ||
                          "General Consultation"}
                      </h3>

                      <p className="mt-2 text-sm text-gray-500">
                        Submitted:{" "}
                        {formatDate(
                          consultation.created_at
                        )}
                      </p>

                    </div>

                    {/* PRIORITY + STATUS */}

                    <div className="flex flex-wrap gap-2">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass(
                          consultation.priority
                        )}`}
                      >
                        {consultation.priority ||
                          "Normal"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                          consultation.status
                        )}`}
                      >
                        {formatStatus(
                          consultation.status
                        )}
                      </span>

                    </div>

                  </div>

                  {/* ==========================================
                      DEPARTMENT / DOCTOR / STATUS
                  ========================================== */}

                  <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">

                    {/* DEPARTMENT */}

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Department
                      </p>

                      <p className="mt-1 text-gray-900">
                        {consultation.department ||
                          "Not assigned"}
                      </p>

                    </div>

                    {/* DOCTOR */}

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Doctor
                      </p>

                      <p className="mt-1 font-medium text-gray-900">
                        {consultation.doctor
                          ?.full_name ||
                          "Not assigned"}
                      </p>

                    </div>

                    {/* STATUS */}

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </p>

                      <p className="mt-1 text-gray-900">
                        {formatStatus(
                          consultation.status
                        )}
                      </p>

                    </div>

                  </div>

                  {/* ==========================================
                      AI SUMMARY
                  ========================================== */}

                  {consultation.ai_summary && (

                    <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">

                      <h4 className="font-semibold text-blue-900">
                        AI Summary
                      </h4>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-blue-900">
                        {consultation.ai_summary}
                      </p>

                    </div>

                  )}

                  {/* ==========================================
                      DOCTOR NOTES
                  ========================================== */}

                  {consultation.doctor_notes ? (

                    <div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-5">

                      <div className="flex items-center gap-2">

                        <span className="text-lg">
                          🩺
                        </span>

                        <h4 className="font-semibold text-green-900">
                          Doctor Notes
                        </h4>

                      </div>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-green-900">
                        {consultation.doctor_notes}
                      </p>

                    </div>

                  ) : (

                    <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">

                      <div className="flex items-center gap-2">

                        <span className="text-lg">
                          🩺
                        </span>

                        <h4 className="font-semibold text-gray-700">
                          Doctor Notes
                        </h4>

                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        No doctor notes have been
                        added yet.
                      </p>

                    </div>

                  )}

                  {/* ==========================================
                      VIEW CONSULTATION
                  ========================================== */}

                  <div className="mt-6 flex justify-end">

                    <button
                      onClick={() =>
                        router.push(
                          `/consultations/${consultation.id}`
                        )
                      }
                      className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      View Consultation
                    </button>

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
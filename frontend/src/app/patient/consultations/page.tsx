"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getPatientConsultations,
  type Consultation,
} from "@/lib/api";

export default function PatientConsultationsPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);

    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");

    if (!token || role !== "patient") {
      router.replace("/login");
      return;
    }

    loadConsultations();
  }, [router]);

  async function loadConsultations() {
    try {
      setLoading(true);
      setError("");

      const data = await getPatientConsultations();

      setConsultations(data);
    } catch (err: unknown) {
      console.error("Consultation history error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to load your consultation history."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: string | null | undefined) {
    if (!date) {
      return "Date not available";
    }

    try {
      return new Date(date).toLocaleString();
    } catch {
      return date;
    }
  }

  function formatStatus(status: string | null | undefined) {
    if (!status) {
      return "Submitted";
    }

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function getStatusClass(status: string | null | undefined) {
    switch (status?.toLowerCase()) {
      case "reviewed":
        return "bg-green-100 text-green-700";

      case "in_review":
      case "under_review":
        return "bg-blue-100 text-blue-700";

      case "emergency":
        return "bg-red-100 text-red-700";

      case "pending":
      case "submitted":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  function getPriorityClass(priority: string | null | undefined) {
    switch (priority?.toLowerCase()) {
      case "emergency":
        return "bg-red-100 text-red-700";

      case "high":
        return "bg-orange-100 text-orange-700";

      case "medium":
        return "bg-yellow-100 text-yellow-700";

      case "low":
        return "bg-green-100 text-green-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  function openConsultation(id: number) {
    router.push(`/patient/consultations/${id}`);
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-slate-900">
            My Consultation History
          </h1>

          <p className="mt-2 text-slate-600">
            View your previous consultations and their status.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[70px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">

          <div>
            <h1 className="text-lg font-bold text-slate-950 sm:text-xl">
              AI Hospital Assistant
            </h1>

            <p className="text-xs text-slate-500 sm:text-sm">
              My Consultation History
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/patient/dashboard")
            }
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Dashboard
          </button>

        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">

        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              Consultation Records
            </div>

            <h2 className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl">
              My Consultation History
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              View the consultations you have submitted,
              their current status, AI-assisted information,
              and healthcare team updates.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/consultation")
            }
            className="rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
          >
            + Start New Consultation
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-700">
                !
              </div>

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Unable to load consultations
                </p>

                <p className="mt-1 whitespace-pre-line text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadConsultations}
                  className="mt-3 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>

            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm font-semibold text-slate-600">
              Loading your consultation history...
            </p>

          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && consultations.length === 0 && (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-16">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-600">
              +
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-950">
              No consultations yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You have not submitted any consultations.
              Start your first consultation to provide
              your health information to the healthcare team.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/consultation")
              }
              className="mt-6 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Start Consultation
            </button>

          </div>
        )}

        {/* CONSULTATION HISTORY */}
        {!loading && consultations.length > 0 && (
          <div className="space-y-5">

            {consultations.map((consultation) => (
              <article
                key={consultation.id}
                className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-7"
              >

                {/* TOP */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                      Consultation #{consultation.id}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(consultation.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClass(
                        consultation.status
                      )}`}
                    >
                      {formatStatus(consultation.status)}
                    </span>

                    {consultation.priority && (
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${getPriorityClass(
                          consultation.priority
                        )}`}
                      >
                        {consultation.priority}
                      </span>
                    )}

                  </div>

                </div>

                {/* MAIN CONTENT */}
                <div className="mt-6 grid gap-5 md:grid-cols-2">

                  {/* COMPLAINT */}
                  <div className="rounded-2xl bg-slate-50 p-5">

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Main complaint
                    </p>

                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-800">
                      {consultation.chief_complaint ||
                        "Not provided"}
                    </p>

                  </div>

                  {/* DEPARTMENT */}
                  <div className="rounded-2xl bg-slate-50 p-5">

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Department
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {consultation.department ||
                        "To be assigned"}
                    </p>

                  </div>

                </div>

                {/* SYMPTOMS */}
                {consultation.symptoms && (
                  <div className="mt-4 rounded-2xl border border-slate-200 p-5">

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Symptoms
                    </p>

                    <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {consultation.symptoms}
                    </p>

                  </div>
                )}

                {/* AI SUMMARY */}
                {consultation.ai_summary && (
                  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-5">

                    <div className="flex items-center gap-2">

                      <span className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-blue-700 shadow-sm">
                        AI
                      </span>

                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        AI-assisted summary
                      </p>

                    </div>

                    <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {consultation.ai_summary}
                    </p>

                  </div>
                )}

                {/* DOCTOR REVIEW */}
                {consultation.doctor_notes && (
                  <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-5">

                    <p className="text-xs font-bold uppercase tracking-wider text-green-600">
                      Healthcare team notes
                    </p>

                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {consultation.doctor_notes}
                    </p>

                  </div>
                )}

                {/* FOOTER */}
                <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-xs text-slate-400">
                    Your consultation record
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      openConsultation(consultation.id)
                    }
                    className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
                  >                
                  </button>

                </div>

              </article>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}
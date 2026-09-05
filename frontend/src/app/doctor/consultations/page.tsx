"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getDoctorConsultations,
  Consultation,
} from "@/lib/api";

function priorityClass(priority?: string | null) {
  const value = priority?.toLowerCase();

  if (value === "emergency" || value === "high") {
    return "bg-red-100 text-red-700";
  }

  if (value === "medium") {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-green-100 text-green-700";
}

function statusClass(status?: string | null) {
  const value = status?.toLowerCase();

  if (value === "completed" || value === "reviewed") {
    return "bg-green-100 text-green-700";
  }

  if (value === "in_progress") {
    return "bg-blue-100 text-blue-700";
  }

  if (value === "referred") {
    return "bg-orange-100 text-orange-700";
  }

  return "bg-purple-100 text-purple-700";
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DoctorConsultationsPage() {
  const router = useRouter();

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadConsultations = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const data = await getDoctorConsultations();

        setConsultations(data);
      } catch (err) {
        console.error("Unable to load consultations:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load consultations."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    loadConsultations();
  }, [router, loadConsultations]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadConsultations(true);
    }, 10000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadConsultations]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-slate-900">
            Patient Consultations
          </h1>

          <p className="mt-2 text-slate-600">
            Loading consultations...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Patient Consultations
            </h1>

            <p className="mt-2 text-slate-600">
              Consultations assigned to you.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/doctor")}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => loadConsultations(true)}
              disabled={refreshing}
              className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5">
            <h2 className="font-bold text-red-700">
              Unable to load consultations
            </h2>

            <p className="mt-1 whitespace-pre-wrap text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* EMPTY */}

        {!error && consultations.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-800">
              No consultations
            </h2>

            <p className="mt-2 text-slate-500">
              No consultations are currently assigned to you.
            </p>
          </div>
        )}

        {/* CONSULTATIONS */}

        {consultations.length > 0 && (
          <div className="space-y-6">
            {consultations.map((consultation) => (
              <article
                key={consultation.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                {/* TOP */}

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Consultation
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                      #{consultation.id}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Created: {formatDate(consultation.created_at)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${priorityClass(
                        consultation.priority
                      )}`}
                    >
                      {consultation.priority || "Low"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                        consultation.status
                      )}`}
                    >
                      {consultation.status || "pending"}
                    </span>
                  </div>
                </div>

                {/* PATIENT */}

                <div className="mt-6 rounded-xl bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">
                    Patient
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {consultation.patient?.full_name ||
                      "Unknown patient"}
                  </p>

                  {consultation.patient?.phone && (
                    <p className="mt-1 text-sm text-slate-600">
                      Phone: {consultation.patient.phone}
                    </p>
                  )}

                  {consultation.patient?.email && (
                    <p className="mt-1 text-sm text-slate-600">
                      Email: {consultation.patient.email}
                    </p>
                  )}

                  {consultation.patient?.village && (
                    <p className="mt-1 text-sm text-slate-600">
                      Village: {consultation.patient.village}
                    </p>
                  )}
                </div>

                {/* DETAILS */}

                <div className="mt-6 grid gap-5 md:grid-cols-2">

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Chief Complaint
                    </p>

                    <p className="mt-1 text-slate-800">
                      {consultation.chief_complaint || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Department
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {consultation.department || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Symptoms
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-slate-800">
                      {consultation.symptoms || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Medical History
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-slate-800">
                      {consultation.medical_history || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Medications
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-slate-800">
                      {consultation.medications || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Allergies
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-slate-800">
                      {consultation.allergies || "—"}
                    </p>
                  </div>
                </div>

                {/* AI SUMMARY */}

                {consultation.ai_summary && (
                  <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
                    <p className="font-bold text-blue-800">
                      AI Summary
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-blue-900">
                      {consultation.ai_summary}
                    </p>
                  </div>
                )}

                {/* DOCTOR NOTES */}

                {consultation.doctor_notes && (
                  <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
                    <p className="font-bold text-green-800">
                      Doctor Notes
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-green-900">
                      {consultation.doctor_notes}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
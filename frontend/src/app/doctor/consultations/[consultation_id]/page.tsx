"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getDoctorConsultation,
  updateDoctorConsultation,
  Consultation,
} from "@/lib/api";

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

export default function DoctorConsultationDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const consultationId = Number(params.consultation_id);

  const [consultation, setConsultation] =
    useState<Consultation | null>(null);

  const [status, setStatus] = useState("pending");
  const [doctorNotes, setDoctorNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // LOAD CONSULTATION
  // ============================================================

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!consultationId || Number.isNaN(consultationId)) {
      setError("Invalid consultation ID.");
      setLoading(false);
      return;
    }

    async function loadConsultation() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getDoctorConsultation(consultationId);

        setConsultation(data);

        setStatus(
          data.status || "pending"
        );

        setDoctorNotes(
          data.doctor_notes || ""
        );
      } catch (err) {
        console.error(
          "Unable to load consultation:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load consultation."
        );
      } finally {
        setLoading(false);
      }
    }

    loadConsultation();
  }, [consultationId, router]);

  // ============================================================
  // SAVE DOCTOR REVIEW
  // ============================================================

  async function handleSaveReview() {
    if (!consultation) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updated =
        await updateDoctorConsultation(
          consultation.id,
          status,
          doctorNotes
        );

      setConsultation(updated);

      setStatus(
        updated.status || status
      );

      setDoctorNotes(
        updated.doctor_notes || doctorNotes
      );

      setSuccess(
        "Consultation review saved successfully."
      );
    } catch (err) {
      console.error(
        "Unable to save consultation:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save consultation."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-slate-600">
            Loading consultation...
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // ERROR / NOT FOUND
  // ============================================================

  if (error && !consultation) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-5xl">

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-xl font-bold text-red-700">
              Unable to load consultation
            </h1>

            <p className="mt-2 whitespace-pre-wrap text-red-600">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/doctor/consultations")
            }
            className="mt-6 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700"
          >
            Back to Consultations
          </button>

        </div>
      </main>
    );
  }

  if (!consultation) {
    return null;
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-5xl">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Doctor Review
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Consultation #{consultation.id}
            </h1>

            <p className="mt-2 text-slate-600">
              Created:{" "}
              {formatDate(
                consultation.created_at
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/doctor/consultations")
            }
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
          >
            Back to Consultations
          </button>

        </div>

        {/* ======================================================
            ALERTS
        ====================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-700">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5">
            <p className="font-semibold text-green-700">
              {success}
            </p>
          </div>
        )}

        {/* ======================================================
            CURRENT STATUS
        ====================================================== */}

        <div className="mb-6 flex flex-wrap gap-3">

          <span
            className={`rounded-full px-4 py-2 text-sm font-bold ${priorityClass(
              consultation.priority
            )}`}
          >
            Priority:{" "}
            {consultation.priority || "Low"}
          </span>

          <span
            className={`rounded-full px-4 py-2 text-sm font-bold ${statusClass(
              consultation.status
            )}`}
          >
            Current Status:{" "}
            {consultation.status || "Pending"}
          </span>

        </div>

        {/* ======================================================
            PATIENT INFORMATION
        ====================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            Patient Information
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Name
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {consultation.patient?.full_name ||
                  "Unknown patient"}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Phone
              </p>

              <p className="mt-1 text-slate-800">
                {consultation.patient?.phone || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Email
              </p>

              <p className="mt-1 text-slate-800">
                {consultation.patient?.email || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Village
              </p>

              <p className="mt-1 text-slate-800">
                {consultation.patient?.village || "—"}
              </p>
            </div>

          </div>

        </section>

        {/* ======================================================
            CONSULTATION DETAILS
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            Consultation Details
          </h2>

          <div className="mt-6 space-y-6">

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Chief Complaint
              </p>

              <p className="mt-2 whitespace-pre-wrap text-slate-800">
                {consultation.chief_complaint || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Symptoms
              </p>

              <p className="mt-2 whitespace-pre-wrap text-slate-800">
                {consultation.symptoms || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Medical History
              </p>

              <p className="mt-2 whitespace-pre-wrap text-slate-800">
                {consultation.medical_history || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Medications
              </p>

              <p className="mt-2 whitespace-pre-wrap text-slate-800">
                {consultation.medications || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Allergies
              </p>

              <p className="mt-2 whitespace-pre-wrap text-slate-800">
                {consultation.allergies || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Department
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {consultation.department || "—"}
              </p>
            </div>

          </div>

        </section>

        {/* ======================================================
            AI SUMMARY
        ====================================================== */}

        {consultation.ai_summary && (
          <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6">

            <h2 className="text-xl font-bold text-blue-800">
              AI Summary
            </h2>

            <p className="mt-3 whitespace-pre-wrap leading-7 text-blue-900">
              {consultation.ai_summary}
            </p>

          </section>
        )}

        {/* ======================================================
            DOCTOR REVIEW
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            Doctor Review
          </h2>

          <p className="mt-2 text-slate-600">
            Update the consultation status and add your
            clinical notes.
          </p>

          {/* STATUS */}

          <div className="mt-6">

            <label
              htmlFor="status"
              className="block text-sm font-semibold text-slate-700"
            >
              Consultation Status
            </label>

            <select
              id="status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="pending">
                Pending
              </option>

              <option value="in_progress">
                In Progress
              </option>

              <option value="reviewed">
                Reviewed
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

          <div className="mt-6">

            <label
              htmlFor="doctorNotes"
              className="block text-sm font-semibold text-slate-700"
            >
              Doctor Notes
            </label>

            <textarea
              id="doctorNotes"
              value={doctorNotes}
              onChange={(e) =>
                setDoctorNotes(e.target.value)
              }
              rows={7}
              placeholder="Enter your clinical notes, observations, recommendations, or follow-up instructions..."
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

          </div>

          {/* SAVE */}

          <div className="mt-6 flex justify-end">

            <button
              type="button"
              onClick={handleSaveReview}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Review"}
            </button>

          </div>

        </section>

        {/* ======================================================
            SAVED DOCTOR NOTES
        ====================================================== */}

        {consultation.doctor_notes && (
          <section className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">

            <div className="flex items-center justify-between gap-4">

              <h2 className="text-xl font-bold text-green-800">
                Saved Doctor Notes
              </h2>

              <span className="rounded-full bg-green-200 px-3 py-1 text-xs font-bold text-green-800">
                Saved
              </span>

            </div>

            <p className="mt-3 whitespace-pre-wrap leading-7 text-green-900">
              {consultation.doctor_notes}
            </p>

          </section>
        )}

      </div>
    </main>
  );
}
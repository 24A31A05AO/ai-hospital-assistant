"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createConsultation,
  type Consultation,
} from "@/lib/api";

export default function ConsultationPage() {
  const router = useRouter();

  const [chiefComplaint, setChiefComplaint] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState("");

  const [result, setResult] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ------------------------------------------------------------
  // CHECK LOGIN
  // ------------------------------------------------------------

  function checkLogin(): boolean {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");

    if (!token) {
      router.replace("/login");
      return false;
    }

    if (role && role !== "patient") {
      setError("Only patients can create consultations.");
      return false;
    }

    return true;
  }

  // ------------------------------------------------------------
  // FORMAT LIST
  // ------------------------------------------------------------

  function formatList(
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

    return String(value)
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  // ------------------------------------------------------------
  // STATUS
  // ------------------------------------------------------------

  function formatStatus(
    status: string | null | undefined
  ): string {
    if (!status) {
      return "Pending";
    }

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  // ------------------------------------------------------------
  // PRIORITY
  // ------------------------------------------------------------

  function getPriorityClass(
    priority: string | null | undefined
  ): string {
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

  // ------------------------------------------------------------
  // SUBMIT CONSULTATION
  // ------------------------------------------------------------

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setResult(null);

    if (!checkLogin()) {
      return;
    }

    // Required fields

    if (!chiefComplaint.trim()) {
      setError("Please describe your main health problem.");
      return;
    }

    if (!symptoms.trim()) {
      setError("Please describe your symptoms.");
      return;
    }

    setLoading(true);

    try {
      const consultation = await createConsultation({
        chief_complaint: chiefComplaint.trim(),
        symptoms: symptoms.trim(),
        medical_history: medicalHistory.trim(),
        medications: medications.trim(),
        allergies: allergies.trim(),
      });

      setResult(consultation);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Consultation error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to create consultation.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------------------------------
  // START NEW
  // ------------------------------------------------------------

  function startNewConsultation() {
    setResult(null);
    setError("");

    setChiefComplaint("");
    setSymptoms("");
    setMedicalHistory("");
    setMedications("");
    setAllergies("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex min-h-[70px] max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">

          <div>
            <h1 className="text-lg font-bold text-slate-950 sm:text-xl">
              AI Hospital Assistant
            </h1>

            <p className="text-xs text-slate-500 sm:text-sm">
              Patient Consultation
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/patient/dashboard")
            }
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Dashboard
          </button>

        </div>

      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">

        {/* ====================================================
            FORM HEADER
        ==================================================== */}

        {!result && (
          <div className="mb-8">

            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">

              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                +
              </span>

              Start Consultation

            </div>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Tell us what is bothering you.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Describe your health problem and symptoms.
              Your information will be organized and sent
              to the healthcare team for review.
            </p>

          </div>
        )}

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">

            <div className="flex gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-700">
                !
              </div>

              <div>
                <p className="font-semibold text-red-800">
                  Something went wrong
                </p>

                <p className="mt-1 whitespace-pre-line text-sm leading-6 text-red-700">
                  {error}
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ====================================================
            CONSULTATION FORM
        ==================================================== */}

        {!result && (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">

            <form
              onSubmit={handleSubmit}
              className="space-y-7"
            >

              {/* MAIN PROBLEM */}

              <div>

                <label
                  htmlFor="chiefComplaint"
                  className="mb-2 block text-sm font-bold text-slate-900"
                >
                  What is your main problem?
                </label>

                <p className="mb-3 text-xs text-slate-500">
                  Explain the main reason you need medical help.
                </p>

                <textarea
                  id="chiefComplaint"
                  value={chiefComplaint}
                  onChange={(event) =>
                    setChiefComplaint(event.target.value)
                  }
                  placeholder="Example: I have been having chest pain since this morning."
                  rows={4}
                  disabled={loading}
                  className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />

              </div>

              {/* SYMPTOMS */}

              <div>

                <label
                  htmlFor="symptoms"
                  className="mb-2 block text-sm font-bold text-slate-900"
                >
                  Describe your symptoms
                </label>

                <p className="mb-3 text-xs text-slate-500">
                  Include when they started and how severe they are.
                </p>

                <textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(event) =>
                    setSymptoms(event.target.value)
                  }
                  placeholder="Example: Fever, headache and weakness started two days ago."
                  rows={6}
                  disabled={loading}
                  className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />

              </div>

              {/* MEDICAL HISTORY */}

              <div>

                <label
                  htmlFor="medicalHistory"
                  className="mb-2 block text-sm font-bold text-slate-900"
                >
                  Medical history
                </label>

                <textarea
                  id="medicalHistory"
                  value={medicalHistory}
                  onChange={(event) =>
                    setMedicalHistory(event.target.value)
                  }
                  placeholder="Previous illnesses, surgeries or medical conditions. Write None if not applicable."
                  rows={4}
                  disabled={loading}
                  className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />

              </div>

              {/* MEDICATIONS */}

              <div>

                <label
                  htmlFor="medications"
                  className="mb-2 block text-sm font-bold text-slate-900"
                >
                  Current medications
                </label>

                <textarea
                  id="medications"
                  value={medications}
                  onChange={(event) =>
                    setMedications(event.target.value)
                  }
                  placeholder="List medicines you currently take, if any."
                  rows={3}
                  disabled={loading}
                  className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />

              </div>

              {/* ALLERGIES */}

              <div>

                <label
                  htmlFor="allergies"
                  className="mb-2 block text-sm font-bold text-slate-900"
                >
                  Allergies
                </label>

                <textarea
                  id="allergies"
                  value={allergies}
                  onChange={(event) =>
                    setAllergies(event.target.value)
                  }
                  placeholder="Mention medicine, food or other allergies. Write None if not applicable."
                  rows={3}
                  disabled={loading}
                  className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />

              </div>

              {/* NOTICE */}

              <div className="rounded-2xl bg-blue-50 p-4">

                <div className="flex gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                    ✓
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-slate-900">
                      Your information is sent to the healthcare team
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      The information you provide will be stored
                      with your consultation so the healthcare
                      professional can review it.
                    </p>

                  </div>

                </div>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Creating consultation...
                  </>
                ) : (
                  <>
                    Submit Consultation
                    <span>→</span>
                  </>
                )}

              </button>

            </form>

          </div>
        )}

        {/* ====================================================
            RESULT
        ==================================================== */}

        {result && (
          <div className="space-y-6">

            {/* SUCCESS */}

            <section className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-400 p-6 text-white shadow-xl sm:p-8">

              <div className="flex gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl">
                  ✓
                </div>

                <div>

                  <p className="text-sm font-semibold text-white/80">
                    Consultation submitted
                  </p>

                  <h2 className="mt-1 text-3xl font-bold sm:text-4xl">
                    Your problem has been recorded.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/80">
                    Your information is now available
                    for healthcare team review.
                  </p>

                </div>

              </div>

              <div className="mt-6 flex flex-wrap gap-3">

                <span className="rounded-full bg-white/20 px-4 py-2 text-xs font-bold">
                  Consultation #{result.id}
                </span>

                <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-blue-700">
                  {formatStatus(result.status)}
                </span>

              </div>

            </section>

            {/* PATIENT INFORMATION */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              <h3 className="text-xl font-bold text-slate-950">
                Your reported information
              </h3>

              <div className="mt-6 space-y-5">

                <InfoCard
                  title="Main problem"
                  value={
                    result.chief_complaint ||
                    "Not provided"
                  }
                />

                <InfoCard
                  title="Symptoms"
                  value={
                    result.symptoms ||
                    "Not provided"
                  }
                />

                <InfoCard
                  title="Medical history"
                  value={
                    result.medical_history ||
                    "Not provided"
                  }
                />

                <InfoCard
                  title="Current medications"
                  value={
                    result.medications ||
                    "Not provided"
                  }
                />

                <InfoCard
                  title="Allergies"
                  value={
                    result.allergies ||
                    "Not provided"
                  }
                />

              </div>

            </section>

            {/* AI SUMMARY */}

            {result.ai_summary && (
              <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6 sm:p-8">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-bold text-blue-700 shadow-sm">
                    AI
                  </div>

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                      AI assisted
                    </p>

                    <h3 className="text-xl font-bold text-slate-950">
                      Consultation summary
                    </h3>

                  </div>

                </div>

                <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-700">
                  {result.ai_summary}
                </p>

              </section>
            )}

            {/* DEPARTMENT + PRIORITY */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              <div className="grid gap-5 sm:grid-cols-2">

                <InfoCard
                  title="Department"
                  value={
                    result.department ||
                    "To be assigned"
                  }
                />

                <div className="rounded-2xl bg-slate-50 p-5">

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Priority
                  </p>

                  <span
                    className={`mt-3 inline-flex rounded-full px-4 py-2 text-sm font-bold ${getPriorityClass(
                      result.priority
                    )}`}
                  >
                    {result.priority ||
                      "Not specified"}
                  </span>

                </div>

              </div>

            </section>

            {/* POSSIBLE CONDITIONS */}

            {formatList(result.possible_conditions).length > 0 && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                <h3 className="text-xl font-bold text-slate-950">
                  Possible conditions
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  These are AI-generated possibilities and
                  are not confirmed diagnoses.
                </p>

                <div className="mt-5 space-y-2">

                  {formatList(
                    result.possible_conditions
                  ).map((condition, index) => (
                    <div
                      key={`${condition}-${index}`}
                      className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700"
                    >
                      {condition}
                    </div>
                  ))}

                </div>

              </section>
            )}

            {/* RECOMMENDED TESTS */}

            {formatList(result.recommended_tests).length > 0 && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                <h3 className="text-xl font-bold text-slate-950">
                  Recommended investigations
                </h3>

                <div className="mt-5 space-y-2">

                  {formatList(
                    result.recommended_tests
                  ).map((test, index) => (
                    <div
                      key={`${test}-${index}`}
                      className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700"
                    >
                      {test}
                    </div>
                  ))}

                </div>

              </section>
            )}

            {/* RED FLAGS */}

            {formatList(result.red_flags).length > 0 && (
              <section className="rounded-3xl border border-red-200 bg-red-50 p-6 sm:p-8">

                <h3 className="text-xl font-bold text-red-900">
                  Important warning
                </h3>

                <div className="mt-5 space-y-3">

                  {formatList(result.red_flags).map(
                    (warning, index) => (
                      <div
                        key={`${warning}-${index}`}
                        className="rounded-xl bg-white p-4 text-sm leading-6 text-red-800"
                      >
                        {warning}
                      </div>
                    )
                  )}

                </div>

              </section>
            )}

            {/* DOCTOR */}

            {result.doctor && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Assigned doctor
                </p>

                <h3 className="mt-2 text-xl font-bold text-slate-950">
                  {result.doctor.full_name}
                </h3>

                {result.doctor.email && (
                  <p className="mt-1 text-sm text-slate-500">
                    {result.doctor.email}
                  </p>
                )}

              </section>
            )}

            {/* DOCTOR NOTES */}

            {result.doctor_notes && (
              <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6 sm:p-8">

                <h3 className="text-xl font-bold text-blue-900">
                  Doctor Notes
                </h3>

                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-blue-800">
                  {result.doctor_notes}
                </p>

              </section>
            )}

            {/* DISCLAIMER */}

            <section className="rounded-2xl border border-slate-200 bg-slate-100 p-5">

              <p className="text-xs leading-6 text-slate-600">
                <strong>Important:</strong> AI-generated
                information is preliminary decision-support
                information only. It is not a confirmed
                diagnosis and does not replace assessment by
                a qualified healthcare professional. If you
                believe you are experiencing an emergency,
                seek immediate medical attention.
              </p>

            </section>

            {/* ACTIONS */}

            <div className="grid gap-3 sm:grid-cols-3">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/patient/consultations"
                  )
                }
                className="rounded-full bg-blue-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                My Consultations
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/patient/appointments/book"
                  )
                }
                className="rounded-full bg-green-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-green-700"
              >
                Book Appointment
              </button>

              <button
                type="button"
                onClick={startNewConsultation}
                className="rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Start New
              </button>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}

// ============================================================
// INFO CARD
// ============================================================

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
        {value}
      </p>

    </div>
  );
}
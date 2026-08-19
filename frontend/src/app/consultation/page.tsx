"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  createConsultation,
  type Consultation,
} from "@/lib/api";

export default function ConsultationPage() {
  const router =
    useRouter();

  const [chiefComplaint, setChiefComplaint] =
    useState("");

  const [symptoms, setSymptoms] =
    useState("");

  const [medicalHistory, setMedicalHistory] =
    useState("");

  const [medications, setMedications] =
    useState("");

  const [allergies, setAllergies] =
    useState("");

  const [result, setResult] =
    useState<Consultation | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setResult(null);

    if (
      !chiefComplaint.trim()
    ) {
      setError(
        "Please describe your main complaint."
      );
      return;
    }

    if (
      !symptoms.trim()
    ) {
      setError(
        "Please describe your symptoms."
      );
      return;
    }

    setLoading(true);

    try {
      const consultation =
        await createConsultation({
          chief_complaint:
            chiefComplaint.trim(),

          symptoms:
            symptoms.trim(),

          medical_history:
            medicalHistory.trim(),

          medications:
            medications.trim(),

          allergies:
            allergies.trim(),
        });

      setResult(
        consultation
      );
    } catch (
      error: unknown
    ) {
      console.error(
        "Consultation error:",
        error
      );

      if (
        error instanceof Error
      ) {
        setError(
          error.message
        );
      } else {
        setError(
          "Unable to create consultation."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function formatList(
    value:
      | string
      | string[]
      | null
      | undefined
  ): string[] {
    if (!value) {
      return [];
    }

    if (
      Array.isArray(value)
    ) {
      return value;
    }

    return value
      .split(/\n|,/)
      .map(
        (item) =>
          item.trim()
      )
      .filter(Boolean);
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER */}

      <header className="border-b bg-white">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">

          <div>

            <h1 className="text-xl font-bold text-gray-900">
              AI Hospital Assistant
            </h1>

            <p className="text-sm text-gray-500">
              Start Consultation
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Dashboard
          </button>

        </div>

      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">

        {/* FORM */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <h2 className="text-2xl font-bold text-gray-900">
            Start Consultation
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Tell us about your health concern.
            The AI assistant will prepare a
            summary for the medical team.
          </p>

          {/* ERROR */}

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700 whitespace-pre-line">
                {error}
              </p>
            </div>
          )}

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-6 space-y-6"
          >

            {/* CHIEF COMPLAINT */}

            <div>

              <label
                htmlFor="chiefComplaint"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Main complaint
              </label>

              <textarea
                id="chiefComplaint"
                value={
                  chiefComplaint
                }
                onChange={(event) =>
                  setChiefComplaint(
                    event.target.value
                  )
                }
                placeholder="Example: I have been having chest discomfort since yesterday."
                rows={3}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
              />

            </div>

            {/* SYMPTOMS */}

            <div>

              <label
                htmlFor="symptoms"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Symptoms
              </label>

              <textarea
                id="symptoms"
                value={symptoms}
                onChange={(event) =>
                  setSymptoms(
                    event.target.value
                  )
                }
                placeholder="Describe your symptoms, when they started, and how severe they are."
                rows={4}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
              />

            </div>

            {/* MEDICAL HISTORY */}

            <div>

              <label
                htmlFor="medicalHistory"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Medical history
              </label>

              <textarea
                id="medicalHistory"
                value={
                  medicalHistory
                }
                onChange={(event) =>
                  setMedicalHistory(
                    event.target.value
                  )
                }
                placeholder="Previous illnesses, surgeries, or medical conditions."
                rows={3}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
              />

            </div>

            {/* MEDICATIONS */}

            <div>

              <label
                htmlFor="medications"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Current medications
              </label>

              <textarea
                id="medications"
                value={
                  medications
                }
                onChange={(event) =>
                  setMedications(
                    event.target.value
                  )
                }
                placeholder="List medicines you currently take, if any."
                rows={3}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
              />

            </div>

            {/* ALLERGIES */}

            <div>

              <label
                htmlFor="allergies"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Allergies
              </label>

              <textarea
                id="allergies"
                value={
                  allergies
                }
                onChange={(event) =>
                  setAllergies(
                    event.target.value
                  )
                }
                placeholder="Mention medicine, food, or other allergies. Write 'None' if not applicable."
                rows={3}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
              />

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {loading
                ? "Creating consultation..."
                : "Start Consultation"}
            </button>

          </form>

        </div>

        {/* RESULT */}

        {result && (
          <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-bold text-gray-900">
                  Consultation Created
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Consultation ID:{" "}
                  {result.id}
                </p>

              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                {result.status ||
                  "Submitted"}
              </span>

            </div>

            {/* AI SUMMARY */}

            {result.ai_summary && (
              <section className="mt-6">

                <h3 className="text-lg font-semibold text-gray-900">
                  AI Summary
                </h3>

                <div className="mt-2 rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700 whitespace-pre-line">
                  {result.ai_summary}
                </div>

              </section>
            )}

            {/* DEPARTMENT */}

            {result.department && (
              <section className="mt-6">

                <h3 className="text-sm font-semibold text-gray-500">
                  Recommended Department
                </h3>

                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {result.department}
                </p>

              </section>
            )}

            {/* PRIORITY */}

            {result.priority && (
              <section className="mt-4">

                <h3 className="text-sm font-semibold text-gray-500">
                  Priority
                </h3>

                <p className="mt-1 font-semibold text-gray-900">
                  {result.priority}
                </p>

              </section>
            )}

            {/* CONDITIONS */}

            {formatList(
              result.possible_conditions
            ).length > 0 && (
              <section className="mt-6">

                <h3 className="text-lg font-semibold text-gray-900">
                  Possible Conditions
                </h3>

                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">

                  {formatList(
                    result.possible_conditions
                  ).map(
                    (
                      item,
                      index
                    ) => (
                      <li
                        key={index}
                      >
                        {item}
                      </li>
                    )
                  )}

                </ul>

              </section>
            )}

            {/* TESTS */}

            {formatList(
              result.recommended_tests
            ).length > 0 && (
              <section className="mt-6">

                <h3 className="text-lg font-semibold text-gray-900">
                  Recommended Tests
                </h3>

                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">

                  {formatList(
                    result.recommended_tests
                  ).map(
                    (
                      item,
                      index
                    ) => (
                      <li
                        key={index}
                      >
                        {item}
                      </li>
                    )
                  )}

                </ul>

              </section>
            )}

            {/* RED FLAGS */}

            {formatList(
              result.red_flags
            ).length > 0 && (
              <section className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">

                <h3 className="font-semibold text-red-800">
                  Important Warning Signs
                </h3>

                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">

                  {formatList(
                    result.red_flags
                  ).map(
                    (
                      item,
                      index
                    ) => (
                      <li
                        key={index}
                      >
                        {item}
                      </li>
                    )
                  )}

                </ul>

              </section>
            )}

            <div className="mt-8 flex gap-3">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/consultations"
                  )
                }
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                View My Consultations
              </button>

              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setChiefComplaint("");
                  setSymptoms("");
                  setMedicalHistory("");
                  setMedications("");
                  setAllergies("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                New Consultation
              </button>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}
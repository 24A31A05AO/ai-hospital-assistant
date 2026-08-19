"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type User = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  village: string | null;
  role: string;
  is_active?: boolean;
};

type Consultation = {
  id: number;
  user_id: number;

  patient: User | null;

  doctor_id: number | null;
  doctor: User | null;

  chief_complaint: string;
  symptoms: string;
  medical_history: string;
  medications: string;
  allergies: string;

  ai_summary: string | null;

  possible_conditions: string[];
  recommended_tests: string[];
  red_flags: string[];

  department: string;
  priority: string;
  status: string;

  doctor_notes: string | null;

  created_at: string;
};

export default function AdminConsultationPage() {
  const router = useRouter();
  const params = useParams();

  const consultationId = params?.consultation_id;

  const [consultation, setConsultation] =
    useState<Consultation | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("access_token");
  };

  const loadConsultation = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      if (!consultationId) {
        throw new Error("Consultation ID is missing.");
      }

      const id = Array.isArray(consultationId)
        ? consultationId[0]
        : consultationId;

      const response = await fetch(
        `http://127.0.0.1:8000/admin/consultations/${id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        router.push("/login");
        return;
      }

      if (response.status === 403) {
        throw new Error(
          "Admin access required. Please login with an admin account."
        );
      }

      if (response.status === 404) {
        throw new Error(
          `Consultation #${id} was not found on the server.`
        );
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.detail ||
            `Failed to load consultation (${response.status})`
        );
      }

      const data: Consultation = await response.json();

      setConsultation(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load consultation."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (consultationId) {
      loadConsultation();
    }
  }, [consultationId]);

  const formatDate = (date: string) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString();
  };

  const priorityClass = (priority: string) => {
    const value = (priority || "").toLowerCase();

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

  const statusClass = (status: string) => {
    const value = (status || "").toLowerCase();

    if (value === "reviewed") {
      return "bg-green-100 text-green-700";
    }

    if (value === "in_progress") {
      return "bg-blue-100 text-blue-700";
    }

    if (value === "pending") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg font-medium text-gray-600">
          Loading consultation...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.push("/admin")}
            className="mb-6 px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50"
          >
            ← Back to Admin Dashboard
          </button>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h1 className="text-xl font-semibold text-red-700">
              Unable to Load Consultation
            </h1>

            <p className="mt-2 text-red-600">
              {error}
            </p>

            <button
              onClick={loadConsultation}
              className="mt-5 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!consultation) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">
          Consultation not found.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Consultation Details
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Consultation #{consultation.id}
            </p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50"
          >
            ← Back
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <section className="bg-white border rounded-xl p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${priorityClass(
                consultation.priority
              )}`}
            >
              {consultation.priority || "Normal"}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass(
                consultation.status
              )}`}
            >
              {consultation.status || "Pending"}
            </span>

            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
              {consultation.department || "Department not specified"}
            </span>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Created: {formatDate(consultation.created_at)}
          </p>
        </section>

        <section className="bg-white border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Patient Information
          </h2>

          {consultation.patient ? (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info
                label="Name"
                value={consultation.patient.full_name}
              />

              <Info
                label="Email"
                value={consultation.patient.email}
              />

              <Info
                label="Phone"
                value={consultation.patient.phone}
              />

              <Info
                label="Village"
                value={
                  consultation.patient.village || "Not provided"
                }
              />

              <Info
                label="Patient ID"
                value={String(consultation.patient.id)}
              />
            </div>
          ) : (
            <p className="mt-4 text-gray-500">
              Patient information unavailable.
            </p>
          )}
        </section>

        <section className="bg-white border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Assigned Doctor
          </h2>

          {consultation.doctor ? (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info
                label="Name"
                value={consultation.doctor.full_name}
              />

              <Info
                label="Email"
                value={consultation.doctor.email}
              />

              <Info
                label="Phone"
                value={consultation.doctor.phone}
              />

              <Info
                label="Doctor ID"
                value={String(consultation.doctor.id)}
              />
            </div>
          ) : (
            <div className="mt-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <p className="text-yellow-800 font-medium">
                No doctor assigned.
              </p>

              <p className="text-sm text-yellow-700 mt-1">
                Use the Admin Dashboard to assign a doctor.
              </p>
            </div>
          )}
        </section>

        <section className="bg-white border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Patient Complaint
          </h2>

          <div className="mt-5 space-y-5">
            <Info
              label="Chief Complaint"
              value={consultation.chief_complaint}
            />

            <Info
              label="Symptoms"
              value={consultation.symptoms}
            />

            <Info
              label="Medical History"
              value={
                consultation.medical_history || "None provided"
              }
            />

            <Info
              label="Medications"
              value={
                consultation.medications || "None provided"
              }
            />

            <Info
              label="Allergies"
              value={
                consultation.allergies || "None provided"
              }
            />
          </div>
        </section>

        <section className="bg-white border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            AI Summary
          </h2>

          <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-gray-800 leading-7 whitespace-pre-wrap">
              {consultation.ai_summary ||
                "No AI summary available."}
            </p>
          </div>
        </section>

        <ListSection
          title="Possible Conditions"
          items={consultation.possible_conditions}
        />

        <ListSection
          title="Recommended Tests"
          items={consultation.recommended_tests}
        />

        <section className="bg-white border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-red-700">
            Red Flags
          </h2>

          {consultation.red_flags &&
          consultation.red_flags.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {consultation.red_flags.map((item, index) => (
                <li
                  key={index}
                  className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-800"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-gray-500">
              No red flags recorded.
            </p>
          )}
        </section>

        <section className="bg-white border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Doctor Notes
          </h2>

          <div className="mt-4 p-4 rounded-lg bg-gray-50 border">
            <p className="text-gray-700 whitespace-pre-wrap">
              {consultation.doctor_notes ||
                "No doctor notes available."}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-gray-900 whitespace-pre-wrap">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function ListSection({
  title,
  items,
}: {
  title: string;
  items: string[] | null | undefined;
}) {
  return (
    <section className="bg-white border rounded-xl p-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {title}
      </h2>

      {items && items.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li
              key={index}
              className="p-3 rounded-lg bg-gray-50 border text-gray-700"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-gray-500">
          No information available.
        </p>
      )}
    </section>
  );
}
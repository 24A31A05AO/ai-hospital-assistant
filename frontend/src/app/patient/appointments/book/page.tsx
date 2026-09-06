"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createAppointment,
  getHospitals,
  getPatientConsultations,
  type Hospital,
  type Consultation,
} from "@/lib/api";

const DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "ENT",
  "Gastroenterology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Urology",
];

export default function BookAppointmentPage() {
  const router = useRouter();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [consultations, setConsultations] = useState<
    Consultation[]
  >([]);

  const [hospitalId, setHospitalId] = useState("");
  const [consultationId, setConsultationId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [department, setDepartment] = useState("");

  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

  const [priority, setPriority] = useState("Normal");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("access_token");
      const role = localStorage.getItem("user_role");

      if (!token || role !== "patient") {
        router.replace("/login");
        return;
      }

      try {
        const [hospitalData, consultationData] =
          await Promise.all([
            getHospitals(),
            getPatientConsultations(),
          ]);

        setHospitals(hospitalData);
        setConsultations(consultationData);
      } catch (err) {
        console.error(
          "Failed to load appointment data:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load appointment information."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  // ==========================================================
  // CONSULTATION CHANGE
  // ==========================================================

  function handleConsultationChange(value: string) {
    setConsultationId(value);
    setDoctorId("");

    if (!value) {
      return;
    }

    const selectedConsultation =
      consultations.find(
        (consultation) =>
          String(consultation.id) === value
      );

    if (!selectedConsultation) {
      return;
    }

    // Automatically get doctor from consultation
    if (
      selectedConsultation.doctor_id !== null &&
      selectedConsultation.doctor_id !== undefined
    ) {
      setDoctorId(
        String(selectedConsultation.doctor_id)
      );
    }

    // Automatically select consultation department
    if (selectedConsultation.department) {
      const consultationDepartment =
        selectedConsultation.department.trim();

      const matchingDepartment =
        DEPARTMENTS.find(
          (item) =>
            item.toLowerCase() ===
            consultationDepartment.toLowerCase()
        );

      if (matchingDepartment) {
        setDepartment(matchingDepartment);
      }
    }
  }

  // ==========================================================
  // SUBMIT
  // ==========================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!hospitalId) {
      setError("Please select a hospital.");
      return;
    }

    if (!consultationId) {
      setError("Please select a consultation.");
      return;
    }

    if (!doctorId) {
      setError(
        "The selected consultation does not have an assigned doctor."
      );
      return;
    }

    if (!department) {
      setError("Please select a department.");
      return;
    }

    if (!appointmentDate) {
      setError(
        "Please select an appointment date."
      );
      return;
    }

    if (!appointmentTime) {
      setError(
        "Please select an appointment time."
      );
      return;
    }

    setSubmitting(true);

    // --------------------------------------------------------
    // CREATE APPOINTMENT
    // --------------------------------------------------------

    try {
      await createAppointment({
        hospital_id: Number(hospitalId),

        doctor_id: Number(doctorId),

        consultation_id: Number(consultationId),

        department: department,

        appointment_date: appointmentDate,

        appointment_time: appointmentTime,

        priority: priority,

        notes: null,
      });

      setSuccess(
        "Appointment booked successfully."
      );

      setTimeout(() => {
        router.push("/patient/appointments");
      }, 1000);
    } catch (err) {
      console.error(
        "Appointment booking error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to book appointment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "16px",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <p style={{ color: "#475569" }}>
            Loading appointment information...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div style={{ marginBottom: "30px" }}>
          <button
            type="button"
            onClick={() =>
              router.push("/patient/dashboard")
            }
            style={{
              marginBottom: "20px",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "white",
              color: "#0f172a",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            ← Dashboard
          </button>

          <h1
            style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: "8px",
            }}
          >
            Book Appointment
          </h1>

          <p style={{ color: "#64748b" }}>
            Select a hospital, consultation,
            department and preferred appointment time.
          </p>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "16px",
              borderRadius: "10px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
            }}
          >
            {error}
          </div>
        )}

        {/* ====================================================
            SUCCESS
        ==================================================== */}

        {success && (
          <div
            style={{
              marginBottom: "20px",
              padding: "16px",
              borderRadius: "10px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534",
            }}
          >
            {success}
          </div>
        )}

        {/* ====================================================
            FORM
        ==================================================== */}

        <form
          onSubmit={handleSubmit}
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "30px",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          {/* ==================================================
              HOSPITAL
          ================================================== */}

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
                color: "#0f172a",
              }}
            >
              Hospital
            </label>

            <select
              value={hospitalId}
              onChange={(event) =>
                setHospitalId(event.target.value)
              }
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border:
                  "1px solid #cbd5e1",
                background: "white",
                color: "#0f172a",
              }}
            >
              <option value="">
                Select hospital
              </option>

              {hospitals.map((hospital) => (
                <option
                  key={hospital.id}
                  value={hospital.id}
                >
                  {hospital.name}
                </option>
              ))}
            </select>
          </div>

          {/* ==================================================
              CONSULTATION
          ================================================== */}

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
                color: "#0f172a",
              }}
            >
              Consultation
            </label>

            <select
              value={consultationId}
              onChange={(event) =>
                handleConsultationChange(
                  event.target.value
                )
              }
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border:
                  "1px solid #cbd5e1",
                background: "white",
                color: "#0f172a",
              }}
            >
              <option value="">
                Select consultation
              </option>

              {consultations.map(
                (consultation) => (
                  <option
                    key={consultation.id}
                    value={consultation.id}
                  >
                    Consultation #
                    {consultation.id}

                    {consultation.chief_complaint
                      ? ` - ${consultation.chief_complaint}`
                      : ""}
                  </option>
                )
              )}
            </select>

            <p
              style={{
                marginTop: "6px",
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              Your assigned doctor will be selected
              automatically.
            </p>
          </div>

          {/* ==================================================
              DEPARTMENT
          ================================================== */}

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
                color: "#0f172a",
              }}
            >
              Department
            </label>

            <select
              value={department}
              onChange={(event) =>
                setDepartment(
                  event.target.value
                )
              }
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border:
                  "1px solid #cbd5e1",
                background: "white",
                color: "#0f172a",
              }}
            >
              <option value="">
                Select department
              </option>

              {DEPARTMENTS.map(
                (departmentName) => (
                  <option
                    key={departmentName}
                    value={departmentName}
                  >
                    {departmentName}
                  </option>
                )
              )}
            </select>
          </div>

          {/* ==================================================
              DATE
          ================================================== */}

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
                color: "#0f172a",
              }}
            >
              Appointment Date
            </label>

            <input
              type="date"
              value={appointmentDate}
              min={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              onChange={(event) =>
                setAppointmentDate(
                  event.target.value
                )
              }
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border:
                  "1px solid #cbd5e1",
                background: "white",
                color: "#0f172a",
              }}
            />
          </div>

          {/* ==================================================
              TIME
          ================================================== */}

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
                color: "#0f172a",
              }}
            >
              Appointment Time
            </label>

            <input
              type="time"
              value={appointmentTime}
              onChange={(event) =>
                setAppointmentTime(
                  event.target.value
                )
              }
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border:
                  "1px solid #cbd5e1",
                background: "white",
                color: "#0f172a",
              }}
            />
          </div>

          {/* ==================================================
              PRIORITY
          ================================================== */}

          <div style={{ marginBottom: "30px" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
                color: "#0f172a",
              }}
            >
              Priority
            </label>

            <select
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target.value
                )
              }
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border:
                  "1px solid #cbd5e1",
                background: "white",
                color: "#0f172a",
              }}
            >
              <option value="Normal">
                Normal
              </option>

              <option value="Urgent">
                Urgent
              </option>
            </select>
          </div>

          {/* ==================================================
              SUBMIT
          ================================================== */}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              border: "none",
              background: submitting
                ? "#94a3b8"
                : "#0f172a",
              color: "white",
              fontSize: "16px",
              fontWeight: 600,
              cursor: submitting
                ? "not-allowed"
                : "pointer",
            }}
          >
            {submitting
              ? "Booking..."
              : "Book Appointment"}
          </button>
        </form>
      </div>
    </main>
  );
}
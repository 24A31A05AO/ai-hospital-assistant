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

export default function BookAppointmentPage() {
  const router = useRouter();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [consultations, setConsultations] = useState<
    Consultation[]
  >([]);

  const [hospitalId, setHospitalId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [consultationId, setConsultationId] =
    useState("");

  const [department, setDepartment] =
    useState("");

  const [appointmentDate, setAppointmentDate] =
    useState("");

  const [appointmentTime, setAppointmentTime] =
    useState("");

  const [priority, setPriority] =
    useState("Normal");

  const [notes, setNotes] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    async function loadData() {
      const token =
        localStorage.getItem("access_token");

      const role =
        localStorage.getItem("user_role");

      if (!token || role !== "patient") {
        router.replace("/login");
        return;
      }

      try {
        const [
          hospitalData,
          consultationData,
        ] = await Promise.all([
          getHospitals(),
          getPatientConsultations(),
        ]);

        setHospitals(hospitalData);
        setConsultations(
          consultationData
        );
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load appointment data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  // ==========================================================
  // WHEN CONSULTATION CHANGES
  // ==========================================================

  function handleConsultationChange(
    value: string
  ) {
    setConsultationId(value);

    const selected =
      consultations.find(
        (item) =>
          String(item.id) === value
      );

    if (!selected) {
      return;
    }

    if (selected.doctor_id) {
      setDoctorId(
        String(selected.doctor_id)
      );
    }

    if (selected.department) {
      setDepartment(
        selected.department
      );
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

    if (!hospitalId) {
      setError(
        "Please select a hospital."
      );
      return;
    }

    if (!doctorId) {
      setError(
        "Please select a doctor."
      );
      return;
    }

    if (!department.trim()) {
      setError(
        "Please enter the department."
      );
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

    try {
      await createAppointment({
        hospital_id:
          Number(hospitalId),

        doctor_id:
          Number(doctorId),

        consultation_id:
          consultationId
            ? Number(consultationId)
            : null,

        department:
          department.trim(),

        appointment_date:
          appointmentDate,

        appointment_time:
          appointmentTime,

        priority,

        notes:
          notes.trim() || null,
      });

      setSuccess(
        "Appointment booked successfully."
      );

      setTimeout(() => {
        router.push(
          "/patient/appointments"
        );
      }, 1000);
    } catch (err) {
      console.error(err);

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
          padding: "40px",
        }}
      >
        <h1>Book Appointment</h1>

        <p>
          Loading appointment information...
        </p>
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
        {/* HEADER */}

        <div
          style={{
            marginBottom: "30px",
          }}
        >
          <button
            type="button"
            onClick={() =>
              router.push(
                "/patient/dashboard"
              )
            }
            style={{
              marginBottom: "20px",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "white",
              cursor: "pointer",
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

          <p
            style={{
              color: "#64748b",
            }}
          >
            Schedule an appointment with
            your doctor.
          </p>
        </div>

        {/* ERROR */}

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

        {/* SUCCESS */}

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

        {/* FORM */}

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
          {/* HOSPITAL */}

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Hospital
            </label>

            <select
              value={hospitalId}
              onChange={(event) =>
                setHospitalId(
                  event.target.value
                )
              }
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border:
                  "1px solid #cbd5e1",
              }}
            >
              <option value="">
                Select hospital
              </option>

              {hospitals.map(
                (hospital) => (
                  <option
                    key={hospital.id}
                    value={hospital.id}
                  >
                    {hospital.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* CONSULTATION */}

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
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
          </div>

          {/* DOCTOR ID */}

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Doctor ID
            </label>

            <input
              type="number"
              value={doctorId}
              onChange={(event) =>
                setDoctorId(
                  event.target.value
                )
              }
              placeholder="Enter doctor ID"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border:
                  "1px solid #cbd5e1",
              }}
            />

            <p
              style={{
                marginTop: "6px",
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              Selecting a consultation
              automatically fills its
              assigned doctor.
            </p>
          </div>

          {/* DEPARTMENT */}

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Department
            </label>

            <input
              type="text"
              value={department}
              onChange={(event) =>
                setDepartment(
                  event.target.value
                )
              }
              placeholder="Example: General Medicine"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border:
                  "1px solid #cbd5e1",
              }}
            />
          </div>

          {/* DATE */}

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
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
              }}
            />
          </div>

          {/* TIME */}

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
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
              }}
            />
          </div>

          {/* PRIORITY */}

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
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

          {/* NOTES */}

          <div
            style={{
              marginBottom: "25px",
            }}
          >
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              placeholder="Additional information for the doctor..."
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border:
                  "1px solid #cbd5e1",
                resize: "vertical",
              }}
            />
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              border: "none",
              background:
                submitting
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
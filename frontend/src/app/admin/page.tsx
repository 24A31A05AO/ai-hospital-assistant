"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { API_BASE_URL } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

type User = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  village: string | null;
  role: string;
  is_active: boolean;
  created_at?: string;
};

type Consultation = {
  id: number;
  user_id: number;

  patient: User | null;

  doctor_id: number | null;
  doctor: User | null;

  chief_complaint: string;
  symptoms: string;

  department: string;

  priority: string;
  status: string;

  doctor_notes: string | null;

  created_at: string;
};

type Stats = {
  total_users: number;
  total_patients: number;
  total_doctors: number;
  total_admins: number;

  total_consultations: number;

  pending_consultations: number;
  reviewed_consultations: number;
  emergency_consultations: number;

  assigned_consultations: number;
  unassigned_consultations: number;

  today_consultations: number;
  today_pending: number;
  today_in_progress: number;
  today_completed: number;
};

type Hospital = {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  qr_code_id: string;
  is_active: boolean;
  created_at: string;
};

type HospitalForm = {
  name: string;
  address: string;
  phone: string;
  email: string;
  qr_code_id: string;
};

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

export default function AdminDashboard() {
  const router = useRouter();

  /* =======================================================
     STATE
  ======================================================= */

  const [stats, setStats] = useState<Stats | null>(null);

  const [users, setUsers] = useState<User[]>([]);

  const [doctors, setDoctors] = useState<User[]>([]);

  const [consultations, setConsultations] =
    useState<Consultation[]>([]);

  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedDoctor, setSelectedDoctor] =
    useState<Record<number, number>>({});

  const [assigning, setAssigning] =
    useState<number | null>(null);

  /* =======================================================
     HOSPITAL STATE
  ======================================================= */

  const [showHospitalForm, setShowHospitalForm] =
    useState(false);

  const [hospitalForm, setHospitalForm] =
    useState<HospitalForm>({
      name: "",
      address: "",
      phone: "",
      email: "",
      qr_code_id: "",
    });

  const [addingHospital, setAddingHospital] =
    useState(false);

  const [hospitalError, setHospitalError] =
    useState("");

  const [hospitalLoading, setHospitalLoading] =
    useState(true);

  /* =======================================================
     GET TOKEN
  ======================================================= */

  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("access_token");
  };

  /* =======================================================
     API HELPER
  ======================================================= */

  const api = async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    const token = getToken();

    if (!token) {
      router.push("/login");

      throw new Error("Authentication required");
    }

    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,

        headers: {
          "Content-Type": "application/json",

          Accept: "application/json",

          Authorization: `Bearer ${token}`,

          ...(options.headers || {}),
        },
      }
    );

    /* =====================================================
       UNAUTHORIZED
    ===================================================== */

    if (response.status === 401) {
      localStorage.removeItem("access_token");

      router.push("/login");

      throw new Error("Session expired");
    }

    /* =====================================================
       FORBIDDEN
    ===================================================== */

    if (response.status === 403) {
      const data = await response
        .json()
        .catch(() => null);

      throw new Error(
        data?.detail ||
          "Admin access required"
      );
    }

    /* =====================================================
       OTHER ERRORS
    ===================================================== */

    if (!response.ok) {
      const data = await response
        .json()
        .catch(() => null);

      throw new Error(
        data?.detail ||
          `Request failed: ${response.status}`
      );
    }

    /*
     * Some DELETE endpoints may return 204 No Content.
     */
    if (response.status === 204) {
      return null;
    }

    return response.json();
  };

  /* =======================================================
     LOAD HOSPITALS
  ======================================================= */

  const loadHospitals = async () => {
    try {
      setHospitalLoading(true);

      const data = await api("/hospitals/");

      setHospitals(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load hospitals:",
        err
      );

      setHospitalError(
        err instanceof Error
          ? err.message
          : "Unable to load hospitals"
      );
    } finally {
      setHospitalLoading(false);
    }
  };

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        statsData,
        usersData,
        doctorsData,
        consultationsData,
      ] = await Promise.all([
        api("/admin/stats"),
        api("/admin/users"),
        api("/admin/doctors"),
        api("/admin/consultations"),
      ]);

      setStats(statsData);

      setUsers(
        Array.isArray(usersData)
          ? usersData
          : []
      );

      setDoctors(
        Array.isArray(doctorsData)
          ? doctorsData
          : []
      );

      setConsultations(
        Array.isArray(
          consultationsData
        )
          ? consultationsData
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load admin dashboard:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load admin dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadDashboard();
    loadHospitals();
  }, []);

  /* =======================================================
     OPEN HOSPITAL FORM
  ======================================================= */

  const openHospitalForm = () => {
    setHospitalError("");

    setHospitalForm({
      name: "",
      address: "",
      phone: "",
      email: "",
      qr_code_id: "",
    });

    setShowHospitalForm(true);
  };

  /* =======================================================
     CLOSE HOSPITAL FORM
  ======================================================= */

  const closeHospitalForm = () => {
    if (addingHospital) {
      return;
    }

    setShowHospitalForm(false);

    setHospitalError("");

    setHospitalForm({
      name: "",
      address: "",
      phone: "",
      email: "",
      qr_code_id: "",
    });
  };

  /* =======================================================
     HOSPITAL INPUT
  ======================================================= */

  const updateHospitalField = (
    field: keyof HospitalForm,
    value: string
  ) => {
    setHospitalForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /* =======================================================
     ADD HOSPITAL
  ======================================================= */

  const addHospital = async () => {
    setHospitalError("");

    const name =
      hospitalForm.name.trim();

    const qrCodeId =
      hospitalForm.qr_code_id.trim();

    if (!name) {
      setHospitalError(
        "Hospital name is required."
      );

      return;
    }

    if (!qrCodeId) {
      setHospitalError(
        "QR Code ID is required."
      );

      return;
    }

    try {
      setAddingHospital(true);

      await api("/hospitals/", {
        method: "POST",

        body: JSON.stringify({
          name,

          address:
            hospitalForm.address.trim() ||
            null,

          phone:
            hospitalForm.phone.trim() ||
            null,

          email:
            hospitalForm.email.trim() ||
            null,

          qr_code_id: qrCodeId,
        }),
      });

      await loadHospitals();

      setShowHospitalForm(false);

      setHospitalForm({
        name: "",
        address: "",
        phone: "",
        email: "",
        qr_code_id: "",
      });
    } catch (err) {
      console.error(
        "Failed to add hospital:",
        err
      );

      setHospitalError(
        err instanceof Error
          ? err.message
          : "Unable to add hospital"
      );
    } finally {
      setAddingHospital(false);
    }
  };

  /* =======================================================
     ASSIGN DOCTOR
  ======================================================= */

  const assignDoctor = async (
    consultationId: number
  ) => {
    const doctorId =
      selectedDoctor[consultationId];

    if (!doctorId) {
      alert("Please select a doctor.");

      return;
    }

    try {
      setAssigning(consultationId);

      await api(
        `/admin/consultations/${consultationId}/assign`,
        {
          method: "PATCH",

          body: JSON.stringify({
            doctor_id: doctorId,
          }),
        }
      );

      await loadDashboard();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to assign doctor"
      );
    } finally {
      setAssigning(null);
    }
  };

  /* =======================================================
     UNASSIGN DOCTOR
  ======================================================= */

  const unassignDoctor = async (
    consultationId: number
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to unassign this doctor?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setAssigning(consultationId);

      await api(
        `/admin/consultations/${consultationId}/unassign`,
        {
          method: "PATCH",
        }
      );

      await loadDashboard();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to unassign doctor"
      );
    } finally {
      setAssigning(null);
    }
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = () => {
    localStorage.removeItem("access_token");

    router.push("/login");
  };

  /* =======================================================
     PRIORITY CLASS
  ======================================================= */

  const priorityClass = (
    priority: string
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

  /* =======================================================
     STATUS CLASS
  ======================================================= */

  const statusClass = (
    status: string
  ) => {
    const value =
      status?.toLowerCase();

    if (value === "completed") {
      return "bg-green-100 text-green-700";
    }

    if (value === "reviewed") {
      return "bg-purple-100 text-purple-700";
    }

    if (
      value === "in_progress" ||
      value === "in progress"
    ) {
      return "bg-blue-100 text-blue-700";
    }

    if (value === "pending") {
      return "bg-gray-100 text-gray-700";
    }

    if (value === "referred") {
      return "bg-orange-100 text-orange-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDate = (
    date: string
  ) => {
    try {
      return new Date(
        date
      ).toLocaleString();
    } catch {
      return date;
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-lg font-medium text-gray-600">
          Loading admin dashboard...
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">

          <div className="rounded-xl border border-red-200 bg-red-50 p-6">

            <h1 className="text-xl font-semibold text-red-700">
              Unable to load dashboard
            </h1>

            <p className="mt-2 text-red-600">
              {error}
            </p>

            <button
              onClick={() => {
                loadDashboard();
                loadHospitals();
              }}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Try Again
            </button>

          </div>

        </div>
      </main>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="border-b bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>

            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Hospital AI Platform
            </p>

          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() => {
                loadDashboard();
                loadHospitals();
              }}
              className="rounded-lg border bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>

            <button
              onClick={openHospitalForm}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              + Add Hospital
            </button>

            <button
              onClick={logout}
              className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
            >
              Logout
            </button>

          </div>

        </div>

      </header>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* =================================================
            OVERVIEW
        ================================================= */}

        <section>

          <div className="mb-4">

            <h2 className="text-xl font-semibold text-gray-900">
              Overview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Platform and consultation statistics.
            </p>

          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">

            <StatCard
              title="Total Users"
              value={
                stats?.total_users ?? 0
              }
            />

            <StatCard
              title="Patients"
              value={
                stats?.total_patients ?? 0
              }
            />

            <StatCard
              title="Doctors"
              value={
                stats?.total_doctors ?? 0
              }
            />

            <StatCard
              title="Admins"
              value={
                stats?.total_admins ?? 0
              }
            />

            <StatCard
              title="Total Consultations"
              value={
                stats?.total_consultations ?? 0
              }
            />

          </div>

        </section>

        {/* =================================================
            TODAY'S CONSULTATIONS
        ================================================= */}

        <section className="mt-8">

          <div className="mb-4">

            <h2 className="text-xl font-semibold text-gray-900">
              Today's Consultations
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current consultation status for today.
            </p>

          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

            <StatCard
              title="Today"
              value={
                stats?.today_consultations ?? 0
              }
            />

            <StatCard
              title="Pending"
              value={
                stats?.today_pending ?? 0
              }
            />

            <StatCard
              title="In Progress"
              value={
                stats?.today_in_progress ?? 0
              }
            />

            <StatCard
              title="Completed"
              value={
                stats?.today_completed ?? 0
              }
            />

          </div>

        </section>

        {/* =================================================
            OTHER STATISTICS
        ================================================= */}

        <section className="mt-8">

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">

            <StatCard
              title="All Pending"
              value={
                stats?.pending_consultations ?? 0
              }
            />

            <StatCard
              title="Reviewed"
              value={
                stats?.reviewed_consultations ?? 0
              }
            />

            <StatCard
              title="Emergency"
              value={
                stats?.emergency_consultations ?? 0
              }
            />

            <StatCard
              title="Assigned"
              value={
                stats?.assigned_consultations ?? 0
              }
            />

            <StatCard
              title="Unassigned"
              value={
                stats?.unassigned_consultations ?? 0
              }
            />

          </div>

        </section>

        {/* =================================================
            HOSPITAL MANAGEMENT
        ================================================= */}

        <section className="mt-10">

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-xl font-semibold text-gray-900">
                Hospital Management
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage hospitals connected to the AI Hospital Platform.
              </p>

            </div>

            <button
              onClick={openHospitalForm}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              + Add Hospital
            </button>

          </div>

          {hospitalError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {hospitalError}
            </div>
          )}

          {hospitalLoading ? (

            <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
              Loading hospitals...
            </div>

          ) : hospitals.length === 0 ? (

            <div className="rounded-xl border bg-white p-8 text-center">

              <div className="text-4xl">
                🏥
              </div>

              <h3 className="mt-3 font-semibold text-gray-900">
                No hospitals added
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Add your first hospital to the platform.
              </p>

              <button
                onClick={openHospitalForm}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                + Add Hospital
              </button>

            </div>

          ) : (

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {hospitals.map(
                (hospital) => (

                  <div
                    key={hospital.id}
                    className="rounded-xl border bg-white p-5 shadow-sm"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl">
                          🏥
                        </div>

                        <div>

                          <h3 className="font-semibold text-gray-900">
                            {hospital.name}
                          </h3>

                          <p className="text-xs text-gray-500">
                            Hospital #{hospital.id}
                          </p>

                        </div>

                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          hospital.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {hospital.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </div>

                    <div className="mt-5 space-y-2 text-sm text-gray-600">

                      <p>
                        <strong className="text-gray-800">
                          Address:
                        </strong>{" "}
                        {hospital.address ||
                          "Not provided"}
                      </p>

                      <p>
                        <strong className="text-gray-800">
                          Phone:
                        </strong>{" "}
                        {hospital.phone ||
                          "Not provided"}
                      </p>

                      <p className="break-all">
                        <strong className="text-gray-800">
                          Email:
                        </strong>{" "}
                        {hospital.email ||
                          "Not provided"}
                      </p>

                    </div>

                    <div className="mt-5 rounded-lg bg-gray-50 p-3">

                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        QR Code ID
                      </p>

                      <p className="mt-1 break-all font-mono text-sm text-gray-900">
                        {hospital.qr_code_id}
                      </p>

                    </div>

                    <p className="mt-4 text-xs text-gray-400">
                      Added:{" "}
                      {formatDate(
                        hospital.created_at
                      )}
                    </p>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* =================================================
            CONSULTATION MANAGEMENT
        ================================================= */}

        <section className="mt-10">

          <div className="mb-4">

            <h2 className="text-xl font-semibold text-gray-900">
              Consultation Management
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Assign patient consultations to doctors.
            </p>

          </div>

          {consultations.length === 0 ? (

            <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
              No consultations found.
            </div>

          ) : (

            <div className="space-y-4">

              {consultations.map(
                (consultation) => (

                  <div
                    key={
                      consultation.id
                    }
                    className="rounded-xl border bg-white p-6"
                  >

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                      {/* PATIENT */}

                      <div className="flex-1">

                        <div className="flex flex-wrap items-center gap-3">

                          <h3 className="text-lg font-semibold text-gray-900">
                            {consultation.patient
                              ?.full_name ||
                              "Unknown Patient"}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityClass(
                              consultation.priority
                            )}`}
                          >
                            {consultation.priority ||
                              "Normal"}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                              consultation.status
                            )}`}
                          >
                            {consultation.status ||
                              "Pending"}
                          </span>

                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">

                          <p>
                            <strong>
                              Complaint:
                            </strong>{" "}
                            {
                              consultation.chief_complaint
                            }
                          </p>

                          <p>
                            <strong>
                              Department:
                            </strong>{" "}
                            {consultation.department ||
                              "Not specified"}
                          </p>

                          <p>
                            <strong>
                              Village:
                            </strong>{" "}
                            {consultation.patient
                              ?.village ||
                              "Not provided"}
                          </p>

                          <p>
                            <strong>
                              Phone:
                            </strong>{" "}
                            {consultation.patient
                              ?.phone ||
                              "Not provided"}
                          </p>

                          <p>
                            <strong>
                              Created:
                            </strong>{" "}
                            {formatDate(
                              consultation.created_at
                            )}
                          </p>

                        </div>

                        {consultation.doctor && (
                          <div className="mt-4 rounded-lg bg-blue-50 p-3">

                            <p className="text-sm text-blue-800">

                              <strong>
                                Assigned Doctor:
                              </strong>{" "}

                              {
                                consultation
                                  .doctor
                                  .full_name
                              }

                            </p>

                            <p className="mt-1 text-xs text-blue-600">
                              {
                                consultation
                                  .doctor
                                  .email
                              }
                            </p>

                          </div>
                        )}

                      </div>

                      {/* ACTIONS */}

                      <div className="w-full lg:w-72">

                        {!consultation.doctor_id ? (

                          <>

                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              Assign Doctor
                            </label>

                            <select
                              value={
                                selectedDoctor[
                                  consultation.id
                                ] ?? ""
                              }
                              onChange={(event) => {

                                const value =
                                  event.target
                                    .value;

                                setSelectedDoctor(
                                  (previous) => ({
                                    ...previous,

                                    [consultation.id]:
                                      value
                                        ? Number(
                                            value
                                          )
                                        : 0,
                                  })
                                );

                              }}
                              className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                            >

                              <option value="">
                                Select doctor
                              </option>

                              {doctors.map(
                                (doctor) => (

                                  <option
                                    key={
                                      doctor.id
                                    }
                                    value={
                                      doctor.id
                                    }
                                  >
                                    {
                                      doctor.full_name
                                    }
                                  </option>

                                )
                              )}

                            </select>

                            <button
                              onClick={() =>
                                assignDoctor(
                                  consultation.id
                                )
                              }
                              disabled={
                                assigning ===
                                consultation.id
                              }
                              className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              {assigning ===
                              consultation.id
                                ? "Assigning..."
                                : "Assign Doctor"}
                            </button>

                          </>

                        ) : (

                          <button
                            onClick={() =>
                              unassignDoctor(
                                consultation.id
                              )
                            }
                            disabled={
                              assigning ===
                              consultation.id
                            }
                            className="w-full rounded-lg border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {assigning ===
                            consultation.id
                              ? "Updating..."
                              : "Unassign Doctor"}
                          </button>

                        )}

                        <button
                          onClick={() =>
                            router.push(
                              `/admin/consultations/${consultation.id}`
                            )
                          }
                          className="mt-3 w-full rounded-lg border bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          View Consultation
                        </button>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* =================================================
            USER MANAGEMENT
        ================================================= */}

        <section className="mt-10">

          <div className="mb-4">

            <h2 className="text-xl font-semibold text-gray-900">
              User Management
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage users, roles and account status.
            </p>

          </div>

          <div className="overflow-hidden rounded-xl border bg-white">

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="border-b bg-gray-50">

                  <tr>

                    <th className="px-5 py-3 text-left font-medium text-gray-600">
                      User
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-gray-600">
                      Email
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-gray-600">
                      Role
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-gray-600">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-gray-600">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {users.length === 0 ? (

                    <tr>

                      <td
                        colSpan={5}
                        className="px-5 py-8 text-center text-gray-500"
                      >
                        No users found.
                      </td>

                    </tr>

                  ) : (

                    users.map(
                      (user) => (

                        <UserRow
                          key={user.id}
                          user={user}
                          onUpdated={
                            loadDashboard
                          }
                          onDeleted={(userId) => {
                            setUsers(
                              (current) =>
                                current.filter(
                                  (item) =>
                                    item.id !==
                                    userId
                                )
                            );
                          }}
                          onView={() =>
                            router.push(
                              `/admin/users/${user.id}`
                            )
                          }
                        />

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </section>

      </div>

      {/* ===================================================
          ADD HOSPITAL MODAL
      =================================================== */}

      {showHospitalForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex items-start justify-between">

              <div>

                <h2 className="text-2xl font-bold text-gray-900">
                  Add Hospital
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add a hospital to the AI Hospital Platform.
                </p>

              </div>

              <button
                type="button"
                onClick={closeHospitalForm}
                disabled={addingHospital}
                className="rounded-lg px-3 py-1 text-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                ×
              </button>

            </div>

            {hospitalError && (

              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">

                <p className="text-sm font-medium text-red-700">
                  {hospitalError}
                </p>

              </div>

            )}

            <div className="mt-6 space-y-4">

              {/* NAME */}

              <div>

                <label
                  htmlFor="hospital-name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Hospital Name *
                </label>

                <input
                  id="hospital-name"
                  type="text"
                  value={
                    hospitalForm.name
                  }
                  onChange={(event) =>
                    updateHospitalField(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Example: Government General Hospital"
                  disabled={addingHospital}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />

              </div>

              {/* ADDRESS */}

              <div>

                <label
                  htmlFor="hospital-address"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Address
                </label>

                <textarea
                  id="hospital-address"
                  value={
                    hospitalForm.address
                  }
                  onChange={(event) =>
                    updateHospitalField(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="Hospital address"
                  rows={3}
                  disabled={addingHospital}
                  className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />

              </div>

              {/* PHONE */}

              <div>

                <label
                  htmlFor="hospital-phone"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Phone
                </label>

                <input
                  id="hospital-phone"
                  type="tel"
                  value={
                    hospitalForm.phone
                  }
                  onChange={(event) =>
                    updateHospitalField(
                      "phone",
                      event.target.value
                    )
                  }
                  placeholder="Hospital phone number"
                  disabled={addingHospital}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />

              </div>

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="hospital-email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email
                </label>

                <input
                  id="hospital-email"
                  type="email"
                  value={
                    hospitalForm.email
                  }
                  onChange={(event) =>
                    updateHospitalField(
                      "email",
                      event.target.value
                    )
                  }
                  placeholder="hospital@example.com"
                  disabled={addingHospital}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />

              </div>

              {/* QR CODE */}

              <div>

                <label
                  htmlFor="hospital-qr"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  QR Code ID *
                </label>

                <input
                  id="hospital-qr"
                  type="text"
                  value={
                    hospitalForm.qr_code_id
                  }
                  onChange={(event) =>
                    updateHospitalField(
                      "qr_code_id",
                      event.target.value
                    )
                  }
                  placeholder="Example: HOSPITAL-001"
                  disabled={addingHospital}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />

                <p className="mt-1 text-xs text-gray-500">
                  This ID must be unique.
                </p>

              </div>

            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={closeHospitalForm}
                disabled={addingHospital}
                className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={addHospital}
                disabled={addingHospital}
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addingHospital
                  ? "Adding Hospital..."
                  : "Add Hospital"}
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   USER ROW
========================================================= */

function UserRow({
  user,
  onUpdated,
  onDeleted,
  onView,
}: {
  user: User;
  onUpdated: () => Promise<void>;
  onDeleted: (userId: number) => void;
  onView: () => void;
}) {
  const [role, setRole] =
    useState(user.role);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  /* =======================================================
     GET TOKEN
  ======================================================= */

  const getToken = () => {
    if (
      typeof window === "undefined"
    ) {
      return null;
    }

    return localStorage.getItem(
      "access_token"
    );
  };

  /* =======================================================
     UPDATE ROLE
  ======================================================= */

  const updateRole = async (
    newRole: string
  ) => {
    const token = getToken();

    if (!token) {
      alert(
        "Authentication required."
      );

      return;
    }

    try {
      setSaving(true);

      const response =
        await fetch(
          `${API_BASE_URL}/admin/users/${user.id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              role: newRole,
            }),
          }
        );

      if (response.status === 401) {
        localStorage.removeItem(
          "access_token"
        );

        window.location.href =
          "/login";

        return;
      }

      const result =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.detail ||
            `Request failed: ${response.status}`
        );
      }

      await onUpdated();

    } catch (error) {

      alert(
        error instanceof Error
          ? error.message
          : "Unable to update role."
      );

      setRole(user.role);

    } finally {

      setSaving(false);

    }
  };

  /* =======================================================
     CHANGE ROLE
  ======================================================= */

  const changeRole = async (
    newRole: string
  ) => {
    if (newRole === user.role) {
      return;
    }

    const confirmed =
      window.confirm(
        `Change ${user.full_name}'s role to ${newRole}?`
      );

    if (!confirmed) {
      setRole(user.role);

      return;
    }

    await updateRole(newRole);
  };

  /* =======================================================
     DELETE USER PERMANENTLY
  ======================================================= */

  const deleteUserPermanently =
    async () => {
      const confirmed =
        window.confirm(
          `WARNING: This will permanently delete ${user.full_name}'s account and remove the user from the database.\n\nThis action cannot be undone.\n\nAre you sure you want to continue?`
        );

      if (!confirmed) {
        return;
      }

      const doubleConfirmed =
        window.confirm(
          `Final confirmation:\n\nPermanently delete ${user.full_name}?`
        );

      if (!doubleConfirmed) {
        return;
      }

      const token = getToken();

      if (!token) {
        alert(
          "Authentication required."
        );

        return;
      }

      try {
        setDeleting(true);

        const response =
          await fetch(
            `${API_BASE_URL}/admin/users/${user.id}`,
            {
              method: "DELETE",

              headers: {
                Accept:
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        /* ===============================================
           SESSION EXPIRED
        =============================================== */

        if (response.status === 401) {
          localStorage.removeItem(
            "access_token"
          );

          window.location.href =
            "/login";

          return;
        }

        const result =
          await response
            .json()
            .catch(() => null);

        /* ===============================================
           API ERROR
        =============================================== */

        if (!response.ok) {
          throw new Error(
            result?.detail ||
              `Delete failed: ${response.status}`
          );
        }

        /* ===============================================
           REMOVE FROM UI
        =============================================== */

        onDeleted(user.id);

        /*
         * Refresh dashboard statistics as well.
         */
        await onUpdated();

      } catch (error) {

        console.error(
          "Failed to permanently delete user:",
          error
        );

        alert(
          error instanceof Error
            ? error.message
            : "Unable to permanently delete user."
        );

      } finally {

        setDeleting(false);

      }
    };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <tr className="border-b last:border-b-0">

      {/* USER */}

      <td className="px-5 py-4">

        <div>

          <p className="font-medium text-gray-900">
            {user.full_name}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            ID: {user.id}
          </p>

        </div>

      </td>

      {/* EMAIL */}

      <td className="px-5 py-4 text-gray-600">
        {user.email}
      </td>

      {/* ROLE */}

      <td className="px-5 py-4">

        <select
          value={role}
          disabled={
            saving ||
            deleting
          }
          onChange={(event) => {

            const newRole =
              event.target.value;

            setRole(newRole);

            changeRole(
              newRole
            );

          }}
          className="rounded-lg border bg-white px-3 py-2 text-sm disabled:bg-gray-100"
        >

          <option value="patient">
            Patient
          </option>

          <option value="doctor">
            Doctor
          </option>

          <option value="admin">
            Admin
          </option>

        </select>

      </td>

      {/* STATUS */}

      <td className="px-5 py-4">

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            user.is_active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {user.is_active
            ? "Active"
            : "Inactive"}
        </span>

      </td>

      {/* ACTIONS */}

      <td className="px-5 py-4">

        <div className="flex flex-wrap gap-2">

          <button
            onClick={onView}
            disabled={deleting}
            className="rounded-lg border bg-white px-3 py-1.5 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            View
          </button>

          {/* =============================================
              PERMANENT DELETE
          ============================================= */}

          <button
            onClick={
              deleteUserPermanently
            }
            disabled={
              saving ||
              deleting
            }
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting
              ? "Deleting..."
              : "Delete Permanently"}
          </button>

        </div>

      </td>

    </tr>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { API_BASE_URL } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

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

type Doctor = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  village: string | null;
  department: string | null;
  hospital_id: number | null;
  role: string;
  is_active: boolean;
  created_at?: string | null;
};

type DoctorForm = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  department: string;
};

/* =========================================================
   PAGE
========================================================= */

export default function HospitalDoctorsPage() {
  const router = useRouter();
  const params = useParams();

  const hospitalId = Number(
    params.hospital_id
  );

  const [hospital, setHospital] =
    useState<Hospital | null>(null);

  const [doctors, setDoctors] =
    useState<Doctor[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [formError, setFormError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [form, setForm] =
    useState<DoctorForm>({
      full_name: "",
      email: "",
      phone: "",
      password: "",
      department: "",
    });

  /* =======================================================
     TOKEN
  ======================================================= */

  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(
      "access_token"
    );
  };

  /* =======================================================
     API
  ======================================================= */

  const api = async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    const token = getToken();

    if (!token) {
      router.push("/login");

      throw new Error(
        "Authentication required."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers: {
          "Content-Type":
            "application/json",
          Accept:
            "application/json",
          Authorization:
            `Bearer ${token}`,
          ...(options.headers || {}),
        },
      }
    );

    if (response.status === 401) {
      localStorage.removeItem(
        "access_token"
      );

      router.push("/login");

      throw new Error(
        "Session expired."
      );
    }

    const data =
      await response
        .json()
        .catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          `Request failed: ${response.status}`
      );
    }

    return data;
  };

  /* =======================================================
     LOAD HOSPITAL
  ======================================================= */

  const loadHospital = async () => {
    const hospitals =
      await api("/hospitals/");

    const selected =
      Array.isArray(hospitals)
        ? hospitals.find(
            (item: Hospital) =>
              item.id ===
              hospitalId
          )
        : null;

    if (!selected) {
      throw new Error(
        "Hospital not found."
      );
    }

    setHospital(selected);
  };

  /* =======================================================
     LOAD DOCTORS
  ======================================================= */

  const loadDoctors = async () => {
    const data =
      await api(
        `/admin/hospitals/${hospitalId}/doctors`
      );

    setDoctors(
      Array.isArray(data)
        ? data
        : []
    );
  };

  /* =======================================================
     LOAD PAGE
  ======================================================= */

  const loadPage = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadHospital(),
        loadDoctors(),
      ]);

    } catch (err) {
      console.error(
        "Failed to load doctor page:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load doctors."
      );

    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (
      !Number.isFinite(
        hospitalId
      )
    ) {
      setError(
        "Invalid hospital ID."
      );

      setLoading(false);
      return;
    }

    loadPage();
  }, [hospitalId]);

  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = () => {
    setForm({
      full_name: "",
      email: "",
      phone: "",
      password: "",
      department: "",
    });

    setFormError("");
  };

  /* =======================================================
     ADD DOCTOR
  ======================================================= */

  const addDoctor = async () => {
    setFormError("");

    if (
      !form.full_name.trim()
    ) {
      setFormError(
        "Doctor full name is required."
      );
      return;
    }

    if (
      !form.email.trim()
    ) {
      setFormError(
        "Doctor email is required."
      );
      return;
    }

    if (
      !form.phone.trim()
    ) {
      setFormError(
        "Doctor phone number is required."
      );
      return;
    }

    if (
      !form.department.trim()
    ) {
      setFormError(
        "Department is required."
      );
      return;
    }

    if (
      form.password.length < 6
    ) {
      setFormError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setSaving(true);

      await api(
        `/admin/hospitals/${hospitalId}/doctors`,
        {
          method: "POST",
          body: JSON.stringify({
            full_name:
              form.full_name.trim(),

            email:
              form.email.trim(),

            phone:
              form.phone.trim(),

            password:
              form.password,

            department:
              form.department.trim(),

            hospital_id:
              hospitalId,
          }),
        }
      );

      await loadDoctors();

      resetForm();

      setShowForm(false);

    } catch (err) {
      console.error(
        "Failed to add doctor:",
        err
      );

      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to add doctor."
      );

    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     CHANGE DOCTOR STATUS
  ======================================================= */

  const changeDoctorStatus = async (
    doctor: Doctor,
    newStatus: boolean
  ) => {
    if (
      doctor.is_active ===
      newStatus
    ) {
      return;
    }

    const action =
      newStatus
        ? "activate"
        : "deactivate";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} ${doctor.full_name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await api(
        `/admin/doctors/${doctor.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            is_active:
              newStatus,
          }),
        }
      );

      await loadDoctors();

    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to update doctor status."
      );
    }
  };

  /* =======================================================
     DELETE DOCTOR
  ======================================================= */

  const deleteDoctor = async (
    doctor: Doctor
  ) => {
    const confirmed =
      window.confirm(
        `WARNING: Permanently delete ${doctor.full_name}?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    const doubleConfirmed =
      window.confirm(
        `Final confirmation:\n\nPermanently delete ${doctor.full_name}?`
      );

    if (!doubleConfirmed) {
      return;
    }

    try {
      await api(
        `/admin/users/${doctor.id}`,
        {
          method: "DELETE",
        }
      );

      await loadDoctors();

    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to permanently delete doctor."
      );
    }
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = () => {
    localStorage.removeItem(
      "access_token"
    );

    router.push("/login");
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">
          Loading hospital doctors...
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">

        <div className="mx-auto max-w-5xl">

          <div className="rounded-xl border border-red-200 bg-red-50 p-6">

            <h1 className="text-xl font-bold text-red-700">
              Unable to load doctors
            </h1>

            <p className="mt-2 text-red-600">
              {error}
            </p>

            <button
              onClick={loadPage}
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
     MAIN
  ======================================================= */

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER */}

      <header className="border-b bg-white">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div>

            <button
              onClick={() =>
                router.push(
                  "/admin"
                )
              }
              className="mb-2 text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to Admin Dashboard
            </button>

            <h1 className="text-2xl font-bold text-gray-900">
              {hospital?.name}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Doctors Management
            </p>

          </div>

          <div className="flex gap-3">

            <button
              onClick={loadPage}
              className="rounded-lg border bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Refresh
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

      <div className="mx-auto max-w-6xl px-6 py-8">

        {/* HOSPITAL INFO */}

        <section className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                {hospital?.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {hospital?.address ||
                  "Address not provided"}
              </p>

              <p className="mt-2 text-sm text-gray-500">

                QR Code ID:{" "}

                <span className="font-mono text-gray-800">
                  {hospital?.qr_code_id}
                </span>

              </p>

            </div>

            <span
              className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${
                hospital?.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {hospital?.is_active
                ? "Hospital Active"
                : "Hospital Inactive"}
            </span>

          </div>

        </section>

        {/* DOCTORS */}

        <section>

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-xl font-semibold text-gray-900">
                Doctors
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {doctors.length} doctor
                {doctors.length === 1
                  ? ""
                  : "s"}{" "}
                assigned to this hospital.
              </p>

            </div>

            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              disabled={
                !hospital?.is_active
              }
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              + Add Doctor
            </button>

          </div>

          {/* EMPTY */}

          {doctors.length === 0 ? (

            <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">

              <div className="text-5xl">
                👨‍⚕️
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No doctors assigned
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Add the first doctor for this hospital.
              </p>

              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                disabled={
                  !hospital?.is_active
                }
                className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                + Add Doctor
              </button>

            </div>

          ) : (

            <div className="grid gap-5 md:grid-cols-2">

              {doctors.map(
                (doctor) => (

                  <div
                    key={doctor.id}
                    className="rounded-2xl border bg-white p-5 shadow-sm"
                  >

                    {/* Doctor heading */}

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h3 className="text-lg font-semibold text-gray-900">
                          {doctor.full_name}
                        </h3>

                        <p className="mt-1 text-sm font-medium text-blue-600">
                          {doctor.department ||
                            "Department not specified"}
                        </p>

                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          doctor.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {doctor.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </div>

                    {/* Details */}

                    <div className="mt-5 space-y-2 text-sm text-gray-600">

                      <p>
                        <span className="font-medium text-gray-800">
                          Email:
                        </span>{" "}
                        {doctor.email}
                      </p>

                      <p>
                        <span className="font-medium text-gray-800">
                          Phone:
                        </span>{" "}
                        {doctor.phone}
                      </p>

                      <p>
                        <span className="font-medium text-gray-800">
                          Doctor ID:
                        </span>{" "}
                        {doctor.id}
                      </p>

                    </div>

                    {/* Actions */}

                    <div className="mt-5 flex flex-wrap gap-2">

                      <select
                        value={
                          doctor.is_active
                            ? "active"
                            : "inactive"
                        }
                        onChange={(event) =>
                          changeDoctorStatus(
                            doctor,
                            event.target
                              .value ===
                              "active"
                          )
                        }
                        className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                          doctor.is_active
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >

                        <option value="active">
                          Active
                        </option>

                        <option value="inactive">
                          Inactive
                        </option>

                      </select>

                      <button
                        onClick={() =>
                          deleteDoctor(
                            doctor
                          )
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete Permanently
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </div>

      {/* ADD DOCTOR MODAL */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex items-start justify-between">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Add Doctor
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add doctor to{" "}
                  {hospital?.name}.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowForm(false)
                }
                disabled={saving}
                className="text-2xl text-gray-400 hover:text-gray-700 disabled:opacity-50"
              >
                ×
              </button>

            </div>

            {/* ERROR */}

            {formError && (

              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">

                <p className="text-sm text-red-700">
                  {formError}
                </p>

              </div>

            )}

            {/* FORM */}

            <div className="mt-6 space-y-4">

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Doctor Full Name *
                </label>

                <input
                  type="text"
                  placeholder="Dr. Ravi Kumar"
                  value={form.full_name}
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        full_name:
                          event.target
                            .value,
                      })
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email *
                </label>

                <input
                  type="email"
                  placeholder="doctor@example.com"
                  value={form.email}
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        email:
                          event.target
                            .value,
                      })
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Phone *
                </label>

                <input
                  type="tel"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        phone:
                          event.target
                            .value,
                      })
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Department *
                </label>

                <input
                  type="text"
                  placeholder="Cardiology"
                  value={form.department}
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        department:
                          event.target
                            .value,
                      })
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Temporary Password *
                </label>

                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        password:
                          event.target
                            .value,
                      })
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

            </div>

            {/* FOOTER */}

            <div className="mt-7 flex justify-end gap-3">

              <button
                onClick={() =>
                  setShowForm(false)
                }
                disabled={saving}
                className="rounded-lg border px-5 py-2.5 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={addDoctor}
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Adding..."
                  : "Add Doctor"}
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}
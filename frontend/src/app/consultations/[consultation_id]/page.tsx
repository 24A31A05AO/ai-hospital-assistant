"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
};

export default function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDoctor, setSelectedDoctor] = useState<
    Record<number, number>
  >({});

  const [assigning, setAssigning] = useState<number | null>(null);

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

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
      `http://127.0.0.1:8000${endpoint}`,
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

    if (response.status === 401) {
      localStorage.removeItem("access_token");
      router.push("/login");
      throw new Error("Session expired");
    }

    if (response.status === 403) {
      throw new Error("You do not have permission to access this resource.");
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      throw new Error(
        data?.detail || `Request failed: ${response.status}`
      );
    }

    return response.json();
  };

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
      setUsers(usersData);
      setDoctors(doctorsData);
      setConsultations(consultationsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load admin dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const assignDoctor = async (consultationId: number) => {
    const doctorId = selectedDoctor[consultationId];

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

      setSelectedDoctor((previous) => {
        const updated = { ...previous };
        delete updated[consultationId];
        return updated;
      });

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

  const unassignDoctor = async (consultationId: number) => {
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

  const logout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  const priorityClass = (priority: string) => {
    const value = priority.toLowerCase();

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
    const value = status.toLowerCase();

    if (value === "reviewed") {
      return "bg-green-100 text-green-700";
    }

    if (value === "in_progress") {
      return "bg-blue-100 text-blue-700";
    }

    if (value === "pending") {
      return "bg-gray-100 text-gray-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg font-medium text-gray-600">
          Loading admin dashboard...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-xl p-6">
          <h1 className="text-xl font-semibold text-red-700">
            Unable to load dashboard
          </h1>

          <p className="mt-2 text-red-600">
            {error}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}

      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Hospital AI Platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboard}
              className="px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* STATISTICS */}

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Overview
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Users"
              value={stats?.total_users ?? 0}
            />

            <StatCard
              title="Patients"
              value={stats?.total_patients ?? 0}
            />

            <StatCard
              title="Doctors"
              value={stats?.total_doctors ?? 0}
            />

            <StatCard
              title="Admins"
              value={stats?.total_admins ?? 0}
            />

            <StatCard
              title="Consultations"
              value={stats?.total_consultations ?? 0}
            />

            <StatCard
              title="Pending"
              value={stats?.pending_consultations ?? 0}
            />

            <StatCard
              title="Emergency"
              value={stats?.emergency_consultations ?? 0}
            />

            <StatCard
              title="Assigned"
              value={stats?.assigned_consultations ?? 0}
            />

            <StatCard
              title="Unassigned"
              value={stats?.unassigned_consultations ?? 0}
            />

            <StatCard
              title="Reviewed"
              value={stats?.reviewed_consultations ?? 0}
            />
          </div>
        </section>

        {/* CONSULTATIONS */}

        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Consultation Management
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Assign patient consultations to doctors.
              </p>
            </div>
          </div>

          {consultations.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
              No consultations found.
            </div>
          ) : (
            <div className="space-y-4">
              {consultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="bg-white rounded-xl border p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* PATIENT */}

                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {consultation.patient?.full_name ||
                            "Unknown Patient"}
                        </h3>

                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityClass(
                            consultation.priority
                          )}`}
                        >
                          {consultation.priority}
                        </span>

                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass(
                            consultation.status
                          )}`}
                        >
                          {consultation.status}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <p>
                          <strong>Complaint:</strong>{" "}
                          {consultation.chief_complaint}
                        </p>

                        <p>
                          <strong>Department:</strong>{" "}
                          {consultation.department ||
                            "Not specified"}
                        </p>

                        <p>
                          <strong>Village:</strong>{" "}
                          {consultation.patient?.village ||
                            "Not provided"}
                        </p>

                        <p>
                          <strong>Phone:</strong>{" "}
                          {consultation.patient?.phone ||
                            "Not provided"}
                        </p>

                        <p>
                          <strong>Created:</strong>{" "}
                          {formatDate(
                            consultation.created_at
                          )}
                        </p>
                      </div>

                      {consultation.doctor && (
                        <div className="mt-4 p-3 rounded-lg bg-blue-50">
                          <p className="text-sm text-blue-800">
                            <strong>
                              Assigned Doctor:
                            </strong>{" "}
                            {consultation.doctor.full_name}
                          </p>

                          <p className="text-xs text-blue-600 mt-1">
                            {consultation.doctor.email}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ACTIONS */}

                    <div className="w-full lg:w-72">
                      {!consultation.doctor_id ? (
                        <>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assign Doctor
                          </label>

                          <select
                            value={
                              selectedDoctor[
                                consultation.id
                              ] ?? ""
                            }
                            onChange={(e) =>
                              setSelectedDoctor(
                                (previous) => ({
                                  ...previous,
                                  [consultation.id]:
                                    Number(
                                      e.target.value
                                    ),
                                })
                              )
                            }
                            className="w-full border rounded-lg px-3 py-2 bg-white text-sm"
                          >
                            <option value="">
                              Select doctor
                            </option>

                            {doctors.map((doctor) => (
                              <option
                                key={doctor.id}
                                value={doctor.id}
                              >
                                {doctor.full_name}
                              </option>
                            ))}
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
                            className="mt-3 w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
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
                          className="w-full px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
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
                        className="mt-3 w-full px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50"
                      >
                        View Consultation
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* USERS */}

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Users
          </h2>

          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">
                      User
                    </th>

                    <th className="text-left px-5 py-3 font-medium text-gray-600">
                      Email
                    </th>

                    <th className="text-left px-5 py-3 font-medium text-gray-600">
                      Role
                    </th>

                    <th className="text-left px-5 py-3 font-medium text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {user.full_name}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {user.email}
                      </td>

                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                          {user.role}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="text-2xl font-bold text-gray-900 mt-2">
        {value}
      </p>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { API_BASE_URL } from "@/lib/api";

type User = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  village: string | null;
  role: string;
  is_active: boolean;
};

export default function AdminUserDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const userId = params?.user_id;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUser = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      if (!userId) {
        throw new Error("User ID is missing.");
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}`,
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
        throw new Error("User not found.");
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.detail || `Failed to load user (${response.status})`
        );
      }

      const data: User = await response.json();

      setUser(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load user."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const logout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border rounded-xl p-8 shadow-sm text-center">
          <div className="text-lg font-semibold text-gray-800">
            Loading user...
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Please wait while we load the user details.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                User details
              </p>
            </div>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <button
            onClick={() => router.push("/admin")}
            className="mb-6 px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50"
          >
            ← Back to Admin Dashboard
          </button>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h1 className="text-xl font-semibold text-red-700">
              Unable to Load User
            </h1>

            <p className="mt-2 text-red-600">
              {error}
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={loadUser}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Try Again
              </button>

              <button
                onClick={() => router.push("/admin")}
                className="px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50"
              >
                Back to Admin
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border rounded-xl p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            User Not Found
          </h1>

          <p className="mt-2 text-gray-500">
            The requested user could not be found.
          </p>

          <button
            onClick={() => router.push("/admin")}
            className="mt-5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              User Details
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Administrator view · User #{user.id}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin")}
              className="px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50"
            >
              ← Admin Dashboard
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

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* USER SUMMARY */}
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-700">
                  {user.full_name
                    ? user.full_name.charAt(0).toUpperCase()
                    : "U"}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.full_name}
                </h2>

                <p className="text-gray-500 mt-1">
                  User ID: {user.id}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 capitalize">
                {user.role}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </section>

        {/* PERSONAL INFORMATION */}
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Personal Information
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Basic information associated with this account.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Info
              label="Full Name"
              value={user.full_name}
            />

            <Info
              label="Email"
              value={user.email}
            />

            <Info
              label="Phone"
              value={user.phone}
            />

            <Info
              label="Village"
              value={user.village || "Not provided"}
            />

            <Info
              label="Role"
              value={user.role}
            />

            <Info
              label="Account Status"
              value={user.is_active ? "Active" : "Inactive"}
            />
          </div>
        </section>

        {/* ACCOUNT INFORMATION */}
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Account Information
          </h2>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Info
              label="User ID"
              value={String(user.id)}
            />

            <Info
              label="Role"
              value={user.role}
            />

            <Info
              label="Account Status"
              value={
                user.is_active
                  ? "Active"
                  : "Inactive"
              }
            />

            <Info
              label="Village"
              value={user.village || "Not provided"}
            />
          </div>
        </section>

        {/* ACTIONS */}
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Actions
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/admin")}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Back to Admin Dashboard
            </button>

            <button
              onClick={loadUser}
              className="px-5 py-2.5 rounded-lg border bg-white text-gray-700 hover:bg-gray-50"
            >
              Refresh User
            </button>
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
    <div className="border rounded-lg p-4 bg-gray-50">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-gray-900 font-medium break-words">
        {value || "Not provided"}
      </p>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";

type User = {
  id?: number;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const token = localStorage.getItem("access_token");

      // No JWT -> go to login
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await getCurrentUser();

        console.log("Current user:", data);

        if (!mounted) {
          return;
        }

        setUser(data);
      } catch (err) {
        console.error("Failed to load user:", err);

        if (!mounted) {
          return;
        }

        // Remove invalid/expired token
        localStorage.removeItem("access_token");

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load user");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <p className="text-slate-600">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
          <div className="mb-4 text-4xl">
            ⚠️
          </div>

          <h2 className="text-xl font-bold text-red-700">
            Failed to load user
          </h2>

          <p className="mt-3 text-slate-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("access_token");
              router.push("/login");
            }}
            className="mt-6 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  // ============================================================
  // NO USER
  // ============================================================

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <p className="text-slate-600">
            User information unavailable.
          </p>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-5 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  // ============================================================
  // SAFE USER VALUES
  // ============================================================

  const fullName =
    typeof user.full_name === "string" &&
    user.full_name.trim().length > 0
      ? user.full_name.trim()
      : "Patient";

  const firstName =
    fullName.split(/\s+/)[0] || "Patient";

  const email =
    typeof user.email === "string" &&
    user.email.trim().length > 0
      ? user.email
      : "Email not available";

  const phone =
    typeof user.phone === "string" &&
    user.phone.trim().length > 0
      ? user.phone
      : "Phone not available";

  const role =
    typeof user.role === "string" &&
    user.role.trim().length > 0
      ? user.role
      : "patient";

  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              AI Hospital Assistant
            </h1>

            <p className="text-sm text-slate-500">
              Patient Dashboard
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("access_token");
              router.push("/login");
            }}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Logout
          </button>

        </div>
      </header>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-6xl px-6 py-10">

        {/* Welcome */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-slate-900">
            Welcome, {firstName}
          </h2>

          <p className="mt-2 text-slate-600">
            How can we help you today?
          </p>

        </div>

        {/* ====================================================
            DASHBOARD CARDS
        ==================================================== */}

        <div className="grid gap-6 md:grid-cols-3">

          {/* ==================================================
              START CONSULTATION
          ================================================== */}

          <button
            type="button"
            onClick={() => router.push("/consultation")}
            className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 text-3xl">
              🩺
            </div>

            <h3 className="text-xl font-semibold text-slate-900">
              Start Consultation
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Tell the assistant about your symptoms and get
              guidance.
            </p>
          </button>

          {/* ==================================================
              MY CONSULTATIONS
          ================================================== */}

          <button
            type="button"
            onClick={() => router.push("/consultations")}
            className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 text-3xl">
              📋
            </div>

            <h3 className="text-xl font-semibold text-slate-900">
              My Consultations
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              View your previous consultations and AI summaries.
            </p>
          </button>

          {/* ==================================================
              MY PROFILE
          ================================================== */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="mb-4 text-3xl">
              👤
            </div>

            <h3 className="text-xl font-semibold text-slate-900">
              My Profile
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              {email}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {phone}
            </p>

            <p className="mt-1 text-sm capitalize text-slate-500">
              Role: {role}
            </p>

          </div>

        </div>

        {/* ====================================================
            ACCOUNT INFORMATION
        ==================================================== */}

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

          <h3 className="text-lg font-semibold text-slate-900">
            Account Information
          </h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Full Name
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {fullName}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Email
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {email}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Phone
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {phone}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Account Role
              </p>

              <p className="mt-1 font-medium capitalize text-slate-900">
                {role}
              </p>
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
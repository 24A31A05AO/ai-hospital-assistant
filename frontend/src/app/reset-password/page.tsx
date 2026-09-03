"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ============================================================
// RESET PASSWORD CONTENT
// ============================================================

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // GET TOKEN FROM URL
  // ============================================================

  useEffect(() => {
    const urlToken = searchParams.get("token");

    if (urlToken) {
      setToken(urlToken);
      setError("");
    } else {
      setError(
        "Password reset link is missing or invalid."
      );
    }
  }, [searchParams]);

  // ============================================================
  // SUBMIT
  // ============================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    // ----------------------------------------------------------
    // Validate token
    // ----------------------------------------------------------

    if (!token) {
      setError(
        "Invalid or missing password reset token."
      );
      return;
    }

    // ----------------------------------------------------------
    // Validate password
    // ----------------------------------------------------------

    if (newPassword.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // ----------------------------------------------------------
    // Submit
    // ----------------------------------------------------------

    setLoading(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://ai-hospital-api.onrender.com";

      const response = await fetch(
        `${API_URL}/auth/reset-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            token,
            new_password: newPassword,
          }),
        }
      );

      // --------------------------------------------------------
      // Safely parse response
      // --------------------------------------------------------

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      // --------------------------------------------------------
      // Handle API error
      // --------------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            `Unable to reset password. Status: ${response.status}`
        );
      }

      // --------------------------------------------------------
      // Success
      // --------------------------------------------------------

      setMessage(
        "Password reset successful. Redirecting to login..."
      );

      setNewPassword("");
      setConfirmPassword("");

      // --------------------------------------------------------
      // Redirect to login
      // --------------------------------------------------------

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      console.error(
        "Password reset error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while resetting your password."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Card */}

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">

          {/* Header */}

          <div className="text-center mb-8">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl">
              🔐
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Reset Password
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Create a new password for your account.
            </p>

          </div>

          {/* Error */}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700 whitespace-pre-line">
                {error}
              </p>
            </div>
          )}

          {/* Success */}

          {message && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm text-green-700">
                {message}
              </p>
            </div>
          )}

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* New Password */}

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                New Password
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />

              <p className="mt-1 text-xs text-slate-500">
                Minimum 8 characters.
              </p>
            </div>

            {/* Confirm Password */}

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={
                loading ||
                !token ||
                !newPassword ||
                !confirmPassword
              }
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Resetting Password..."
                : "Reset Password"}
            </button>

          </form>

          {/* Login */}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Back to Login
            </button>
          </div>

        </div>

      </div>
    </main>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-700">
              Loading...
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Preparing password reset...
            </p>
          </div>
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
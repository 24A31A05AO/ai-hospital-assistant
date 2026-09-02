"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
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
      setError(
        "Passwords do not match."
      );
      return;
    }

    // ----------------------------------------------------------
    // Submit
    // ----------------------------------------------------------

    setLoading(true);

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          "http://127.0.0.1:8000"
        }/auth/reset-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            token,
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Unable to reset password."
        );
      }

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
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

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
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success */}

          {message && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* New password */}

            <div>

              <label
                htmlFor="newPassword"
                className="block mb-2 text-sm font-medium text-slate-700"
              >
                New Password
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                required
              />

            </div>

            {/* Confirm password */}

            <div>

              <label
                htmlFor="confirmPassword"
                className="block mb-2 text-sm font-medium text-slate-700"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                required
              />

            </div>

            {/* Password requirements */}

            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">

              <p className="text-xs font-medium text-slate-700 mb-2">
                Password requirements
              </p>

              <ul className="text-xs text-slate-500 space-y-1">
                <li>• At least 8 characters</li>
                <li>• Both password fields must match</li>
              </ul>

            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Resetting Password..."
                : "Reset Password"}
            </button>

          </form>

          {/* Back to login */}

          <div className="mt-6 text-center">

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to Login
            </button>

          </div>

        </div>

      </div>

    </main>
  );
}
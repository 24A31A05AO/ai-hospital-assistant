"use client";

import {
  FormEvent,
  Suspense,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { resetPassword } from "@/lib/api";

/* =========================================================
   RESET PASSWORD FORM
========================================================= */

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    /* -------------------------------------------------------
       Validate token
    ------------------------------------------------------- */

    if (!token) {
      setError(
        "Password reset token is missing. Please use the reset link from your email."
      );
      return;
    }

    /* -------------------------------------------------------
       Validate password
    ------------------------------------------------------- */

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      /* -----------------------------------------------------
         Call backend
      ----------------------------------------------------- */

      const result = await resetPassword(
        token,
        newPassword
      );

      console.log(
        "Password reset successful:",
        result
      );

      setSuccess(
        "Password reset successful. Redirecting to login..."
      );

      /* -----------------------------------------------------
         Redirect to login
      ----------------------------------------------------- */

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (err: unknown) {
      console.error(
        "Password reset error:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to reset password. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <span className="text-3xl">
                🔐
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Reset Password
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Create a new password for your account.
            </p>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
            >
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {success && (
            <div
              role="status"
              className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3"
            >
              <p className="text-sm font-medium text-green-700">
                {success}
              </p>
            </div>
          )}

          {/* =================================================
              NO TOKEN
          ================================================= */}

          {!token ? (
            <div className="space-y-5">
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
                <p className="text-sm text-yellow-800">
                  This password reset link is missing
                  its token or is invalid.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push("/forgot-password")
                }
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Request New Reset Link
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push("/login")
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Back to Login
              </button>
            </div>
          ) : (
            /* =================================================
               FORM
            ================================================= */

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* =============================================
                  NEW PASSWORD
              ============================================= */}

              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  New password
                </label>

                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(
                      event.target.value
                    );

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  disabled={loading}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Minimum 8 characters.
                </p>
              </div>

              {/* =============================================
                  CONFIRM PASSWORD
              ============================================= */}

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Confirm new password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(
                      event.target.value
                    );

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  disabled={loading}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              {/* =============================================
                  SUBMIT
              ============================================= */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Resetting password...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>

              {/* =============================================
                  LOGIN
              ============================================= */}

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  router.push("/login")
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back to Login
              </button>
            </form>
          )}

          {/* =================================================
              SECURITY INFO
          ================================================= */}

          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-700">
              Security
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Your password is securely hashed before
              it is stored. The reset link can only be
              used once and expires after a limited time.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   PAGE
   Suspense is REQUIRED because ResetPasswordForm uses
   useSearchParams().
========================================================= */

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

            <p className="text-sm text-gray-600">
              Loading password reset...
            </p>
          </div>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
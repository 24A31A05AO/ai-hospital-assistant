"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [developmentToken, setDevelopmentToken] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setError("");
    setMessage("");
    setDevelopmentToken("");

    setLoading(true);

    try {
      const response = await forgotPassword(email);

      setMessage(response.message);

      /*
       * Your backend currently returns this only
       * for development.
       */
      if (response.development_token) {
        setDevelopmentToken(
          response.development_token,
        );
      }
    } catch (err) {
      console.error(
        "Forgot password failed:",
        err,
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to process password reset request.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="text-5xl">🔐</div>

          <h1 className="mt-5 text-3xl font-bold text-slate-900">
            Forgot Password
          </h1>

          <p className="mt-2 text-slate-600">
            Enter your email to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {message}
          </div>
        )}

        {developmentToken && (
          <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
            <p className="text-sm font-semibold text-yellow-900">
              Development Reset Token
            </p>

            <p className="mt-2 break-all text-xs text-yellow-800">
              {developmentToken}
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/reset-password?token=${encodeURIComponent(
                    developmentToken,
                  )}`,
                )
              }
              className="mt-4 rounded-lg bg-yellow-700 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-800"
            >
              Continue to Reset Password
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading
              ? "Sending..."
              : "Send Reset Instructions"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-sm font-semibold text-slate-700 hover:underline"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </main>
  );
}
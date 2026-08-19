"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  loginUser,
} from "@/lib/api";

export default function LoginPage() {
  const router =
    useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const cleanEmail =
      email.trim();

    if (!cleanEmail) {
      setError(
        "Please enter your email."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    setLoading(true);

    try {
      const result =
        await loginUser({
          email: cleanEmail,
          password,
        });

      console.log(
        "Login successful"
      );

      /*
       * Backend returns:
       *
       * role = patient
       * role = doctor
       * role = admin
       */

      if (
        result.role ===
        "doctor"
      ) {
        router.replace(
          "/doctor"
        );
        return;
      }

      if (
        result.role ===
        "admin"
      ) {
        router.replace(
          "/admin"
        );
        return;
      }

      /*
       * IMPORTANT:
       *
       * There is no:
       *
       * /patient
       *
       * directory.
       *
       * The patient dashboard is:
       *
       * /dashboard
       */

      router.replace(
        "/dashboard"
      );
    } catch (
      error: unknown
    ) {
      console.error(
        "Login error:",
        error
      );

      if (
        error instanceof Error
      ) {
        setError(
          error.message
        );
      } else {
        setError(
          "Login failed. Please check your email and password."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

          {/* HEADER */}

          <div className="text-center mb-8">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <span className="text-3xl">
                🏥
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              AI Hospital Assistant
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Sign in to continue
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
            >
              <p className="text-sm font-medium text-red-700 whitespace-pre-line">
                {error}
              </p>
            </div>
          )}

          {/* FORM */}

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value
                  );

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="doctor@test.com"
                autoComplete="email"
                disabled={loading}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(
                    event.target.value
                  );

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

            </div>

            {/* FORGOT PASSWORD */}

            <div className="flex justify-end">

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  router.push(
                    "/forgot-password"
                  )
                }
                className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                Forgot password?
              </button>

            </div>

            {/* LOGIN */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">

                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />

                  Signing in...

                </span>
              ) : (
                "Sign In"
              )}
            </button>

          </form>

          {/* REGISTER */}

          <div className="mt-7 text-center">

            <p className="text-sm text-gray-600">

              Don't have an account?{" "}

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  router.push(
                    "/register"
                  )
                }
                className="font-semibold text-blue-600 hover:text-blue-800"
              >
                Create account
              </button>

            </p>

          </div>

        </div>

      </div>
    </main>
  );
}
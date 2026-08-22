"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
    const [village, setVillage] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters long.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({
        full_name: fullName,
        email,
        phone,
        password,
        village,
      });

      console.log("Registration successful:", response);

      setSuccess(
        "Registration successful. Redirecting to login...",
      );

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      console.error("Registration failed:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="text-5xl">🏥</div>

          <h1 className="mt-5 text-3xl font-bold text-slate-900">
            Create Account
          </h1>

          <p className="mt-2 text-slate-600">
            Register for AI Hospital Assistant
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-semibold">
              Registration failed
            </p>

            <p className="mt-1">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              placeholder="Enter your full name"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

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
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Phone
            </label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              placeholder="Enter your phone number"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Create a password"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm your password"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
  <label
    htmlFor="village"
    className="mb-2 block text-sm font-semibold text-slate-800"
  >
    Village
  </label>

  <input
    id="village"
    type="text"
    value={village}
    onChange={(e) => setVillage(e.target.value)}
    placeholder="Enter your village"
    required
    maxLength={100}
    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
  />
</div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-slate-500">
            Already have an account?{" "}
          </span>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-sm font-semibold text-slate-900 hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </main>
  );
}
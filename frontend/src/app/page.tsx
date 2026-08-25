"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const goToLogin = () => {
    router.push("/login");
  };

  const goToRegister = () => {
    router.push("/register");
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          {/* Logo */}

          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-sm">
              +
            </div>

            <div className="text-left">
              <div className="text-lg font-bold leading-tight text-gray-900">
                AI Hospital Assistant
              </div>

              <div className="text-xs text-gray-500">
                Smarter patient care
              </div>
            </div>
          </button>

          {/* Desktop Navigation */}

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
            >
              How It Works
            </a>

            <a
              href="#benefits"
              className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
            >
              Benefits
            </a>

            <button
              onClick={goToLogin}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Sign In
            </button>

            <button
              onClick={goToRegister}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Get Started
            </button>
          </nav>

          {/* Mobile Menu Button */}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 md:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Navigation */}

        {menuOpen && (
          <div className="border-t border-gray-200 bg-white px-6 py-5 shadow-lg md:hidden">
            <div className="flex flex-col gap-4">
              <a
                href="#features"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-gray-700"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-gray-700"
              >
                How It Works
              </a>

              <a
                href="#benefits"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-gray-700"
              >
                Benefits
              </a>

              <button
                onClick={goToLogin}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700"
              >
                Sign In
              </button>

              <button
                onClick={goToRegister}
                className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-32">
        {/* Decorative background */}

        <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="pointer-events-none absolute -right-40 top-40 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-10 lg:px-8 lg:pb-28">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* Hero Text */}

            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-green-500" />
                AI-powered healthcare assistance
              </div>

              <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
                Healthcare assistance,
                <span className="block text-blue-600">
                  made simpler.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                AI Hospital Assistant helps patients organize their
                symptoms and medical information before a consultation,
                while helping healthcare teams review patient information
                more efficiently.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={goToRegister}
                  className="rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Get Started
                </button>

                <button
                  onClick={goToLogin}
                  className="rounded-xl border border-gray-300 bg-white px-7 py-3.5 text-base font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Sign In
                </button>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Patient-friendly
                </span>

                <span className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  AI-assisted summaries
                </span>

                <span className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Doctor review workflow
                </span>
              </div>
            </div>

            {/* Hero Product Preview */}

            <div className="relative">
              <div className="absolute -inset-5 rounded-[2rem] bg-blue-200/30 blur-2xl" />

              <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
                {/* Browser header */}

                <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-5 py-4">
                  <div className="h-3 w-3 rounded-full bg-red-300" />
                  <div className="h-3 w-3 rounded-full bg-yellow-300" />
                  <div className="h-3 w-3 rounded-full bg-green-300" />

                  <div className="ml-4 flex-1 rounded-md bg-white px-4 py-1.5 text-xs text-gray-400">
                    AI Hospital Assistant
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Patient Assistant
                      </p>

                      <h3 className="mt-1 text-2xl font-bold text-gray-900">
                        How are you feeling?
                      </h3>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-600">
                      +
                    </div>
                  </div>

                  <div className="mt-7 space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Chief complaint
                      </p>

                      <p className="mt-2 font-medium text-gray-800">
                        Cold and sneezing
                      </p>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                        AI-assisted summary
                      </p>

                      <p className="mt-2 text-sm leading-6 text-blue-900">
                        Patient reports cold symptoms with sneezing.
                        Relevant information has been organized for
                        healthcare review.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-xs text-gray-400">
                          Department
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          General Medicine
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-xs text-gray-400">
                          Priority
                        </p>

                        <span className="mt-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Low
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card */}

              <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    ✓
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Consultation
                    </p>

                    <p className="text-sm font-bold text-gray-900">
                      Ready for review
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TRUST / INTRO
      ====================================================== */}

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-8 text-center sm:grid-cols-3">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                AI
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Organize patient information
              </p>
            </div>

            <div>
              <div className="text-3xl font-bold text-blue-600">
                Patient
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Simple consultation experience
              </p>
            </div>

            <div>
              <div className="text-3xl font-bold text-blue-600">
                Doctor
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Review information efficiently
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ====================================================== */}

      <section
        id="features"
        className="bg-white py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Features
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Everything needed for a smoother consultation
            </h2>

            <p className="mt-4 text-lg leading-8 text-gray-600">
              A simple digital workflow connecting patients,
              AI-assisted information collection, and healthcare
              professionals.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}

            <FeatureCard
              icon="💬"
              title="Patient Consultation"
              description="Patients can describe their symptoms and provide important medical information through a guided consultation."
            />

            {/* Feature 2 */}

            <FeatureCard
              icon="🤖"
              title="AI-Assisted Summary"
              description="Patient-provided information can be organized into a concise summary to support the healthcare review process."
            />

            {/* Feature 3 */}

            <FeatureCard
              icon="🩺"
              title="Doctor Review"
              description="Doctors can review assigned consultations, add notes, and update the consultation status."
            />

            {/* Feature 4 */}

            <FeatureCard
              icon="📋"
              title="Consultation History"
              description="Patients can view their previous consultations, summaries, status, assigned department, and doctor information."
            />

            {/* Feature 5 */}

            <FeatureCard
              icon="🏥"
              title="Department Guidance"
              description="Consultation information can help direct patients toward the appropriate hospital department."
            />

            {/* Feature 6 */}

            <FeatureCard
              icon="🔐"
              title="Role-Based Access"
              description="Separate patient, doctor, and administrator workflows help keep application functionality organized."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <section
        id="how-it-works"
        className="bg-gray-50 py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
              How It Works
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              From symptoms to consultation
            </h2>

            <p className="mt-4 text-lg text-gray-600">
              A straightforward workflow designed around the patient
              and healthcare team.
            </p>
          </div>

          <div className="relative mt-16 grid gap-8 md:grid-cols-3">
            <StepCard
              number="01"
              title="Tell us what is wrong"
              description="Enter your chief complaint, symptoms, medical history, medications, and allergies."
            />

            <StepCard
              number="02"
              title="Information is organized"
              description="The platform organizes the submitted information and generates an AI-assisted summary."
            />

            <StepCard
              number="03"
              title="Healthcare review"
              description="The assigned doctor can review the consultation, add notes, and update its status."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          BENEFITS
      ====================================================== */}

      <section
        id="benefits"
        className="bg-white py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
                Built for healthcare workflows
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                Better information before the consultation begins.
              </h2>

              <p className="mt-5 text-lg leading-8 text-gray-600">
                AI Hospital Assistant is designed to reduce repetitive
                information collection and make patient information
                easier to review.
              </p>

              <div className="mt-8 space-y-5">
                <Benefit
                  title="For Patients"
                  description="A structured way to describe symptoms and keep track of consultation history."
                />

                <Benefit
                  title="For Doctors"
                  description="A dedicated dashboard for reviewing assigned consultations and recording doctor notes."
                />

                <Benefit
                  title="For Hospitals"
                  description="A digital workflow that can help organize patient intake and consultation information."
                />
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-sm">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Consultation workflow
                    </p>

                    <p className="mt-1 text-xl font-bold text-gray-900">
                      Patient → AI → Doctor
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl">
                    🩺
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <WorkflowItem
                    number="1"
                    title="Patient submits information"
                    active
                  />

                  <WorkflowItem
                    number="2"
                    title="AI-assisted summary"
                    active
                  />

                  <WorkflowItem
                    number="3"
                    title="Doctor reviews"
                    active
                  />

                  <WorkflowItem
                    number="4"
                    title="Doctor notes & status"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="bg-blue-600 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to try AI Hospital Assistant?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100">
            Create an account and start organizing your healthcare
            consultation information.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={goToRegister}
              className="rounded-xl bg-white px-7 py-3.5 font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
            >
              Create Account
            </button>

            <button
              onClick={goToLogin}
              className="rounded-xl border border-blue-300 bg-blue-500 px-7 py-3.5 font-semibold text-white transition hover:bg-blue-400"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-gray-200 bg-gray-950 text-gray-300">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg text-white">
                  +
                </div>

                <div>
                  <p className="font-bold text-white">
                    AI Hospital Assistant
                  </p>

                  <p className="text-xs text-gray-500">
                    Smarter patient care
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-md text-sm leading-6 text-gray-400">
                An AI-assisted healthcare platform designed to
                organize patient information and support consultation
                workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Platform
              </h3>

              <div className="mt-4 space-y-3 text-sm">
                <button
                  onClick={() => router.push("/login")}
                  className="block text-gray-400 transition hover:text-white"
                >
                  Sign In
                </button>

                <button
                  onClick={() => router.push("/register")}
                  className="block text-gray-400 transition hover:text-white"
                >
                  Create Account
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Explore
              </h3>

              <div className="mt-4 space-y-3 text-sm">
                <a
                  href="#features"
                  className="block text-gray-400 transition hover:text-white"
                >
                  Features
                </a>

                <a
                  href="#how-it-works"
                  className="block text-gray-400 transition hover:text-white"
                >
                  How It Works
                </a>

                <a
                  href="#benefits"
                  className="block text-gray-400 transition hover:text-white"
                >
                  Benefits
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-gray-800 pt-8">
            <p className="text-center text-xs leading-5 text-gray-500">
              © {new Date().getFullYear()} AI Hospital Assistant.
              All rights reserved.
            </p>

            <p className="mx-auto mt-3 max-w-3xl text-center text-xs leading-5 text-gray-600">
              This platform provides AI-assisted information
              organization and is not a substitute for professional
              medical diagnosis, treatment, or emergency care.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ============================================================
   FEATURE CARD
============================================================ */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl transition group-hover:bg-blue-100">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold text-gray-900">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-gray-600">
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   STEP CARD
============================================================ */

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
        {number}
      </div>

      <h3 className="mt-6 text-xl font-bold text-gray-900">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-gray-600">
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   BENEFIT
============================================================ */

function Benefit({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
        ✓
      </div>

      <div>
        <h3 className="font-bold text-gray-900">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-gray-600">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   WORKFLOW ITEM
============================================================ */

function WorkflowItem({
  number,
  title,
  active = false,
}: {
  number: string;
  title: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border p-4 ${
        active
          ? "border-blue-100 bg-blue-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          active
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {number}
      </div>

      <span
        className={`text-sm font-medium ${
          active ? "text-blue-900" : "text-gray-500"
        }`}
      >
        {title}
      </span>

      {active && (
        <span className="ml-auto text-green-600">
          ✓
        </span>
      )}
    </div>
  );
}
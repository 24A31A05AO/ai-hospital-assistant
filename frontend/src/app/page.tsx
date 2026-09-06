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
    setMenuOpen(false);
    router.push("/login");
  };

  const goToRegister = () => {
    setMenuOpen(false);
    router.push("/register");
  };

  const startConsultation = () => {
    const token = localStorage.getItem("access_token");

    if (token) {
      router.push("/consultation");
    } else {
      router.push("/login");
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl"
            : "bg-white/80 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          {/* LOGO */}

          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-600/20">
              +
            </div>

            <div className="text-left">
              <div className="text-base font-bold text-slate-950 sm:text-lg">
                AI Hospital Assistant
              </div>

              <div className="text-xs text-slate-500">
                Smarter healthcare. Simpler care.
              </div>
            </div>
          </button>

          {/* DESKTOP NAV */}

          <nav className="hidden items-center gap-7 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              How It Works
            </a>

            <a
              href="#benefits"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Benefits
            </a>

            <button
              type="button"
              onClick={goToLogin}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={goToRegister}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Get Started
            </button>
          </nav>

          {/* MOBILE BUTTON */}

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xl text-slate-700 md:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>

        {/* MOBILE MENU */}

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-5 py-5 shadow-lg md:hidden">
            <div className="flex flex-col gap-4">
              <a
                href="#features"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                How It Works
              </a>

              <a
                href="#benefits"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Benefits
              </a>

              <button
                type="button"
                onClick={goToLogin}
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Sign In
              </button>

              <button
                type="button"
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
        {/* BACKGROUND DECORATION */}

        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />

        <div className="pointer-events-none absolute -right-40 top-32 h-[500px] w-[500px] rounded-full bg-cyan-200/40 blur-3xl" />

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-100/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-28">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* HERO CONTENT */}

            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                AI-powered healthcare assistance
              </div>

              <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Your healthcare journey,
                <span className="block text-blue-600">
                  made simpler.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Describe your symptoms, organize your health information,
                connect with the right department, and manage appointments
                through one simple digital healthcare assistant.
              </p>

              {/* ACTIONS */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={startConsultation}
                  className="rounded-xl bg-blue-600 px-7 py-3.5 text-base font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Start Consultation
                </button>

                <button
                  type="button"
                  onClick={goToRegister}
                  className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Create Account
                </button>
              </div>

              {/* TRUST POINTS */}

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="font-bold text-green-600">✓</span>
                  Patient-friendly
                </span>

                <span className="flex items-center gap-2">
                  <span className="font-bold text-green-600">✓</span>
                  AI-assisted
                </span>

                <span className="flex items-center gap-2">
                  <span className="font-bold text-green-600">✓</span>
                  Doctor review
                </span>
              </div>
            </div>

            {/* HERO DASHBOARD PREVIEW */}

            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-blue-300/30 blur-3xl" />

              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                {/* APP HEADER */}

                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
                      +
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Patient Portal
                      </p>

                      <p className="text-xs text-slate-500">
                        AI Hospital Assistant
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Online
                  </div>
                </div>

                {/* DASHBOARD */}

                <div className="bg-slate-50 p-5 sm:p-6">
                  {/* WELCOME */}

                  <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-5 text-white">
                    <p className="text-sm text-blue-100">
                      Welcome back
                    </p>

                    <h3 className="mt-1 text-2xl font-bold">
                      How can we help today?
                    </h3>

                    <p className="mt-2 max-w-md text-sm leading-6 text-blue-50">
                      Get assistance before your next hospital visit.
                    </p>
                  </div>

                  {/* QUICK ACTIONS */}

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-xl">
                        💬
                      </div>

                      <p className="text-sm font-bold text-slate-900">
                        Consultation
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        AI-assisted guidance
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-xl">
                        📅
                      </div>

                      <p className="text-sm font-bold text-slate-900">
                        Appointment
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Book with a doctor
                      </p>
                    </div>
                  </div>

                  {/* CONSULTATION SUMMARY */}

                  <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Latest consultation
                        </p>

                        <p className="mt-1 font-bold text-slate-900">
                          Cold and sneezing
                        </p>
                      </div>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Reviewed
                      </span>
                    </div>

                    <div className="mt-4 rounded-lg bg-blue-50 p-3">
                      <p className="text-xs font-semibold text-blue-600">
                        AI-assisted summary
                      </p>

                      <p className="mt-1 text-sm leading-6 text-blue-950">
                        Symptoms organized for healthcare review with
                        relevant patient information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FLOATING APPOINTMENT CARD */}

              <div className="absolute -bottom-6 -left-5 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-xl">
                    ✓
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Appointment
                    </p>

                    <p className="text-sm font-bold text-slate-900">
                      Successfully booked
                    </p>
                  </div>
                </div>
              </div>

              {/* FLOATING DOCTOR CARD */}

              <div className="absolute -right-5 top-20 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg">
                    👨‍⚕️
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Care team
                    </p>

                    <p className="text-sm font-bold text-slate-900">
                      Doctor review
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRO / STATS
      ====================================================== */}

      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 text-center md:grid-cols-4">
            <StatCard
              number="24/7"
              title="Digital Assistance"
              description="Access your healthcare tools whenever you need them."
            />

            <StatCard
              number="AI"
              title="Guided Consultation"
              description="Organize symptoms and information before seeing a doctor."
            />

            <StatCard
              number="1"
              title="Patient Dashboard"
              description="Keep consultations and appointments together."
            />

            <StatCard
              number="Care"
              title="Doctor Workflow"
              description="Healthcare teams can review organized patient information."
            />
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
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="FEATURES"
            title="Everything you need for a smoother hospital experience"
            description="AI Hospital Assistant connects the patient journey from initial consultation to appointment management and healthcare review."
          />

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="💬"
              title="AI Consultation"
              description="Answer guided questions about your symptoms and health information before meeting a healthcare professional."
            />

            <FeatureCard
              icon="🤖"
              title="AI-Assisted Summary"
              description="Important information can be organized into a concise summary that is easier for healthcare professionals to review."
            />

            <FeatureCard
              icon="👨‍⚕️"
              title="Doctor Review"
              description="Doctors can review assigned consultations, add notes, and update the consultation status."
            />

            <FeatureCard
              icon="📅"
              title="Appointment Booking"
              description="Patients can choose a hospital, department, doctor, date and time to request an appointment."
            />

            <FeatureCard
              icon="🏥"
              title="Hospital Departments"
              description="Choose from available departments to help direct your appointment toward the appropriate area of care."
            />

            <FeatureCard
              icon="📋"
              title="Patient History"
              description="Keep track of previous consultations, appointment information and healthcare summaries from your dashboard."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <section
        id="how-it-works"
        className="bg-slate-50 py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="HOW IT WORKS"
            title="From symptoms to care in a few simple steps"
            description="The platform is designed to reduce unnecessary complexity for patients while giving doctors organized information."
          />

          <div className="mt-16 grid gap-6 md:grid-cols-4">
            <StepCard
              number="01"
              icon="👤"
              title="Create your account"
              description="Register as a patient and securely access your healthcare dashboard."
            />

            <StepCard
              number="02"
              icon="💬"
              title="Start consultation"
              description="Tell the assistant about your symptoms and relevant health information."
            />

            <StepCard
              number="03"
              icon="🤖"
              title="Information is organized"
              description="Your consultation information is organized into an easy-to-review summary."
            />

            <StepCard
              number="04"
              icon="📅"
              title="Continue your care"
              description="Book appointments and manage your healthcare journey from the patient dashboard."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          PATIENT EXPERIENCE
      ====================================================== */}

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* LEFT */}

            <div>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                FOR PATIENTS
              </span>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Spend less time figuring out what to do next.
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                Instead of navigating multiple disconnected steps,
                patients can use one dashboard to start consultations,
                review their information and manage appointments.
              </p>

              <div className="mt-8 space-y-4">
                <CheckItem text="Guided symptom consultation" />

                <CheckItem text="Organized medical information" />

                <CheckItem text="Simple appointment booking" />

                <CheckItem text="Consultation and appointment history" />
              </div>

              <button
                type="button"
                onClick={goToRegister}
                className="mt-9 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Create Patient Account
              </button>
            </div>

            {/* RIGHT */}

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8">
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Patient Dashboard
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-slate-900">
                      Your care at a glance
                    </h3>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg">
                    👤
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <DashboardRow
                    icon="💬"
                    title="Start Consultation"
                    subtitle="Describe your symptoms"
                    status="Available"
                  />

                  <DashboardRow
                    icon="📋"
                    title="My Consultations"
                    subtitle="View your health summaries"
                    status="3 records"
                  />

                  <DashboardRow
                    icon="📅"
                    title="My Appointments"
                    subtitle="Manage upcoming visits"
                    status="1 upcoming"
                  />

                  <DashboardRow
                    icon="🏥"
                    title="Find Department"
                    subtitle="Choose the right department"
                    status="Available"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          BENEFITS
      ====================================================== */}

      <section
        id="benefits"
        className="bg-slate-950 py-24 text-white"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            dark
            eyebrow="BENEFITS"
            title="Designed around better healthcare workflows"
            description="The platform helps patients organize information while giving healthcare teams a clearer starting point for review."
          />

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            <DarkBenefitCard
              icon="❤️"
              title="For Patients"
              description="A simpler way to describe symptoms, access consultations and manage appointments."
            />

            <DarkBenefitCard
              icon="👨‍⚕️"
              title="For Doctors"
              description="Review organized patient information and focus more time on clinical interaction."
            />

            <DarkBenefitCard
              icon="🏥"
              title="For Hospitals"
              description="Create a more structured digital workflow for patient intake, consultation and appointments."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-500 py-20">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-6">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
            GET STARTED
          </span>

          <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Make your next healthcare visit simpler.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-50">
            Start a consultation, organize your information and manage
            your appointments from one patient-friendly platform.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={goToRegister}
              className="rounded-xl bg-white px-7 py-3.5 font-bold text-blue-700 shadow-xl transition hover:bg-blue-50"
            >
              Create Account
            </button>

            <button
              type="button"
              onClick={goToLogin}
              className="rounded-xl border border-white/40 bg-white/10 px-7 py-3.5 font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
              +
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                AI Hospital Assistant
              </p>

              <p className="text-xs text-slate-500">
                Smarter healthcare. Simpler care.
              </p>
            </div>
          </div>

          <div className="text-sm text-slate-500">
            AI-assisted healthcare platform
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({
  eyebrow,
  title,
  description,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  dark?: boolean;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span
        className={`text-sm font-bold uppercase tracking-[0.2em] ${
          dark ? "text-blue-300" : "text-blue-600"
        }`}
      >
        {eyebrow}
      </span>

      <h2
        className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${
          dark ? "text-white" : "text-slate-950"
        }`}
      >
        {title}
      </h2>

      <p
        className={`mt-4 text-lg leading-8 ${
          dark ? "text-slate-300" : "text-slate-600"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="px-4">
      <div className="text-3xl font-extrabold text-blue-600">
        {number}
      </div>

      <h3 className="mt-2 font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
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
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl transition group-hover:bg-blue-100">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">
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
  icon,
  title,
  description,
}: {
  number: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
          {icon}
        </div>

        <span className="text-sm font-extrabold text-blue-200">
          {number}
        </span>
      </div>

      <h3 className="mt-6 text-lg font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   CHECK ITEM
============================================================ */

function CheckItem({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
        ✓
      </div>

      <span className="font-medium text-slate-700">
        {text}
      </span>
    </div>
  );
}

/* ============================================================
   DASHBOARD ROW
============================================================ */

function DashboardRow({
  icon,
  title,
  subtitle,
  status,
}: {
  icon: string;
  title: string;
  subtitle: string;
  status: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-blue-200 hover:bg-blue-50/30">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900">
          {title}
        </p>

        <p className="truncate text-xs text-slate-500">
          {subtitle}
        </p>
      </div>

      <span className="shrink-0 text-xs font-semibold text-blue-600">
        {status}
      </span>
    </div>
  );
}

/* ============================================================
   DARK BENEFIT CARD
============================================================ */

function DarkBenefitCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:-translate-y-1 hover:border-slate-700">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-2xl">
        {icon}
      </div>

      <h3 className="mt-6 text-xl font-bold text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-300">
        {description}
      </p>
    </div>
  );
}
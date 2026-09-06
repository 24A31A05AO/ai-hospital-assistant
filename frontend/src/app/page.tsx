"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const goLogin = () => {
    router.push("/login");
  };

  const goRegister = () => {
    router.push("/register");
  };

  const goConsultation = () => {
    router.push("/consultation");
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3f6fa] text-slate-950">
      {/* =========================================================
          NAVBAR
      ========================================================== */}

      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl"
            : "bg-white/90 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-10">
          {/* LOGO */}

          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 text-lg font-bold text-white shadow-md shadow-blue-500/20">
              +
            </div>

            <div className="text-left">
              <div className="text-[17px] font-bold tracking-tight text-slate-950">
                carePath
              </div>

              <div className="hidden text-[10px] text-slate-400 sm:block">
                AI Hospital Assistant
              </div>
            </div>
          </button>

          {/* DESKTOP NAV */}

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              How it works
            </a>

            <a
              href="#care"
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              Patient Care
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              About
            </a>
          </nav>

          {/* DESKTOP LOGIN */}

          <button
            type="button"
            onClick={goLogin}
            className="hidden rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-slate-800 md:block"
          >
            Sign in
          </button>

          {/* MOBILE MENU */}

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-800 shadow-sm md:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>

        {/* MOBILE NAVIGATION */}

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-5 py-5 shadow-lg md:hidden">
            <div className="flex flex-col gap-4">
              <a
                href="#features"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                How it works
              </a>

              <a
                href="#care"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Patient Care
              </a>

              <a
                href="#about"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                About
              </a>

              <button
                type="button"
                onClick={goLogin}
                className="mt-1 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Sign in
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================
          HERO
      ========================================================== */}

      <section className="relative overflow-hidden bg-[#edf2f7] pt-[70px]">
        {/* BACKGROUND SHAPES */}

        <div className="pointer-events-none absolute -right-32 top-10 h-[420px] w-[420px] rounded-full bg-blue-200/40 blur-3xl" />

        <div className="pointer-events-none absolute -left-32 bottom-10 h-[350px] w-[350px] rounded-full bg-indigo-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-0 pt-12 sm:px-6 sm:pt-16 lg:px-10 lg:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/* HERO CONTENT */}

            <div className="relative z-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-green-500" />

                <span className="text-xs font-semibold text-slate-600">
                  AI-powered healthcare assistance
                </span>
              </div>

              <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-[64px]">
                Your healthcare journey,
                <span className="block text-indigo-600">
                  made simpler.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Describe your symptoms, organize your health information,
                connect with the right department, and manage appointments
                through one simple digital healthcare assistant.
              </p>

              {/* CTA BUTTONS */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={goConsultation}
                  className="rounded-full bg-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700"
                >
                  Start Consultation
                  <span className="ml-2">→</span>
                </button>

                <button
                  type="button"
                  onClick={goRegister}
                  className="rounded-full border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50"
                >
                  Create Account
                </button>
              </div>

              {/* BENEFITS */}

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-500 sm:text-sm">
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

            {/* =====================================================
                PATIENT PORTAL PREVIEW
            ====================================================== */}

            <div className="relative mx-auto w-full max-w-[500px] lg:mx-0">
              {/* GLOW */}

              <div className="absolute -inset-5 rounded-[40px] bg-blue-300/30 blur-3xl" />

              {/* DASHBOARD CARD */}

              <div className="relative overflow-hidden rounded-[30px] border border-white bg-white shadow-2xl">
                {/* TOP BAR */}

                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                      +
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Patient Portal
                      </p>

                      <p className="text-[10px] text-slate-400">
                        AI Hospital Assistant
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />

                    <span className="text-[10px] font-semibold text-green-600">
                      Online
                    </span>
                  </div>
                </div>

                {/* DASHBOARD BODY */}

                <div className="bg-[#f8fafc] p-5 sm:p-6">
                  <p className="text-xs font-medium text-slate-400">
                    Welcome back
                  </p>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                    How can we help today?
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Get assistance before your next hospital visit.
                  </p>

                  {/* QUICK ACTIONS */}

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <PortalAction
                      icon="💬"
                      title="Consultation"
                      subtitle="AI-assisted guidance"
                      onClick={goConsultation}
                    />

                    <PortalAction
                      icon="📅"
                      title="Appointment"
                      subtitle="Book with a doctor"
                      onClick={goRegister}
                    />
                  </div>

                  {/* LATEST CONSULTATION */}

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Latest consultation
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-900">
                          Cold and sneezing
                        </p>
                      </div>

                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold text-green-700">
                        Reviewed
                      </span>
                    </div>

                    <div className="mt-4 rounded-xl bg-indigo-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-500">
                        AI-assisted summary
                      </p>

                      <p className="mt-1.5 text-xs leading-5 text-indigo-900">
                        Symptoms organized for healthcare review with
                        relevant patient information.
                      </p>
                    </div>
                  </div>

                  {/* STATUS */}

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">✓</span>

                        <div>
                          <p className="text-[10px] text-slate-400">
                            Appointment
                          </p>

                          <p className="text-xs font-bold text-slate-800">
                            Successfully booked
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">👨‍⚕️</span>

                        <div>
                          <p className="text-[10px] text-slate-400">
                            Care team
                          </p>

                          <p className="text-xs font-bold text-slate-800">
                            Doctor review
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FLOATING STATUS CARD */}

              <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-white bg-white px-4 py-3 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-600">
                    ✓
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400">
                      Consultation
                    </p>

                    <p className="text-xs font-bold text-slate-900">
                      Ready for doctor review
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              HERO BOTTOM FEATURE STRIP
          ====================================================== */}

          <div className="relative z-20 mt-12 grid overflow-hidden rounded-t-[28px] border border-white bg-white/90 shadow-xl backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
            <MiniFeature
              icon="💬"
              title="Consultation"
              description="AI-assisted"
            />

            <MiniFeature
              icon="📅"
              title="Appointments"
              description="Easy booking"
            />

            <MiniFeature
              icon="👨‍⚕️"
              title="Doctor Review"
              description="Organized information"
            />

            <MiniFeature
              icon="🏥"
              title="Departments"
              description="Better guidance"
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          DIGITAL ASSISTANCE
      ========================================================== */}

      <section
        id="features"
        className="bg-white px-5 py-20 sm:px-6 lg:px-10 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            {/* LEFT */}

            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                Digital Assistance
              </span>

              <h2 className="mt-4 max-w-xl text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Access your healthcare tools whenever you need them.
              </h2>

              <p className="mt-5 max-w-lg text-base leading-7 text-slate-500">
                AI Hospital Assistant brings consultation support,
                patient information, appointments, and doctor review into
                one connected healthcare workflow.
              </p>

              
            </div>

            {/* RIGHT FEATURES */}

            <div className="grid gap-4 sm:grid-cols-2">
              <FeatureBox
                number="AI"
                title="Guided Consultation"
                description="Organize symptoms and important health information before seeing a doctor."
              />

              <FeatureBox
                number="1"
                title="Patient Dashboard"
                description="Keep consultations, appointments, summaries, and healthcare information together."
              />

              <FeatureBox
                number="Care"
                title="Doctor Workflow"
                description="Healthcare teams can review organized patient information and update consultation status."
              />

              <FeatureBox
                number="24/7"
                title="Digital Access"
                description="Access your healthcare tools from a simple and responsive digital experience."
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================== */}

      <section
        id="how-it-works"
        className="bg-[#edf2f7] px-5 py-20 sm:px-6 lg:px-10 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              How it works
            </span>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              From symptoms to a more organized consultation.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-500">
              A simple workflow designed to connect patients with
              healthcare professionals more efficiently.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <WorkflowCard
              number="01"
              title="Start a consultation"
              description="Tell the assistant what you are experiencing and provide relevant health information."
            />

            <WorkflowCard
              number="02"
              title="Information is organized"
              description="The system organizes your consultation information into a clear summary for healthcare review."
            />

            <WorkflowCard
              number="03"
              title="Prepare for care"
              description="Review your information, connect with the appropriate department, and manage your appointment."
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          PATIENT CARE
      ========================================================== */}

      <section
        id="care"
        className="bg-white px-5 py-20 sm:px-6 lg:px-10 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* PATIENT */}

            <div className="rounded-[30px] border border-slate-200 bg-[#f7f9fc] p-7 sm:p-9">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-xl">
                ♡
              </div>

              <h3 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
                Designed for patients.
              </h3>

              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500 sm:text-base">
                Make your hospital experience easier by organizing
                information before your consultation and keeping your
                appointments and consultation history together.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <CheckItem text="Guided consultations" />

                <CheckItem text="AI-assisted summaries" />

                <CheckItem text="Appointment booking" />

                <CheckItem text="Consultation history" />

                <CheckItem text="Department guidance" />

                <CheckItem text="Patient dashboard" />
              </div>
            </div>

            {/* HEALTHCARE TEAM */}

            <div className="rounded-[30px] bg-slate-950 p-7 text-white sm:p-9">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl">
                +
              </div>

              <h3 className="mt-6 text-3xl font-bold tracking-tight">
                Designed for healthcare teams.
              </h3>

              <p className="mt-4 max-w-lg text-sm leading-7 text-white/60 sm:text-base">
                Give doctors a clearer starting point by organizing
                patient-provided information before the consultation.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <DarkCheckItem text="Patient information" />

                <DarkCheckItem text="Consultation summaries" />

                <DarkCheckItem text="Doctor review workflow" />

                <DarkCheckItem text="Consultation status" />

                <DarkCheckItem text="Appointment management" />

                <DarkCheckItem text="Department information" />
              </div>

              <button
                type="button"
                onClick={goRegister}
                className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              >
                Get started →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          ABOUT / TECHNOLOGY
      ========================================================== */}

      <section
        id="about"
        className="bg-[#edf2f7] px-5 py-20 sm:px-6 lg:px-10 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Our platform
            </span>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              One digital healthcare workflow.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-500">
              AI Hospital Assistant connects patients, consultations,
              appointments, and healthcare teams through a modern digital
              platform.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TechnologyCard
              icon="AI"
              title="AI Assistance"
              description="Helps organize patient-provided consultation information."
            />

            <TechnologyCard
              icon="API"
              title="Fast Backend"
              description="A structured API connects the patient and healthcare workflows."
            />

            <TechnologyCard
              icon="DB"
              title="Secure Data"
              description="Patient and consultation information is stored in the application database."
            />

            <TechnologyCard
              icon="WEB"
              title="Modern Web App"
              description="Responsive interfaces designed for patients and healthcare teams."
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          SAFETY
      ========================================================== */}

      <section className="bg-white px-5 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl rounded-[30px] border border-green-100 bg-green-50 p-7 text-center sm:p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-700">
            ✓
          </div>

          <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Supportive healthcare assistance
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            AI Hospital Assistant helps organize information and support
            conversations with healthcare professionals. It does not
            replace professional diagnosis, treatment, or emergency
            medical services.
          </p>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 px-5 py-20 text-center sm:px-6 lg:py-24">
        <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative">
          <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Take the next step in your healthcare journey.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
            Start a consultation, organize your information, and prepare
            for your next interaction with your healthcare team.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={goConsultation}
              className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-indigo-600 shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              Start Consultation →
            </button>

            <button
              type="button"
              onClick={goRegister}
              className="rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Create Account
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================== */}

      <footer className="bg-slate-950 px-5 py-12 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* BRAND */}

            <div className="sm:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold">
                  +
                </div>

                <div>
                  <p className="font-bold">carePath</p>

                  <p className="text-[10px] text-white/40">
                    AI Hospital Assistant
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-md text-sm leading-6 text-white/45">
                AI-assisted healthcare support designed to help patients
                organize information and healthcare teams review it more
                efficiently.
              </p>
            </div>

            {/* PRODUCT */}

            <div>
              <h4 className="text-sm font-semibold">Product</h4>

              <div className="mt-4 space-y-3 text-sm text-white/45">
                <a
                  href="#features"
                  className="block transition hover:text-white"
                >
                  Features
                </a>

                <a
                  href="#how-it-works"
                  className="block transition hover:text-white"
                >
                  How it works
                </a>

                <button
                  type="button"
                  onClick={goConsultation}
                  className="block transition hover:text-white"
                >
                  Consultation
                </button>

                <button
                  type="button"
                  onClick={goRegister}
                  className="block transition hover:text-white"
                >
                  Get started
                </button>
              </div>
            </div>

            {/* ACCOUNT */}

            <div>
              <h4 className="text-sm font-semibold">Account</h4>

              <div className="mt-4 space-y-3 text-sm text-white/45">
                <button
                  type="button"
                  onClick={goLogin}
                  className="block transition hover:text-white"
                >
                  Sign in
                </button>

                <button
                  type="button"
                  onClick={goRegister}
                  className="block transition hover:text-white"
                >
                  Register
                </button>

                <a
                  href="#about"
                  className="block transition hover:text-white"
                >
                  About
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/30">
            © {new Date().getFullYear()} AI Hospital Assistant. All
            rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}

/* =============================================================
   PORTAL ACTION
============================================================= */

function PortalAction({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-base">
        {icon}
      </div>

      <p className="mt-3 text-xs font-bold text-slate-900">{title}</p>

      <p className="mt-1 text-[10px] text-slate-400">{subtitle}</p>
    </button>
  );
}

/* =============================================================
   MINI FEATURE
============================================================= */

function MiniFeature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 p-5 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg">
        {icon}
      </div>

      <div>
        <p className="text-xs font-bold text-slate-900">{title}</p>

        <p className="mt-1 text-[10px] text-slate-400">{description}</p>
      </div>
    </div>
  );
}

/* =============================================================
   FEATURE BOX
============================================================= */

function FeatureBox({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-[10px] font-bold text-white">
        {number}
      </div>

      <h3 className="mt-6 text-xl font-bold tracking-tight text-slate-950">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =============================================================
   WORKFLOW CARD
============================================================= */

function WorkflowCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
        {number}
      </div>

      <h3 className="mt-7 text-xl font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =============================================================
   CHECK ITEM
============================================================= */

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 text-xs font-medium text-slate-600 shadow-sm">
      <span className="font-bold text-green-600">✓</span>

      <span>{text}</span>
    </div>
  );
}

/* =============================================================
   DARK CHECK ITEM
============================================================= */

function DarkCheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5 text-xs font-medium text-white/70">
      <span className="font-bold text-green-400">✓</span>

      <span>{text}</span>
    </div>
  );
}

/* =============================================================
   TECHNOLOGY CARD
============================================================= */

function TechnologyCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[25px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-[10px] font-bold text-white">
        {icon}
      </div>

      <h3 className="mt-5 font-bold text-slate-950">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}
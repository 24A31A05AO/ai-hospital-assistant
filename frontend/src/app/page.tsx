"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="brand">
            <Image
              src="/hourglass-heartbeat-logo.png"
              alt="carePath logo"
              width={54}
              height={54}
              className="brand-logo"
              priority
            />

            <div className="brand-text">
              <div className="brand-name">
                care<span>Path</span>
              </div>

              <div className="brand-subtitle">
                AI HOSPITAL ASSISTANT
              </div>
            </div>
          </Link>

          <nav className="nav-links">
            <Link href="/">Home</Link>
            <Link href="#features">Features</Link>
            <Link href="#how-it-works">How it works</Link>
            <Link href="#patient-care">Patient care</Link>
            <Link href="#about">About</Link>
          </nav>

          <div className="nav-actions">
            <Link href="/login" className="button button-outline">
              Sign in
            </Link>

            <Link href="/register" className="button button-primary">
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-label">
              AI-powered healthcare assistance
            </div>

            <h1 className="hero-title">
              Your healthcare journey,
              <br />
              made <span>simpler.</span>
            </h1>

            <p className="hero-description">
              Describe your symptoms, organize your health information,
              connect with the right department, and manage appointments
              through one simple digital healthcare assistant.
            </p>

            <div className="hero-buttons">
              <Link href="/start" className="button button-primary">
                Start Consultation →
              </Link>

              <Link href="/register" className="button button-outline">
                Create Account
              </Link>
            </div>

            <div className="hero-points">
              <div className="hero-point">
                <span>✓</span>
                Patient-friendly
              </div>

              <div className="hero-point">
                <span>✓</span>
                AI-assisted
              </div>

              <div className="hero-point">
                <span>✓</span>
                Doctor review
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <Image
              src="/hourglass-heartbeat-logo.png"
              alt="carePath healthcare logo"
              width={650}
              height={650}
              className="hero-logo-image"
              priority
            />
          </div>
        </div>
      </section>

      {/* Patient Portal Preview */}
      <section className="features" id="patient-portal">
        <div className="section-heading">
          <div className="section-label">Patient Portal</div>

          <h2>AI Hospital Assistant</h2>

          <p>
            Welcome back. Get assistance before your next hospital visit
            through one connected healthcare dashboard.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Consultation</h3>
            <p>AI-assisted guidance before your hospital visit.</p>
            <Link href="/consultation" className="button button-outline">
              Start Consultation
            </Link>
          </article>

          <article className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Appointment</h3>
            <p>Book an appointment with the appropriate doctor.</p>
            <Link
              href="/patient/appointments/book"
              className="button button-outline"
            >
              Book Appointment
            </Link>
          </article>

          <article className="feature-card">
            <div className="feature-icon">✓</div>
            <h3>Latest Consultation</h3>
            <p>
              <strong>Cold and sneezing</strong>
              <br />
              AI-assisted summary ready for healthcare review.
            </p>
            <span className="status-badge">Reviewed</span>
          </article>

          <article className="feature-card">
            <div className="feature-icon">👨‍⚕️</div>
            <h3>Care Team</h3>
            <p>
              Doctors can review organized patient information and update
              consultation status.
            </p>
            <span className="status-badge">Doctor review</span>
          </article>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon">✓</div>
            <h3>Consultation</h3>
            <p>Ready for doctor review.</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Consultation</h3>
            <p>AI-assisted healthcare support.</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Appointments</h3>
            <p>Easy appointment booking.</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">🏥</div>
            <h3>Departments</h3>
            <p>Better guidance for hospital visits.</p>
          </article>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features">
        <div className="section-heading">
          <div className="section-label">Digital Assistance</div>

          <h2>Access your healthcare tools whenever you need them.</h2>

          <p>
            AI Hospital Assistant brings consultation support, patient
            information, appointments, and doctor review into one connected
            healthcare workflow.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon">AI</div>
            <h3>Guided Consultation</h3>
            <p>
              Organize symptoms and important health information before seeing
              a doctor.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">1</div>
            <h3>Patient Dashboard</h3>
            <p>
              Keep consultations, appointments, summaries, and healthcare
              information together.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">Care</div>
            <h3>Doctor Workflow</h3>
            <p>
              Healthcare teams can review organized patient information and
              update consultation status.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">24/7</div>
            <h3>Digital Access</h3>
            <p>
              Access your healthcare tools from a simple and responsive digital
              experience.
            </p>
          </article>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works">
        <div className="section-heading">
          <div className="section-label">How it works</div>

          <h2>From symptoms to a more organized consultation.</h2>

          <p>
            A simple workflow designed to connect patients with healthcare
            professionals more efficiently.
          </p>
        </div>

        <div className="steps">
          <article className="step">
            <div className="step-number">01</div>
            <h3>Start a consultation</h3>
            <p>
              Tell the assistant what you are experiencing and provide
              relevant health information.
            </p>
          </article>

          <article className="step">
            <div className="step-number">02</div>
            <h3>Information is organized</h3>
            <p>
              The system organizes your consultation information into a clear
              summary for healthcare review.
            </p>
          </article>

          <article className="step">
            <div className="step-number">03</div>
            <h3>Prepare for care</h3>
            <p>
              Review your information, connect with the appropriate department,
              and manage your appointment.
            </p>
          </article>
        </div>
      </section>

      {/* Patient Care */}
      <section id="patient-care" className="features">
        <div className="section-heading">
          <div className="section-label">Designed for patients</div>

          <h2>Make your hospital experience easier.</h2>

          <p>
            Organize information before your consultation and keep your
            appointments and consultation history together.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <h3>Patient-friendly tools</h3>
            <p>Simple digital tools designed around patient needs.</p>
          </article>

          <article className="feature-card">
            <h3>Guided consultations</h3>
            <p>Provide symptoms and relevant health information step by step.</p>
          </article>

          <article className="feature-card">
            <h3>AI-assisted summaries</h3>
            <p>Organize patient-provided information for healthcare review.</p>
          </article>

          <article className="feature-card">
            <h3>Appointment booking</h3>
            <p>Manage appointments through one connected platform.</p>
          </article>

          <article className="feature-card">
            <h3>Consultation history</h3>
            <p>Keep previous consultation information accessible.</p>
          </article>

          <article className="feature-card">
            <h3>Department guidance</h3>
            <p>Support patients in understanding the appropriate hospital department.</p>
          </article>
        </div>
      </section>

      {/* Healthcare Teams */}
      <section className="features">
        <div className="section-heading">
          <div className="section-label">Designed for healthcare teams</div>

          <h2>Give doctors a clearer starting point.</h2>

          <p>
            Organize patient-provided information before the consultation so
            healthcare teams can review it more efficiently.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <h3>Patient information</h3>
            <p>Access organized patient details and submitted information.</p>
          </article>

          <article className="feature-card">
            <h3>Consultation summaries</h3>
            <p>Review structured information before meeting the patient.</p>
          </article>

          <article className="feature-card">
            <h3>Doctor review workflow</h3>
            <p>Review patient information and update consultation status.</p>
          </article>

          <article className="feature-card">
            <h3>Consultation status</h3>
            <p>Track whether consultations are pending, reviewed, or completed.</p>
          </article>

          <article className="feature-card">
            <h3>Appointment management</h3>
            <p>Connect patient consultation preparation with appointments.</p>
          </article>

          <article className="feature-card">
            <h3>Department information</h3>
            <p>Keep relevant department information connected to the workflow.</p>
          </article>
        </div>

        <div className="hero-buttons">
          <Link href="/register" className="button button-primary">
            Get started →
          </Link>
        </div>
      </section>

      {/* About the Platform */}
      <section id="about" className="features">
        <div className="section-heading">
          <div className="section-label">Our platform</div>

          <h2>One digital healthcare workflow.</h2>

          <p>
            AI Hospital Assistant connects patients, consultations,
            appointments, and healthcare teams through a modern digital
            platform.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon">AI</div>
            <h3>AI Assistance</h3>
            <p>
              Helps organize patient-provided consultation information.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">API</div>
            <h3>Fast Backend</h3>
            <p>
              A structured API connects patient and healthcare workflows.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">DB</div>
            <h3>Secure Data</h3>
            <p>
              Patient and consultation information is stored in the application
              database.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">WEB</div>
            <h3>Modern Web App</h3>
            <p>
              Responsive interfaces designed for patients and healthcare teams.
            </p>
          </article>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="features">
        <div className="section-heading">
          <div className="section-label">Supportive healthcare assistance</div>

          <h2>Designed to support—not replace—healthcare professionals.</h2>

          <p>
            AI Hospital Assistant helps organize information and support
            conversations with healthcare professionals. It does not replace
            professional diagnosis, treatment, prescriptions, or emergency
            medical services.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <Link href="/" className="brand">
            <Image
              src="/hourglass-heartbeat-logo.png"
              alt="carePath logo"
              width={54}
              height={54}
              className="brand-logo"
            />

            <div className="brand-text">
              <div className="brand-name">
                care<span>Path</span>
              </div>

              <div className="brand-subtitle">
                AI HOSPITAL ASSISTANT
              </div>
              <p> AI-assisted healthcare support designed to help patients 
                organize information and healthcare teams review it more efficiently.</p>
            </div>
          </Link>

          <div className="footer-links">
            <Link href="#features">Features</Link>
            <Link href="#how-it-works">How it works</Link>
            <Link href="#patient-care">Patient care</Link>
            <Link href="#about">About</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/register">Register</Link>
          </div>
        </div>

        <div className="footer-copy">
          © {new Date().getFullYear()} AI Hospital Assistant. All rights
          reserved.
        </div>
      </footer>
    </main>
  );
}
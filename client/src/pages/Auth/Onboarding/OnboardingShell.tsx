import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { Link } from "wouter";

export type OnboardingStep = { label: string; title: string; description: string };

export function OnboardingShell({
  role,
  steps,
  step,
  children,
  onBack,
  onContinue,
  continueLabel = "Continue",
}: {
  role: "Advertiser" | "Community Owner";
  steps: OnboardingStep[];
  step: number;
  children: React.ReactNode;
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
}) {
  return (
    <div className="onboarding-page" style={{ width: "100%", minHeight: "100vh", boxSizing: "border-box" }}>
      <header className="onboarding-header" style={{ maxWidth: "none", width: "100%", padding: "24px 48px" }}>
        <Link href="/" className="public-brand">
          <span className="public-brand-mark">
            <i />
            <i />
            <i />
          </span>
          relay
        </Link>
        <span className="onboarding-role">
          <Sparkles size={14} /> {role} setup
        </span>
      </header>

      <main
        className="onboarding-main"
        style={{
          display: "flex",
          gap: "64px",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "1400px",
          width: "100%",
          margin: "0 auto",
          padding: "40px 48px",
          boxSizing: "border-box",
        }}
      >
        {/* LEFT COLUMN: Wording & Progress */}
        <div
          className="onboarding-left-panel"
          style={{
            flex: "1 1 50%",
            maxWidth: "600px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div className="onboarding-intro" style={{ textAlign: "left", marginBottom: "40px" }}>
            <span className="public-eyebrow public-eyebrow-dark">
              <span /> Set up your workspace
            </span>
            <h1 style={{ textAlign: "left", fontSize: "3.25rem", lineHeight: "1.1", margin: "16px 0" }}>
              Make the marketplace<br />
              <em>work for you.</em>
            </h1>
            <p style={{ textAlign: "left", fontSize: "1.1rem", color: "#6b7280", margin: 0 }}>
              A few details help us tailor your {role.toLowerCase()} workspace. You can update these later.
            </p>
          </div>

          <div
            className="onboarding-progress"
            aria-label="Onboarding progress"
            style={{ width: "100%", justifyContent: "flex-start", gap: "32px" }}
          >
            {steps.map((item, index) => (
              <div
                className={`onboarding-progress-step ${index < step ? "is-complete" : ""} ${
                  index === step ? "is-current" : ""
                }`}
                key={item.label}
              >
                <span>{index < step ? <Check size={13} /> : index + 1}</span>
                <small>{item.label}</small>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Card Container */}
        <div className="onboarding-right-panel" style={{ flex: "1 1 50%", width: "100%" }}>
          <section className="onboarding-card" style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
            <div className="onboarding-card-heading">
              <div>
                <span className="onboarding-step-kicker">
                  Step {step + 1} of {steps.length}
                </span>
                <h2>{steps[step].title}</h2>
                <p>{steps[step].description}</p>
              </div>
              <span className="onboarding-step-number">0{step + 1}</span>
            </div>

            {children}

            <div className="onboarding-actions">
              <button type="button" className="onboarding-back" onClick={onBack} disabled={step === 0}>
                <ArrowLeft size={15} /> Back
              </button>
              <button type="button" className="onboarding-continue" onClick={onContinue}>
                {continueLabel}{" "}
                {step === steps.length - 1 ? <Check size={15} /> : <ArrowRight size={15} />}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="onboarding-review-row">
      <span>{label}</span>
      <strong>{value || "Not provided"}</strong>
    </div>
  );
}
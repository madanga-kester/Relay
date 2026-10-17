import { ArrowLeft, ArrowRight, BriefcaseBusiness, Eye, EyeOff, Loader2, UsersRound } from "lucide-react";
import { FormEvent } from "react";
import { Link } from "wouter";
import { PasswordRules } from "./PasswordRules";
import type { PasswordRule } from "./PasswordRules";
import type { RegisterForm, Role } from "./types";

type DetailsStepProps = {
  role: Role;
  form: RegisterForm;
  onFieldChange: (key: keyof RegisterForm, value: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  passwordRules: PasswordRule[];
  allPasswordRulesMet: boolean;
  acceptedTerms: boolean;
  onAcceptedTermsChange: (accepted: boolean) => void;
  error: string;
  submitting: boolean;
  onBack: () => void;
  onSubmit: (event: FormEvent) => void;
};

export function DetailsStep({
  role,
  form,
  onFieldChange,
  showPassword,
  onToggleShowPassword,
  passwordRules,
  allPasswordRulesMet,
  acceptedTerms,
  onAcceptedTermsChange,
  error,
  submitting,
  onBack,
  onSubmit,
}: DetailsStepProps) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: "#6b7280",
          cursor: "pointer",
          fontSize: 14,
          padding: 0,
          marginBottom: 16,
          fontWeight: 500,
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <span className="public-eyebrow public-eyebrow-dark"><span /> Step 2 of 2</span>
      <h2>Enter your details</h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderRadius: "8px",
          backgroundColor: role === "community-owner" ? "#f3e8ff" : "#e0f2fe",
          border: `1px solid ${role === "community-owner" ? "#d8b4fe" : "#bae6fd"}`,
          marginBottom: "20px",
          fontSize: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {role === "community-owner" ? <UsersRound size={18} color="#7e22ce" /> : <BriefcaseBusiness size={18} color="#0369a1" />}
          <span style={{ color: role === "community-owner" ? "#6b21a8" : "#0c4a6e", fontWeight: 500 }}>
            Registering as: <strong>{role === "community-owner" ? "Community Owner" : "Campaign Owner"}</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: role === "community-owner" ? "#7e22ce" : "#0369a1",
            fontWeight: 600,
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          Change role
        </button>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        <label>
          Full name
          <div className="auth-input">
            <input
              value={form.name}
              onChange={event => onFieldChange("name", event.target.value)}
              placeholder="Your full name"
            />
          </div>
        </label>

        <label>
          Email address
          <div className="auth-input">
            <input
              type="email"
              value={form.email}
              onChange={event => onFieldChange("email", event.target.value)}
              placeholder="you@company.com"
            />
          </div>
        </label>

        <div className="auth-input-grid">
          <label>
            Password
            <div className="auth-input">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={event => onFieldChange("password", event.target.value)}
                placeholder="At least 12 characters"
                aria-describedby="password-rules"
              />
              <button
                type="button"
                aria-label="Toggle password visibility"
                onClick={onToggleShowPassword}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </label>

          <label>
            Confirm password
            <div className="auth-input">
              <input
                type={showPassword ? "text" : "password"}
                value={form.confirm}
                onChange={event => onFieldChange("confirm", event.target.value)}
                placeholder="Repeat password"
              />
            </div>
          </label>
        </div>

        <PasswordRules rules={passwordRules} allMet={allPasswordRulesMet} />

        <label className="auth-legal-consent">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={event => onAcceptedTermsChange(event.target.checked)}
          />
          <span>I agree to the <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>.</span>
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button
          className="auth-submit"
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          style={submitting ? { opacity: 0.85, cursor: "not-allowed" } : undefined}
        >
          {submitting ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : <>Create Account <ArrowRight size={16} /></>}
        </button>

        <p className="auth-switch">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </form>
    </>
  );
}
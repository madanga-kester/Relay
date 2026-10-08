import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, Eye, EyeOff, Megaphone, UsersRound } from "lucide-react";
import { CSSProperties, FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { registerRelayAccount, relayBackendEnabled } from "@/lib/relayApi";

type Role = "advertiser" | "community-owner";

const srOnlyStyle: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const SPLIT_LAYOUT_QUERY = "(min-width: 901px)";
const splitContainerStyle: CSSProperties = { height: "100dvh", overflow: "hidden" };
const splitPanelStyle: CSSProperties = { height: "100%", minHeight: 0, overflowY: "auto" };

export default function RegisterPage() {
  const [location, setLocation] = useLocation();
  const queryRole = new URLSearchParams(location.split("?")[1] ?? "").get("role");
  const initialRole: Role = queryRole === "community" || queryRole === "community-owner" ? "community-owner" : "advertiser";

  const [role, setRole] = useState<Role>(initialRole);
  const [step, setStep] = useState<"role" | "details">("role");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));

  const [splitLayout, setSplitLayout] = useState(() => typeof window !== "undefined" && window.matchMedia(SPLIT_LAYOUT_QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(SPLIT_LAYOUT_QUERY);
    const sync = () => setSplitLayout(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const passwordRules = [
    { id: "length", label: "At least 12 characters", met: form.password.length >= 12 },
    { id: "uppercase", label: "One uppercase letter (A-Z)", met: /[A-Z]/.test(form.password) },
    { id: "lowercase", label: "One lowercase letter (a-z)", met: /[a-z]/.test(form.password) },
    { id: "number", label: "One number (0-9)", met: /[0-9]/.test(form.password) },
    { id: "symbol", label: "One symbol (for example ! @ # $ %)", met: /[!-\/:-@\[-`{-~]/.test(form.password) },
    { id: "match", label: "Passwords match", met: form.confirm.length > 0 && form.password === form.confirm },
  ];

  const allPasswordRulesMet = passwordRules.every(rule => rule.met);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!acceptedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }

    if (form.name.trim().length < 2 || !form.email.includes("@") || !allPasswordRulesMet) {
      setError(form.password !== form.confirm ? "Passwords do not match." : "Use a valid email and a password that meets every listed requirement.");
      return;
    }

    if (relayBackendEnabled()) {
      try {
        await registerRelayAccount({
          email: form.email,
          displayName: form.name,
          password: form.password,
          role: role === "community-owner" ? "CommunityOwner" : "Advertiser",
        });
      } catch {
        setError("Relay could not create this account. Check the details and try again.");
        return;
      }
    }

    sessionStorage.setItem("relay_signup_role", role);
    sessionStorage.setItem("relay_signup_email", form.email);
    sessionStorage.setItem("relay_signup_name", form.name);
    setLocation("/verify-email");
  };

  return (
    <div className="auth-page auth-register-page" style={splitLayout ? splitContainerStyle : undefined}>
      <div className="auth-brand-panel" style={splitLayout ? splitPanelStyle : undefined}>
        <Link href="/" className="public-brand"><span className="public-brand-mark"><i /><i /><i /></span>relay</Link>
        <div className="auth-brand-copy">
          <span className="public-eyebrow"><span /> Start with the right role</span>
          <h1>Build reach.<br /><em>Build revenue.</em></h1>
          <p>Choose how you want to participate in the marketplace. You can explore the other side anytime.</p>
          <div className="auth-brand-detail">
            <span><Megaphone size={15} /> Campaigns that find their audience</span>
            <span><UsersRound size={15} /> Communities that earn transparently</span>
          </div>
        </div>
      </div>

      <main className="auth-form-panel" style={splitLayout ? splitPanelStyle : undefined}>
        <div className="auth-form-wrap auth-register-wrap">

          {/* STEP 1: ROLE SELECTION */}
          {step === "role" && (
            <>
              <span className="public-eyebrow public-eyebrow-dark"><span /> Step 1 of 2</span>
              <h2>Join the marketplace.</h2>
              <p>Select your primary role to get started.</p>

              <div className="role-picker">
                <button
                  type="button"
                  className={role === "advertiser" ? "role-card role-card-selected" : "role-card"}
                  onClick={() => setRole("advertiser")}
                >
                  <span><BriefcaseBusiness size={18} /></span>
                  <strong>Campaign Owner (Advertiser)</strong>
                  <small>Create campaigns and reach relevant communities.</small>
                  {role === "advertiser" && <Check size={15} />}
                </button>

                <button
                  type="button"
                  className={role === "community-owner" ? "role-card role-card-selected role-card-lilac" : "role-card"}
                  onClick={() => setRole("community-owner")}
                >
                  <span><UsersRound size={18} /></span>
                  <strong>Community Owner</strong>
                  <small>Monetize your community through relevant advertising.</small>
                  {role === "community-owner" && <Check size={15} />}
                </button>
              </div>

              <button
                type="button"
                className="auth-submit"
                onClick={() => setStep("details")}
                style={{ marginTop: 20 }}
              >
                Continue <ArrowRight size={16} />  
              </button>

              <p className="auth-switch" style={{ marginTop: 16 }}>
                Already have an account? <Link href="/login">Sign in</Link>
              </p>
            </>
          )}

          {/* STEP 2: USER DETAILS INPUT */}
          {step === "details" && (
            <>
              <button
                type="button"
                onClick={() => setStep("role")}
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
                
              </button>

              <span className="public-eyebrow public-eyebrow-dark"><span /> Step 2 of 2</span>
              <h2>Enter your details</h2>

              {/* ROLE NOTICE BANNER */}
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
                  onClick={() => setStep("role")}
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

              <form className="auth-form" onSubmit={submit}>
                <label>
                  Full name
                  <div className="auth-input">
                    <input
                      value={form.name}
                      onChange={event => update("name", event.target.value)}
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
                      onChange={event => update("email", event.target.value)}
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
                        onChange={event => update("password", event.target.value)}
                        placeholder="At least 12 characters"
                        aria-describedby="password-rules"
                      />
                      <button
                        type="button"
                        aria-label="Toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
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
                        onChange={event => update("confirm", event.target.value)}
                        placeholder="Repeat password"
                      />
                    </div>
                  </label>
                </div>

                <ul
                  id="password-rules"
                  aria-live="polite"
                  style={{ listStyle: "none", margin: "0 0 14px", padding: 0, display: "grid", gap: 6, fontSize: 13 }}
                >
                  {passwordRules.map(rule => (
                    <li key={rule.id} style={{ display: "flex", alignItems: "center", gap: 8, color: rule.met ? "#16a34a" : "#6b7280" }}>
                      <span
                        aria-hidden="true"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          border: rule.met ? "1px solid #16a34a" : "1px solid #9ca3af",
                          background: rule.met ? "#16a34a" : "transparent",
                          color: "#ffffff",
                        }}
                      >
                        {rule.met && <Check size={10} />}
                      </span>
                      <span>{rule.label}</span>
                      <span style={srOnlyStyle}>{rule.met ? "requirement met" : "requirement not met"}</span>
                    </li>
                  ))}
                  {allPasswordRulesMet && (
                    <li style={{ color: "#16a34a", fontWeight: 600 }}>All password requirements met.</li>
                  )}
                </ul>

                <label className="auth-legal-consent">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={event => setAcceptedTerms(event.target.checked)}
                  />
                  <span>I agree to the <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>.</span>
                </label>

                {error && <p className="auth-error">{error}</p>}

                <button className="auth-submit" type="submit">
                  Create Account <ArrowRight size={16} />
                </button>

                <p className="auth-switch">
                  Already have an account? <Link href="/login">Sign in</Link>
                </p>
              </form>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
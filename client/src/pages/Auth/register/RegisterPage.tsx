import { Megaphone, UsersRound } from "lucide-react";
import { CSSProperties, FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { registerRelayAccount, relayBackendEnabled } from "@/lib/relayApi";
import { getPasswordRules } from "./PasswordRules";

import { RoleStep } from "./RoleStep";
import type { RegisterForm, Role } from "./types";
import { DetailsStep } from "./DetailsStep";
import { getRegisterErrorMessage, isValidEmail } from "./registerHelpers";
const SPLIT_LAYOUT_QUERY = "(min-width: 901px)";
const splitContainerStyle: CSSProperties = { height: "100dvh", overflow: "hidden" };
const splitPanelStyle: CSSProperties = { height: "100%", minHeight: 0, overflowY: "auto" };



export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const queryRole = new URLSearchParams(search).get("role");
  const initialRole: Role = queryRole === "community" || queryRole === "community-owner" ? "community-owner" : "advertiser";

  const [role, setRole] = useState<Role>(initialRole);
  const [step, setStep] = useState<"role" | "details">("role");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<RegisterForm>({ name: "", email: "", password: "", confirm: "" });

  const update = (key: keyof RegisterForm, value: string) => setForm(current => ({ ...current, [key]: value }));

  const [splitLayout, setSplitLayout] = useState(() => typeof window !== "undefined" && window.matchMedia(SPLIT_LAYOUT_QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(SPLIT_LAYOUT_QUERY);
    const sync = () => setSplitLayout(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const passwordRules = useMemo(
    () => getPasswordRules(form.password, form.confirm),
    [form.password, form.confirm]
  );

  const allPasswordRulesMet = passwordRules.every(rule => rule.met);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError("");

    if (!acceptedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }

    const displayName = form.name.trim();
    const email = form.email.trim();

    if (displayName.length < 2) {
      setError("Enter your full name.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!allPasswordRulesMet) {
      setError(form.password !== form.confirm ? "Passwords do not match." : "Your password must meet every listed requirement.");
      return;
    }

    if (relayBackendEnabled()) {
      try {
        setSubmitting(true);
        await registerRelayAccount({
          email,
          displayName,
          password: form.password,
          role: role === "community-owner" ? "CommunityOwner" : "Advertiser",
        });
      } catch (caught) {
        setSubmitting(false);
        setError(getRegisterErrorMessage(caught));
        return;
      }
    }

    sessionStorage.setItem("relay_signup_role", role);
    sessionStorage.setItem("relay_signup_email", email);
    sessionStorage.setItem("relay_signup_name", displayName);
    setLocation("/verify-email");
  };

  const isRoleStep = step === "role";

  return (
    <div 
      className="auth-page auth-register-page" 
      style={
        isRoleStep 
          ? { height: "100dvh", width: "100vw", overflowY: "auto", display: "flex", justifyContent: "center", alignItems: "center" }
          : (splitLayout ? splitContainerStyle : undefined)
      }
    >
      {/* Brand panel is hidden during step 1 */}
      {!isRoleStep && (
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
      )}

      <main 
        className="auth-form-panel" 
        style={
          isRoleStep
            ? { width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", overflowY: "auto" }
            : (splitLayout ? splitPanelStyle : undefined)
        }
      >
        <div 
          className="auth-form-wrap auth-register-wrap"
          style={isRoleStep ? { width: "100%", maxWidth: "900px", minHeight: "65vh", padding: "60px 50px", display: "flex", flexDirection: "column", justifyContent: "center", margin: "auto" } : undefined}
        >

          {/* STEP 1: ROLE SELECTION */}
          {step === "role" && (
            <RoleStep role={role} onRoleChange={setRole} onContinue={() => setStep("details")} />
          )}

          {/* STEP 2: USER DETAILS INPUT */}
          {step === "details" && (
            <DetailsStep
              role={role}
              form={form}
              onFieldChange={update}
              showPassword={showPassword}
              onToggleShowPassword={() => setShowPassword(current => !current)}
              passwordRules={passwordRules}
              allPasswordRulesMet={allPasswordRulesMet}
              acceptedTerms={acceptedTerms}
              onAcceptedTermsChange={setAcceptedTerms}
              error={error}
              submitting={submitting}
              onBack={() => setStep("role")}
              onSubmit={submit}
            />
          )}

        </div>
      </main>
    </div>
  );
}
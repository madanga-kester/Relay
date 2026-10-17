import { ArrowLeft, Check, Loader2, Mail, RefreshCw } from "lucide-react";
import { CSSProperties, FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import AuthFlowShell from "./AuthFlowShell";
import { RelayApiError, relayBackendEnabled, resendRelayVerification, verifyRelayEmail } from "@/lib/relayApi";

const resendButtonStyle: CSSProperties = {
  background: "transparent",
  color: "inherit",
  border: "1px solid currentColor",
  boxShadow: "none",
  marginTop: 12,
};

function getFailureMessage(caught: unknown, fallback: string) {
  if (caught instanceof RelayApiError && caught.status === 429) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  return fallback;
}

export default function VerifyEmailPage() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState("");
  const [count, setCount] = useState(30);
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const storedEmail = sessionStorage.getItem("relay_signup_email");
  const email = storedEmail ?? "";
  const counting = count > 0;

  useEffect(() => {
    if (!storedEmail) setLocation("/register");
  }, [storedEmail, setLocation]);

  useEffect(() => {
    if (!counting) return;
    const timer = window.setInterval(() => setCount(value => Math.max(value - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, [counting]);

  const verify = async (event: FormEvent) => {
    event.preventDefault();
    if (verifying) return;
    if (code.replace(/\D/g, "").length < 6) {
      setNotice({ text: "Enter the 6-digit verification code.", error: true });
      return;
    }
    if (relayBackendEnabled()) {
      try {
        setVerifying(true);
        await verifyRelayEmail(email, code);
      } catch (caught) {
        setVerifying(false);
        setNotice({ text: getFailureMessage(caught, "That code is invalid or expired. Check it or resend a new one."), error: true });
        return;
      }
    }
    sessionStorage.setItem("relay_email_verified", "true");
    setLocation("/email-verified");
  };

  const resend = async () => {
    if (counting || resending) return;
    if (relayBackendEnabled()) {
      try {
        setResending(true);
        await resendRelayVerification(email);
      } catch (caught) {
        setResending(false);
        setNotice({ text: getFailureMessage(caught, "Could not resend the code. Try again shortly."), error: true });
        return;
      }
      setResending(false);
    }
    setNotice({ text: "Code resent", error: false });
    setCount(30);
  };

  if (!storedEmail) return null;

  return (
    <AuthFlowShell eyebrow="Almost there" title="Verify your email" text="We've sent a verification code to your email address.">
      <div className="auth-email-callout">
        <Mail size={17} />
        <strong>{email}</strong>
      </div>
      <form className="auth-form" onSubmit={verify} noValidate>
        <label className="otp-label">
          Verification code
          <div className="otp-input">
            <input
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={event => setCode(event.target.value.replace(/\D/g, ""))}
              placeholder="_ _ _ _ _ _"
            />
          </div>
        </label>
        {notice && (
          notice.error ? (
            <p className="auth-error" role="alert">{notice.text}</p>
          ) : (
            <p className="auth-inline-notice" role="status">
              <Check size={14} />
              {notice.text}
            </p>
          )
        )}
        <button
          className="auth-submit"
          type="submit"
          disabled={verifying}
          aria-busy={verifying}
          style={verifying ? { opacity: 0.85, cursor: "not-allowed" } : undefined}
        >
          {verifying ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : "Verify Email"}
        </button>
      </form>
      <button
        type="button"
        className="auth-submit"
        disabled={counting || resending}
        aria-busy={resending}
        onClick={resend}
        style={counting || resending ? { ...resendButtonStyle, opacity: 0.6, cursor: "not-allowed" } : resendButtonStyle}
      >
        {resending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} {counting ? `Resend in ${count}s` : "Resend Code"}
      </button>
      <div className="auth-secondary-row">
        <Link href={`/register?role=${sessionStorage.getItem("relay_signup_role") ?? "advertiser"}`} className="auth-forgot">
          <ArrowLeft size={13} /> Change email
        </Link>
      </div>
    </AuthFlowShell>
  );
}
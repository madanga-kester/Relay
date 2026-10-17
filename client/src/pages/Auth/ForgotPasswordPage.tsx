import { ArrowLeft, ArrowRight, Loader2, Mail } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import AuthFlowShell from "./AuthFlowShell";
import { RelayApiError, relayBackendEnabled, requestRelayPasswordReset } from "@/lib/relayApi";
import { isValidEmail } from "@/pages/Auth/register/registerHelpers";
export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [count, setCount] = useState(0);
  const counting = count > 0;

  useEffect(() => {
    if (!counting) return;
    const timer = window.setInterval(() => setCount(value => Math.max(value - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, [counting]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting || counting) return;
    setError("");
    const trimmed = email.trim();

    if (!isValidEmail(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }

    if (relayBackendEnabled()) {
      try {
        setSubmitting(true);
        await requestRelayPasswordReset(trimmed);
      } catch (caught) {
        setSubmitting(false);
        setError(
          caught instanceof RelayApiError && caught.status === 429
            ? "Too many attempts. Please wait a moment and try again."
            : "We could not start password recovery. Check the email and try again."
        );
        return;
      }
      setSubmitting(false);
    }

    sessionStorage.setItem("relay_reset_email", trimmed);
    if (relayBackendEnabled()) {
      setSent(true);
      setCount(60);
      return;
    }
    setLocation("/reset-password/verify");
  };

  return (
    <AuthFlowShell eyebrow="Account recovery" title="Forgot your password?" text="Enter your email address and we'll guide you through resetting your password.">
      <form className="auth-form" onSubmit={submit} noValidate>
        <label>
          Email address
          <div className="auth-input">
            <Mail size={16} />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="you@company.com"
            />
          </div>
        </label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {sent && <p className="auth-inline-notice" role="status">If an account exists for that email, a reset link has been sent. The link expires in 30 minutes.</p>}
        <button
          className="auth-submit"
          type="submit"
          disabled={submitting || counting}
          aria-busy={submitting}
          style={submitting || counting ? { opacity: 0.85, cursor: "not-allowed" } : undefined}
        >
          {submitting ? (
            <><Loader2 size={16} className="animate-spin" /> Sending...</>
          ) : counting ? (
            `Resend in ${count}s`
          ) : sent ? (
            <>Resend link <ArrowRight size={16} /></>
          ) : (
            <>Continue <ArrowRight size={16} /></>
          )}
        </button>
        <Link href="/login" className="auth-centered-link"><ArrowLeft size={13} /> Back to Sign In</Link>
      </form>
    </AuthFlowShell>
  );
}

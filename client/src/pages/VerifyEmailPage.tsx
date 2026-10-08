import { ArrowLeft, ArrowRight, Check, Mail, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import AuthFlowShell from "./AuthFlowShell";
import { relayBackendEnabled, resendRelayVerification, verifyRelayEmail } from "@/lib/relayApi";

export default function VerifyEmailPage() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState("");
  const [count, setCount] = useState(0);
  const [notice, setNotice] = useState("");
  const email = sessionStorage.getItem("relay_signup_email") ?? "your email address";

  useEffect(() => {
    if (!count) return;
    const timer = window.setInterval(() => setCount(value => Math.max(value - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, [count]);

  const verify = async () => {
    if (code.replace(/\D/g, "").length < 6) {
      setNotice("Enter the 6-digit verification code.");
      return;
    }
    if (relayBackendEnabled()) {
      try {
        await verifyRelayEmail(email, code);
      } catch {
        setNotice("That code is invalid or expired. Check it or resend a new one.");
        return;
      }
    }
    setLocation("/email-verified");
  };

  const resend = async () => {
    if (count) return;
    if (relayBackendEnabled()) {
      try {
        await resendRelayVerification(email);
      } catch {
        setNotice("Could not resend the code. Try again shortly.");
        return;
      }
    }
    setNotice("Code resent");
    setCount(30);
  };

  return (
    <AuthFlowShell eyebrow="Almost there" title="Verify your email" text="We've sent a verification code to your email address.">
      <div className="auth-email-callout">
        <Mail size={17} />
        <strong>{email}</strong>
      </div>
      <label className="otp-label">
        Verification code
        <div className="otp-input">
          <input
            autoFocus
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={event => setCode(event.target.value.replace(/\D/g, ""))}
            placeholder="_ _ _ _ _ _"
          />
        </div>
      </label>
      {notice && (
        <p className="auth-inline-notice">
          <Check size={14} />
          {notice}
        </p>
      )}
      <button className="auth-submit" type="button" onClick={verify}>
        Verify Email 
      </button>
      <div className="auth-secondary-row">
        <button type="button" className="auth-forgot" disabled={!!count} onClick={resend}>
          <RefreshCw size={13} /> {count ? `Resend in ${count}s` : "Resend Code"}
        </button>
        <Link href={`/register?role=${sessionStorage.getItem("relay_signup_role") ?? "advertiser"}`} className="auth-forgot">
          <ArrowLeft size={13} /> Change email
        </Link>
      </div>
    </AuthFlowShell>
  );
}
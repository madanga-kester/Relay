import { ArrowRight, Check } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { relayBackendEnabled } from "@/lib/relayApi";
import AuthFlowShell from "./AuthFlowShell";
export default function EmailVerifiedPage() {
  const [, setLocation] = useLocation();
  const verified = sessionStorage.getItem("relay_email_verified") === "true";

  useEffect(() => {
    if (!verified) setLocation("/register");
  }, [verified, setLocation]);

  const backendEnabled = relayBackendEnabled();
  const signupRole = sessionStorage.getItem("relay_signup_role");
  const nextHref = backendEnabled
    ? "/login"
    : signupRole === "community-owner"
      ? "/onboarding/community-owner"
      : "/onboarding/advertiser";

  if (!verified) return null;

  return (
    <AuthFlowShell eyebrow="Verified" title="Email verified" text="Your email has been verified successfully.">
      <div className="auth-success auth-success-large">
        <span className="auth-success-icon"><Check size={21} /></span>
        <span>
          <strong>You're ready to continue.</strong>
          <small>{backendEnabled ? "Sign in with your new account to finish setting up." : "Continue to set up your account."}</small>
        </span>
      </div>
      <Link className="auth-submit auth-submit-link" href={nextHref}>
        {backendEnabled ? "Continue to sign in" : "Continue to setup"} <ArrowRight size={16} />
      </Link>
    </AuthFlowShell>
  );
}

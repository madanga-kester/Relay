import { ArrowRight, Check } from "lucide-react";
import { Link } from "wouter";
import AuthFlowShell from "./AuthFlowShell";
export default function EmailVerifiedPage() { return <AuthFlowShell eyebrow="Verified" title="Email verified" text="Your email has been verified successfully."><div className="auth-success auth-success-large"><span className="auth-success-icon"><Check size={21} /></span><span><strong>You're ready to continue.</strong><small>This frontend demo is ready to take you to sign in.</small></span></div><Link className="auth-submit auth-submit-link" href={sessionStorage.getItem("relay_signup_role") === "community-owner" ? "/onboarding/community-owner" : "/onboarding/advertiser"}>Continue to setup <ArrowRight size={16} /></Link></AuthFlowShell>; }

import { ArrowRight, Check } from "lucide-react";
import { Link } from "wouter";
import AuthFlowShell from "./AuthFlowShell";
export default function PasswordResetSuccessPage() { return <AuthFlowShell eyebrow="All set" title="Password reset successful" text="Your password has been updated."><div className="auth-success auth-success-large"><span className="auth-success-icon"><Check size={21} /></span><span><strong>Your new password is ready.</strong><small>Continue to sign in to the marketplace.</small></span></div><Link className="auth-submit auth-submit-link" href="/login?reset=1">Back to Sign In <ArrowRight size={16} /></Link></AuthFlowShell>; }

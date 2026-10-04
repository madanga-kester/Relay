import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { Link } from "wouter";
import "./admin.css";

export default function AdminForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) { setError("Enter your Admin email address."); setSent(false); return; }
    if (!email.includes("@")) { setError("Enter a valid email address."); setSent(false); return; }
    setError("");
    setSent(true);
  };
  return <main className="admin-react-login admin-react-recovery"><section className="admin-react-login-brand"><Link href="/admin" className="admin-react-login-back"><ArrowLeft size={15} /> Back to Admin sign in</Link><div className="admin-react-brand"><span className="public-brand-mark admin-react-brand-mark"><i /><i /><i /></span><span>relay</span><small>ADMIN CONSOLE</small></div><div className="admin-react-login-copy"><span className="admin-react-eyebrow">Account recovery</span><h1>Keep access<br />in your hands.</h1><p>Use the Admin email associated with the demo operations workspace to request a frontend-only recovery link.</p></div><footer>Independent admin portal · Frontend prototype</footer></section><section className="admin-react-login-form"><div><span className="admin-react-eyebrow">Admin access</span><h2>Forgot password?</h2><p>Enter your Admin email and we’ll show the recovery confirmation here.</p>{sent ? <div className="admin-react-recovery-success"><CheckCircle2 size={19} /><div><strong>Recovery request received</strong><small>This frontend demo does not send email, but the request was accepted.</small></div></div> : <form onSubmit={submit} noValidate><label>Email address<div className={`admin-react-login-input-wrap${error ? " has-error" : ""}`}><Mail size={16} /><input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} placeholder="admin@relay.local" aria-invalid={Boolean(error)} /></div></label>{error && <p className="admin-react-error" role="alert">{error}</p>}<button className="admin-react-primary" type="submit">Request recovery <ArrowRight size={16} /></button></form>}<Link className="admin-react-recovery-link" href="/admin"><ArrowLeft size={14} /> Return to Admin sign in</Link><div className="admin-react-login-note">⌁ Demo recovery is frontend-only and does not change credentials.</div></div></section></main>;
}

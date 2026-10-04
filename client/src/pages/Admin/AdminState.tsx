import { AlertCircle, ArrowRight, Inbox, LoaderCircle, SearchX } from "lucide-react";
import { Link } from "wouter";

type StateKind = "empty" | "search" | "loading" | "error";
export default function AdminState({ kind = "empty", title, description, actionLabel, href, onAction, compact = false }: { kind?: StateKind; title: string; description: string; actionLabel?: string; href?: string; onAction?: () => void; compact?: boolean }) {
  const Icon = kind === "loading" ? LoaderCircle : kind === "error" ? AlertCircle : kind === "search" ? SearchX : Inbox;
  return <div className={`admin-state admin-state-${kind}${compact ? " admin-state-compact" : ""}`} role={kind === "error" ? "alert" : "status"} aria-live="polite"><span className="admin-state-icon"><Icon size={compact ? 15 : 20} /></span><strong>{title}</strong><p>{description}</p>{actionLabel && href && <Link className="admin-state-action" href={href}><span>{actionLabel}</span><ArrowRight size={13} /></Link>}{actionLabel && onAction && <button className="admin-state-action" type="button" onClick={onAction}><span>{actionLabel}</span><ArrowRight size={13} /></button>}</div>;
}
export function AdminLoadingState({ label = "Loading marketplace data…" }: { label?: string }) { return <AdminState kind="loading" title="Loading" description={label} compact />; }
export function AdminErrorState({ onRetry }: { onRetry?: () => void }) { return <AdminState kind="error" title="Unable to load this Admin view" description="The local marketplace data could not be read. Try again, or return to the Admin overview." actionLabel={onRetry ? "Try again" : "Return to overview"} onAction={onRetry} href={onRetry ? undefined : "/admin/dashboard"} />; }

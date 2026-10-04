export type AdminNoteEntity = "User" | "Campaign" | "Community" | "Application" | "Placement";
export type AdminNote = { id: string; entityType: AdminNoteEntity; entityId: string; entityName: string; text: string; author: string; createdAt: string };
export type ReviewStatus = "Open" | "Investigating" | "Resolved" | "Dismissed";
export type ReviewDecision = { status: ReviewStatus; action: string; decidedAt: string; decidedBy: string };
export type PayoutStatus = "Pending" | "Completed" | "Failed" | "Held";

const notesKey = "relay-admin-internal-notes";
const reviewKey = "relay-admin-review-decisions";
const payoutKey = "relay-admin-payout-statuses";
function readJson<T>(key: string, fallback: T): T { try { return JSON.parse(window.localStorage.getItem(key) ?? "") as T; } catch { return fallback; } }
function saveJson<T>(key: string, value: T) { window.localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new CustomEvent("ownerboard:admin-operations-updated")); }
export function readAdminNotes() { return readJson<AdminNote[]>(notesKey, []); }
export function saveAdminNotes(value: AdminNote[]) { saveJson(notesKey, value); }
export function addAdminNote(note: Omit<AdminNote, "id" | "createdAt">) { const next = [{ ...note, id: `admin-note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: new Date().toISOString() }, ...readAdminNotes()]; saveAdminNotes(next); return next; }
export function removeAdminNote(id: string) { const next = readAdminNotes().filter((note) => note.id !== id); saveAdminNotes(next); return next; }
export function readReviewDecisions() { return readJson<Record<string, ReviewDecision>>(reviewKey, {}); }
export function saveReviewDecisions(value: Record<string, ReviewDecision>) { saveJson(reviewKey, value); }
export function readPayoutStatuses() { return readJson<Record<string, PayoutStatus>>(payoutKey, {}); }
export function savePayoutStatuses(value: Record<string, PayoutStatus>) { saveJson(payoutKey, value); }

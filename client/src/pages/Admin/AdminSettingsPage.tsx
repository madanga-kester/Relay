import { useEffect, useState, type ReactNode } from "react";
import AdminShell from "./AdminShell";
import AdminConfirmDialog from "./AdminConfirmDialog";
import { PLATFORM_FEE_RATE, recordAdminActivity } from "@/data/marketplaceData";
import { defaultAdminProfile, readAdminProfile, saveAdminProfile, type AdminProfile } from "./adminProfile";
import { relayBackendEnabled, relayRequest } from "@/lib/relayApi";

const settingsKey = "relay-admin-settings";

type AdminSettings = {
  platformName: string;
  defaultCurrency: string;
  marketplaceMode: "Open" | "Invite only";
  requireCommunityVerification: boolean;
  requireCampaignReview: boolean;
  maxCampaignDuration: string;
  minimumCampaignBudget: string;
  duplicateClickWindow: string;
  qualifiedClickOnly: boolean;
  emailNewApplications: boolean;
  emailBudgetAlerts: boolean;
  emailWeeklyDigest: boolean;
};

const defaultSettings: AdminSettings = {
  platformName: "Relay Marketplace",
  defaultCurrency: "KSh",
  marketplaceMode: "Open",
  requireCommunityVerification: true,
  requireCampaignReview: false,
  maxCampaignDuration: "30",
  minimumCampaignBudget: "1000",
  duplicateClickWindow: "60",
  qualifiedClickOnly: true,
  emailNewApplications: true,
  emailBudgetAlerts: true,
  emailWeeklyDigest: false,
};

function readSettings(): AdminSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(settingsKey) ?? "null") as Partial<AdminSettings> | null;
    return { ...defaultSettings, ...(stored ?? {}) };
  } catch {
    return defaultSettings;
  }
}

function SettingCard({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return <section className="admin-react-panel admin-settings-card"><div className="admin-settings-card-heading"><div><span className="admin-react-eyebrow">{eyebrow}</span><h2>{title}</h2></div><span className="admin-settings-card-mark">✦</span></div><p className="admin-settings-description">{description}</p>{children}</section>;
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="admin-settings-toggle"><span><strong>{label}</strong><small>{description}</small></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><i aria-hidden="true" /></label>;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(readSettings);
  const [profile, setProfile] = useState<AdminProfile>(readAdminProfile);
  const [saved, setSaved] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"save" | "reset" | null>(null);

  useEffect(() => {
    const sync = () => { setSettings(readSettings()); setProfile(readAdminProfile()); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const update = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => {
    setSaved(false);
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const save = () => setConfirmAction("save");
  const reset = () => setConfirmAction("reset");
  const commitSettings = async () => {
    localStorage.setItem(settingsKey, JSON.stringify(settings));
    saveAdminProfile(profile);
    window.dispatchEvent(new CustomEvent("relay:admin-settings-updated"));
    recordAdminActivity("Settings changed", { type: "Settings", id: "admin-settings", name: "Marketplace settings" }, "Admin settings saved locally.");
    if (relayBackendEnabled()) { try { await Promise.all(Object.entries(settings).map(([key, value]) => relayRequest(`/admin/settings/${encodeURIComponent(key)}`, { method: "PUT", body: JSON.stringify({ value: String(value) }) }))); } catch { /* Keep browser persistence available until a backend Admin session is connected. */ } }
    setSaved(true);
  };
  const commitReset = () => {
    localStorage.removeItem(settingsKey);
    setSettings(defaultSettings);
    setProfile(defaultAdminProfile);
    saveAdminProfile(defaultAdminProfile);
    recordAdminActivity("Settings changed", { type: "Settings", id: "admin-settings", name: "Marketplace settings" }, "Admin settings reset to defaults.");
    setSaved(false);
  };

  return <AdminShell title="Settings" subtitle="Tune marketplace operations without changing the live calculation engine">
    <div className="admin-settings-toolbar"><div><span className="admin-settings-live-dot" /> Local workspace settings</div><span>Changes are saved to this browser only</span></div>
    <div className="admin-settings-grid">
      <SettingCard eyebrow="Foundation" title="Platform settings" description="Set the operating identity and default market context shown across the admin workspace.">
        <div className="admin-settings-form-grid"><label>Platform name<input value={settings.platformName} onChange={(event) => update("platformName", event.target.value)} /></label><label>Default currency<select value={settings.defaultCurrency} onChange={(event) => update("defaultCurrency", event.target.value)}><option>KSh</option><option>USD</option><option>EUR</option></select></label></div>
      </SettingCard>
      <SettingCard eyebrow="Access" title="Marketplace settings" description="Control how new marketplace inventory is introduced and reviewed.">
        <label>Marketplace access<select value={settings.marketplaceMode} onChange={(event) => update("marketplaceMode", event.target.value as AdminSettings["marketplaceMode"])}><option>Open</option><option>Invite only</option></select></label><Toggle label="Verify communities before listing" description="Keep unverified communities out of active inventory." checked={settings.requireCommunityVerification} onChange={(value) => update("requireCommunityVerification", value)} /></SettingCard>
      <SettingCard eyebrow="Revenue" title="Platform fee configuration" description="The marketplace uses the same fee split as the financial helpers throughout the application.">
        <div className="admin-settings-fee"><div><small>Current platform fee</small><strong>{PLATFORM_FEE_RATE * 100}%</strong><span>Community Owner payout: {(1 - PLATFORM_FEE_RATE) * 100}%</span></div><span className="admin-react-pill green">In sync with CPC ledger</span></div><div className="admin-settings-info">This value is intentionally locked in the Admin UI. It reflects the existing 25% platform fee and cannot be changed here without changing the marketplace calculation model.</div>
      </SettingCard>
      <SettingCard eyebrow="Guardrails" title="Campaign settings" description="Define lightweight operating defaults for campaigns submitted to the marketplace.">
        <div className="admin-settings-form-grid"><label>Maximum campaign duration (days)<input type="number" min="1" value={settings.maxCampaignDuration} onChange={(event) => update("maxCampaignDuration", event.target.value)} /></label><label>Minimum campaign budget<input type="number" min="0" value={settings.minimumCampaignBudget} onChange={(event) => update("minimumCampaignBudget", event.target.value)} /></label></div><Toggle label="Review campaigns before publishing" description="Flag new campaigns for an administrator review step." checked={settings.requireCampaignReview} onChange={(value) => update("requireCampaignReview", value)} /></SettingCard>
      <SettingCard eyebrow="Integrity" title="Click & qualification settings" description="Keep click-quality expectations visible while preserving the existing tracking implementation.">
        <label>Duplicate-click window (seconds)<input type="number" min="0" value={settings.duplicateClickWindow} onChange={(event) => update("duplicateClickWindow", event.target.value)} /></label><Toggle label="Bill qualified clicks only" description="Use the existing qualified-click rule for CPC spend and revenue." checked={settings.qualifiedClickOnly} onChange={(value) => update("qualifiedClickOnly", value)} /><div className="admin-settings-info">Tracking and qualification logic remain controlled by the existing marketplace data layer.</div>
      </SettingCard>
      <SettingCard eyebrow="Signals" title="Notification preferences" description="Choose which operational signals should appear in the admin notification workflow.">
        <Toggle label="New application alerts" description="Notify the admin when a community applies to a campaign." checked={settings.emailNewApplications} onChange={(value) => update("emailNewApplications", value)} /><Toggle label="Budget alerts" description="Notify the admin when a campaign approaches its budget limit." checked={settings.emailBudgetAlerts} onChange={(value) => update("emailBudgetAlerts", value)} /><Toggle label="Weekly marketplace digest" description="Prepare a weekly summary of marketplace activity." checked={settings.emailWeeklyDigest} onChange={(value) => update("emailWeeklyDigest", value)} /></SettingCard>
      <SettingCard eyebrow="Identity" title="Admin profile settings" description="Update the profile label used by this frontend-only admin workspace.">
        <label>Display name<input value={profile.name} onChange={(event) => { setProfile((current) => ({ ...current, name: event.target.value })); setSaved(false); }} /></label><label>Admin email<input type="email" value={profile.email} onChange={(event) => { setProfile((current) => ({ ...current, email: event.target.value })); setSaved(false); }} /></label><div className="admin-settings-info">Authentication and permissions remain outside this frontend-only settings area.</div>
      </SettingCard>
    </div>
    <div className="admin-settings-actions"><span>{saved ? "Settings saved locally" : "Unsaved changes stay on this page until you save."}</span><div><button className="admin-settings-reset" type="button" onClick={reset}>Reset defaults</button><button className="admin-settings-save" type="button" onClick={save}>Save settings <span>→</span></button></div></div>{confirmAction && <AdminConfirmDialog title={confirmAction === "save" ? "Save Admin settings?" : "Reset Admin settings?"} description={confirmAction === "save" ? "These frontend-only operational preferences and Admin profile changes will be saved to this browser." : "All Admin settings and the Admin profile label will return to their defaults."} confirmLabel={confirmAction === "save" ? "Save settings" : "Reset defaults"} danger={confirmAction === "reset"} onCancel={() => setConfirmAction(null)} onConfirm={() => { (confirmAction === "save" ? commitSettings : commitReset)(); setConfirmAction(null); }} />}</AdminShell>;
}

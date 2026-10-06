import { useEffect, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, ArrowUpRight, Briefcase, Moon, RotateCcw, Save, Settings as SettingsIcon, Sun, UsersRound } from "lucide-react";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useRelaySession } from "@/contexts/RelaySessionContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getRelayProfile, relayBackendEnabled, saveRelayProfile, type RelayProfile } from "@/lib/relayApi";

type FormState = {
  businessName: string;
  industry: string;
  website: string;
  location: string;
  primaryGoal: string;
  phoneNumber: string;
  communityName: string;
  communityPlatform: string;
  communityMembers: string;
  communityCategory: string;
};

const platformOptions = ["WhatsApp", "Telegram", "Facebook", "Discord", "Other"];

function toForm(profile: RelayProfile): FormState {
  return {
    businessName: profile.businessName ?? "",
    industry: profile.industry ?? "",
    website: profile.website ?? "",
    location: profile.location ?? "",
    primaryGoal: profile.primaryGoal ?? "",
    phoneNumber: profile.phoneNumber ?? "",
    communityName: profile.communityName ?? "",
    communityPlatform: profile.communityPlatform ?? "",
    communityMembers: profile.communityMembers == null ? "" : String(profile.communityMembers),
    communityCategory: profile.communityCategory ?? "",
  };
}

function initialsOf(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "?";
}

export default function Profile() {
  const { theme, toggleTheme } = useTheme();
  const session = useRelaySession();
  const user = session.user;
  const backend = relayBackendEnabled();
  const kind = user?.role === "Advertiser" ? "advertiser" : user?.role === "CommunityOwner" ? "owner" : null;
  const fullName = user?.displayName ?? "Ava Sinclair";
  const roleLabel = kind === "advertiser" ? "Campaign Owner" : kind === "owner" ? "Community Owner" : user?.role ?? "Community Owner";
  const homeHref = kind === "advertiser" ? "/campaign-owner" : kind === "owner" ? "/community-owner" : "/";

  const [profile, setProfile] = useState<RelayProfile | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!backend || !user) return;
    let cancelled = false;
    setLoadState("loading");
    getRelayProfile()
      .then((loaded) => {
        if (cancelled) return;
        setProfile(loaded);
        setForm(toForm(loaded));
        setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [backend, user?.id]);

  const update = (key: keyof FormState, value: string) => setForm((current) => (current ? { ...current, [key]: value } : current));
  const dirty = profile !== null && form !== null && JSON.stringify(form) !== JSON.stringify(toForm(profile));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile || !form || saving || !dirty) return;
    const membersText = form.communityMembers.replace(/[^0-9]/g, "");
    setSaving(true);
    try {
      const saved = await saveRelayProfile({
        businessName: form.businessName.trim() || undefined,
        industry: form.industry.trim() || undefined,
        website: form.website.trim() || undefined,
        location: form.location.trim() || undefined,
        primaryGoal: form.primaryGoal.trim() || undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
        avatarKey: profile.avatarKey ?? undefined,
        onboardingCompleted: profile.onboardingCompleted,
        communityName: form.communityName.trim() || undefined,
        communityPlatform: form.communityPlatform.trim() || undefined,
        communityMembers: membersText ? Number(membersText) : undefined,
        communityCategory: form.communityCategory.trim() || undefined,
      });
      setProfile(saved);
      setForm(toForm(saved));
      toast.success("Profile saved");
    } catch (error) {
      toast.error("Profile not saved", { description: error instanceof Error ? error.message : "The server rejected this change." });
    } finally {
      setSaving(false);
    }
  };

  const platforms = form && form.communityPlatform && !platformOptions.includes(form.communityPlatform) ? [form.communityPlatform, ...platformOptions] : platformOptions;
  const detailFields: string[] = !form
    ? []
    : kind === "advertiser"
      ? [form.businessName, form.industry, form.website, form.primaryGoal, form.location, form.phoneNumber]
      : kind === "owner"
        ? [form.communityName, form.communityPlatform, form.communityMembers, form.communityCategory, form.location, form.phoneNumber]
        : [];
  const completed = detailFields.filter((value) => value.trim() !== "").length;
  const completion = detailFields.length ? Math.round((completed / detailFields.length) * 100) : 0;
  const settingsHref = kind === "advertiser" ? "/campaign-owner/settings" : "/settings";
  const discard = () => {
    if (profile) setForm(toForm(profile));
  };
    return (
    <WorkspaceShell active="Profile">
      <div className="dashboard-body">
        <section className="route-page-heading">
          <div>
            <span className="section-kicker"><span className="section-kicker-line section-kicker-line-lilac" /> Account</span>
            <h1>Profile settings</h1>
            <p>Keep your account details and workspace preferences up to date.</p>
          </div>
          <Link className="hero-link route-back-link route-back-link-dark" href={homeHref}><ArrowLeft size={15} /> Back to overview</Link>
        </section>

        <section className="pf-hero">
          <div className="pf-avatar" aria-hidden="true">{initialsOf(fullName)}</div>
          <div className="pf-hero-main">
            <span className="pf-role">{roleLabel}</span>
            <h2>{fullName}</h2>
            <p>{user?.email ?? "@avaafterhours"}</p>
            {user && <p className="pf-hero-note">Name and email cannot be changed here yet.</p>}
          </div>
          {backend && user && kind && loadState === "ready" && form && (
            <div className="pf-meter">
              <div className="pf-meter-label"><span>Profile completeness</span><span>{completion}%</span></div>
              <div className="pf-meter-track" role="progressbar" aria-label="Profile completeness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completion}><span style={{ width: `${completion}%` }} /></div>
              <small>{completed} of {detailFields.length} details added</small>
            </div>
          )}
        </section>

        <div className="pf-layout">
          {backend && user && kind ? (
            <form className="pf-card" onSubmit={save}>
              <div className="pf-card-head">
                <span className="pf-card-icon">{kind === "advertiser" ? <Briefcase size={17} /> : <UsersRound size={17} />}</span>
                <div>
                  <h2>{kind === "advertiser" ? "Business details" : "Community details"}</h2>
                  <p>These details are saved to your account.</p>
                </div>
              </div>
              {loadState === "loading" && <p>Loading your profile...</p>}
              {loadState === "error" && <p>Your profile could not be loaded. Check your connection and refresh the page.</p>}
              {loadState === "ready" && form && (
                <>
                  <div className="campaign-form-grid">
                    {kind === "advertiser" ? (
                      <>
                        <span className="pf-section-label">Business</span>
                        <label>Business name<input value={form.businessName} maxLength={160} onChange={(event) => update("businessName", event.target.value)} /></label>
                        <label>Industry<input value={form.industry} maxLength={120} onChange={(event) => update("industry", event.target.value)} /></label>
                        <label>Website<input value={form.website} maxLength={300} placeholder="https://" onChange={(event) => update("website", event.target.value)} /><span className="pf-hint">Start with https:// or enter just the domain.</span></label>
                        <label>Primary goal<input value={form.primaryGoal} maxLength={240} onChange={(event) => update("primaryGoal", event.target.value)} /></label>
                      </>
                    ) : (
                      <>
                        <span className="pf-section-label">Community</span>
                        <label>Community name<input value={form.communityName} maxLength={160} onChange={(event) => update("communityName", event.target.value)} /></label>
                        <label>
                          Platform
                          <select value={form.communityPlatform} onChange={(event) => update("communityPlatform", event.target.value)}>
                            <option value="">Select a platform</option>
                            {platforms.map((platform) => <option key={platform}>{platform}</option>)}
                          </select>
                        </label>
                        <label>Audience size<input type="number" inputMode="numeric" min={0} value={form.communityMembers} onChange={(event) => update("communityMembers", event.target.value)} /></label>
                        <label>Category<input value={form.communityCategory} maxLength={120} onChange={(event) => update("communityCategory", event.target.value)} /></label>
                      </>
                    )}
                    <span className="pf-section-label">Contact</span>
                    <label>Location<input value={form.location} maxLength={180} onChange={(event) => update("location", event.target.value)} /></label>
                    <label>Phone number<input value={form.phoneNumber} maxLength={32} inputMode="tel" onChange={(event) => update("phoneNumber", event.target.value)} /><span className="pf-hint">Digits, spaces, + ( ) and - only.</span></label>
                  </div>
                  <div className="pf-footer">
                    <span className={`pf-status ${dirty ? "pf-status-dirty" : ""}`}><span className="pf-status-dot" /> {dirty ? "You have unsaved changes." : "All changes saved."}</span>
                    <div className="pf-actions">
                      {dirty && <button className="pf-secondary-button" type="button" onClick={discard} disabled={saving}><RotateCcw size={13} /> Discard</button>}
                      <button className="accept-button" type="submit" disabled={!dirty || saving}><Save size={15} /> {saving ? "Saving..." : "Save profile"}</button>
                    </div>
                  </div>
                </>
              )}
            </form>
          ) : (
            <section className="pf-card">
              <div className="pf-card-head">
                <span className="pf-card-icon"><Briefcase size={17} /></span>
                <div>
                  <h2>Profile details</h2>
                  <p>Sign in to your account with the API running to view and edit your details.</p>
                </div>
              </div>
            </section>
          )}

          <aside className="pf-side">
            <section className="pf-card">
              <div className="pf-card-head">
                <span className="pf-card-icon"><SettingsIcon size={17} /></span>
                <div>
                  <h2>Workspace preferences</h2>
                  <p>Make Relay feel right for your daily workflow.</p>
                </div>
              </div>
              <button className="preference-row" type="button" onClick={toggleTheme}>
                <span className="preference-row-icon">{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</span>
                <span>
                  <strong>{theme === "dark" ? "Light theme" : "Dark theme"}</strong>
                  <small>Use a {theme === "dark" ? "brighter" : "darker"} workspace when you need it.</small>
                </span>
                <span className={`theme-switch ${theme === "dark" ? "theme-switch-on" : ""}`}><span /></span>
              </button>
            </section>
            <section className="pf-card pf-link-card">
              <h2>More settings</h2>
              <p>Change your currency and workspace defaults.</p>
              <Link className="section-link" href={settingsHref}>Open workspace settings <ArrowUpRight size={14} /></Link>
            </section>
          </aside>
        </div>
      </div>
    </WorkspaceShell>
  );
}
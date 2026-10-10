import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Key,
  Loader2,
  Mail,
  Moon,
  Save,
  Settings as SettingsIcon,
  Sun,
  UserCircle,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useTheme } from "@/contexts/ThemeContext";
import { CURRENCY_OPTIONS, useCurrency } from "@/lib/currency";
import { toast } from "sonner";
import {
  getRelayPreferences,
  getRelayProfile,
  getRelaySession,
  relayBackendEnabled,
  saveRelayPreferences,
  saveRelayProfile,
  type RelayProfile,
} from "@/lib/relayApi";

type CampaignOwnerSettingsState = {
  // Existing Profile & Defaults
  name: string;
  email: string;
  defaultDuration: string;
  defaultPlatform: string;
  applicationAlerts: boolean;
  billingAlerts: boolean;
  // Notifications
  emailDigest: string;
  browserNotifications: boolean;
  marketingEmails: boolean;
  // Team
  teamName: string;
  inviteEmail: string;
  // Billing
  taxId: string;
  billingEmail: string;
  // API
  apiKey: string;
  webhookUrl: string;
};

const settingsKey = "relay-campaign-owner-settings";

type SettingsSection =
  | "workspace"
  | "profile"
  | "defaults"
  | "notifications"
  | "team"
  | "billing"
  | "api";

const settingsSections: {
  id: SettingsSection;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "workspace", label: "Workspace preferences", icon: <SettingsIcon size={16} /> },
  { id: "profile", label: "Campaign Owner profile", icon: <UserCircle size={16} /> },
  { id: "defaults", label: "Campaign defaults", icon: <CheckCircle2 size={16} /> },
  { id: "notifications", label: "Notifications & Channels", icon: <Bell size={16} /> },
  { id: "team", label: "Team & Permissions", icon: <Users size={16} /> },
  { id: "billing", label: "Billing & Invoicing", icon: <CreditCard size={16} /> },
  { id: "api", label: "API & Integrations", icon: <Key size={16} /> },
];

const demoDefaults: CampaignOwnerSettingsState = {
  name: "Njeri Kamau",
  email: "njeri@relay.local",
  defaultDuration: "7 days",
  defaultPlatform: "WhatsApp",
  applicationAlerts: true,
  billingAlerts: true,
  emailDigest: "weekly",
  browserNotifications: true,
  marketingEmails: false,
  teamName: "Relay Campaign Ops",
  inviteEmail: "",
  taxId: "VAT-984210",
  billingEmail: "finance@relay.local",
  apiKey: "relay_live_sk_8f93a102bc45",
  webhookUrl: "https://api.relay.local/webhooks/campaigns",
};

const liveDefaults: CampaignOwnerSettingsState = {
  ...demoDefaults,
  name: "",
  email: "",
  teamName: "",
  taxId: "",
  billingEmail: "",
  apiKey: "",
  webhookUrl: "",
};

const defaults = relayBackendEnabled() ? liveDefaults : demoDefaults;

const accountKeys = [
  "defaultDuration",
  "defaultPlatform",
  "applicationAlerts",
  "billingAlerts",
  "emailDigest",
  "browserNotifications",
  "marketingEmails",
  "teamName",
  "taxId",
  "billingEmail",
  "webhookUrl",
] as const;

function pickAccountPreferences(settings: CampaignOwnerSettingsState) {
  const values: Record<string, string | boolean> = {};
  accountKeys.forEach((key) => {
    values[key] = settings[key];
  });
  return values;
}

function applyAccountPreferences(
  values: Record<string, unknown>
): Partial<CampaignOwnerSettingsState> {
  const result: Record<string, string | boolean> = {};
  accountKeys.forEach((key) => {
    const value = values[key];
    if (typeof value === typeof defaults[key]) {
      result[key] = value as string | boolean;
    }
  });
  return result as Partial<CampaignOwnerSettingsState>;
}

function readSettings(): CampaignOwnerSettingsState {
  try {
    const stored = JSON.parse(window.localStorage.getItem(settingsKey) ?? "{}");
    if (relayBackendEnabled()) {
      return {
        ...defaults,
        apiKey:
          typeof stored.apiKey === "string" && stored.apiKey !== demoDefaults.apiKey
            ? stored.apiKey
            : defaults.apiKey,
        inviteEmail:
          typeof stored.inviteEmail === "string"
            ? stored.inviteEmail
            : defaults.inviteEmail,
      };
    }
    return { ...defaults, ...stored };
  } catch {
    return defaults;
  }
}

function saveSettings(settings: CampaignOwnerSettingsState) {
  const stored = relayBackendEnabled()
    ? { apiKey: settings.apiKey, inviteEmail: settings.inviteEmail }
    : settings;
  window.localStorage.setItem(settingsKey, JSON.stringify(stored));
  window.dispatchEvent(
    new CustomEvent("ownerboard:campaign-owner-settings-updated")
  );
}

export default function CampaignOwnerSettings() {
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [settings, setSettings] = useState<CampaignOwnerSettingsState>(readSettings);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>("workspace");
  const [profile, setProfile] = useState<RelayProfile | null>(null);
  const [loaded, setLoaded] = useState(!relayBackendEnabled());
  useEffect(() => {
    const refresh = () => {
      if (!relayBackendEnabled()) setSettings(readSettings());
    };
    refresh();

    let cancelled = false;
    if (relayBackendEnabled()) {
      void (async () => {
        try {
          const [session, loadedProfile, preferences] = await Promise.all([
            getRelaySession(),
            getRelayProfile(),
            getRelayPreferences(),
          ]);
          if (cancelled) return;
          setProfile(loadedProfile);
          setSettings((current) => ({
            ...current,
            ...applyAccountPreferences(preferences.values),
            name: loadedProfile.businessName || session.displayName,
            email: session.email,
          }));
          setLoaded(true);
        } catch {
          if (!cancelled) {
            toast.error("Could not load your settings", {
              description: "Check that the API is running, then refresh the page.",
            });
          }
        }
      })();
    }

    window.addEventListener("storage", refresh);
    window.addEventListener("ownerboard:campaign-owner-settings-updated", refresh);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", refresh);
      window.removeEventListener("ownerboard:campaign-owner-settings-updated", refresh);
    };
  }, []);

  const update = <K extends keyof CampaignOwnerSettingsState>(
    key: K,
    value: CampaignOwnerSettingsState[K]
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const save = async () => {
    setIsSaving(true);
    saveSettings(settings);
    if (relayBackendEnabled()) {
      if (!profile) {
        toast.error("Settings could not be saved", {
          description: "Your profile has not loaded yet. Refresh the page and try again.",
        });
        setIsSaving(false);
        return;
      }
      try {
        await saveRelayProfile({
          businessName: settings.name,
          industry: profile.industry ?? undefined,
          website: profile.website ?? undefined,
          location: profile.location ?? undefined,
          primaryGoal: profile.primaryGoal ?? undefined,
          phoneNumber: profile.phoneNumber ?? undefined,
          avatarKey: profile.avatarKey ?? undefined,
          onboardingCompleted: true,
          communityName: profile.communityName ?? undefined,
          communityPlatform: profile.communityPlatform ?? undefined,
          communityMembers: profile.communityMembers ?? undefined,
          communityCategory: profile.communityCategory ?? undefined,
        });
        await saveRelayPreferences(pickAccountPreferences(settings));
        setProfile((current) =>
          current ? { ...current, businessName: settings.name } : current
        );
      } catch (error) {
        toast.error("Settings could not be saved", {
          description: error instanceof Error ? error.message : "Try again.",
        });
        setIsSaving(false);
        return;
      }
    }
    setIsSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  };

  return (
    <WorkspaceShell
      active="Settings"
      workspaceLabel="Campaign Owner"
      workspaceMode="campaign-owner"
    >
      <div className="dashboard-body">
        <Link className="hero-link route-back-link route-back-link-right" href="/campaign-owner">
          <ArrowLeft size={15} /> Back to Campaign Owner overview
        </Link>

        <section className="route-page-heading">
          <div>
            <span className="section-kicker">
              <span className="section-kicker-line" /> Campaign Owner workspace
            </span>
            <h1>Settings</h1>
            <p>
              Manage your Campaign Owner profile, workspace preferences, notifications, and integration defaults.
            </p>
          </div>
        </section>

        <div className="settings-layout">
          <nav className="settings-sidebar" aria-label="Settings sections">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`settings-sidebar-item ${
                  activeSection === section.id ? "settings-sidebar-item-active" : ""
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </nav>

          <div className="settings-content">
            {/* 1. Workspace Preferences */}
            {activeSection === "workspace" && (
              <div className="settings-card">
                <div className="preference-card-heading">
                  <span className="preference-icon">
                    <SettingsIcon size={17} />
                  </span>
                  <div>
                    <h2>Workspace preferences</h2>
                    <p>
                      {relayBackendEnabled()
                        ? "These settings are saved to your account."
                        : "These settings are stored locally for this Campaign Owner workspace."}
                    </p>
                  </div>
                </div>

                <button className="preference-row" type="button" onClick={toggleTheme}>
                  <span className="preference-row-icon">
                    {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                  </span>
                  <span>
                    <strong>{theme === "dark" ? "Light theme" : "Dark theme"}</strong>
                    <small>
                      Use a {theme === "dark" ? "brighter" : "darker"} workspace when you need it.
                    </small>
                  </span>
                  <span className={`theme-switch ${theme === "dark" ? "theme-switch-on" : ""}`}>
                    <span />
                  </span>
                </button>

                <div className="preference-row currency-preference-row">
                  <span className="preference-row-icon">
                    <DollarSign size={16} />
                  </span>
                  <span>
                    <strong>Workspace currency</strong>
                    <small>
                      Changes financial display preferences across your workspace.
                    </small>
                  </span>
                  <span className="currency-switcher">
                    {CURRENCY_OPTIONS.map((option) => (
                      <button
                        type="button"
                        key={option}
                        className={currency === option ? "currency-option-active" : ""}
                        onClick={() => setCurrency(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </span>
                </div>

                <PreferenceToggle
                  icon={<Bell size={16} />}
                  title="Application alerts"
                  description="Show reminders when Community Owners submit applications."
                  enabled={settings.applicationAlerts}
                  onToggle={() => update("applicationAlerts", !settings.applicationAlerts)}
                />

                <PreferenceToggle
                  icon={<Mail size={16} />}
                  title="Billing alerts"
                  description="Keep billing and qualified-click activity visible in workspace updates."
                  enabled={settings.billingAlerts}
                  onToggle={() => update("billingAlerts", !settings.billingAlerts)}
                />
              </div>
            )}

            {/* 2. Profile Section */}
            {activeSection === "profile" && (
              <div className="settings-card campaign-owner-settings-form">
                <div className="preference-card-heading">
                  <span className="preference-icon">
                    <UserCircle size={17} />
                  </span>
                  <div>
                    <h2>Campaign Owner profile</h2>
                    <p>
                      {relayBackendEnabled()
                        ? "Update the profile details shown in this workspace."
                        : "Update the local profile details shown in this workspace."}
                    </p>
                  </div>
                </div>

                <div className="campaign-owner-settings-fields">
                  <label>
                    Display name
                    <input
                      value={settings.name}
                      onChange={(event) => update("name", event.target.value)}
                    />
                  </label>
                  <label>
                    Email address
                    <input
                      type="email"
                      value={settings.email}
                      readOnly={relayBackendEnabled()}
                      onChange={(event) => update("email", event.target.value)}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 3. Campaign Defaults Section */}
            {activeSection === "defaults" && (
              <div className="settings-card campaign-owner-settings-form">
                <div className="preference-card-heading">
                  <span className="preference-icon">
                    <CheckCircle2 size={17} />
                  </span>
                  <div>
                    <h2>Campaign defaults</h2>
                    <p>
                      Convenience defaults for future campaign creation. Existing campaigns are unchanged.
                    </p>
                  </div>
                </div>

                <div className="campaign-owner-settings-fields">
                  <label>
                    Default campaign duration
                    <select
                      value={settings.defaultDuration}
                      onChange={(event) => update("defaultDuration", event.target.value)}
                    >
                      <option>7 days</option>
                      <option>14 days</option>
                      <option>30 days</option>
                    </select>
                  </label>
                  <label>
                    Default community platform
                    <select
                      value={settings.defaultPlatform}
                      onChange={(event) => update("defaultPlatform", event.target.value)}
                    >
                      <option>WhatsApp</option>
                      <option>Telegram</option>
                      <option>Discord</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            {/* 4. Notifications & Channels */}
            {activeSection === "notifications" && (
              <div className="settings-card campaign-owner-settings-form">
                <div className="preference-card-heading">
                  <span className="preference-icon">
                    <Bell size={17} />
                  </span>
                  <div>
                    <h2>Notifications & Channels</h2>
                    <p>Configure how and when you receive workspace updates.</p>
                  </div>
                </div>

                <div className="campaign-owner-settings-fields">
                  <label>
                    Email Performance Digest
                    <select
                      value={settings.emailDigest}
                      onChange={(event) => update("emailDigest", event.target.value)}
                    >
                      <option value="daily">Daily summary</option>
                      <option value="weekly">Weekly digest</option>
                      <option value="monthly">Monthly report</option>
                      <option value="off">Disabled</option>
                    </select>
                  </label>
                </div>

                <PreferenceToggle
                  icon={<Bell size={16} />}
                  title="Browser push notifications"
                  description="Receive instant desktop popups for critical application status changes."
                  enabled={settings.browserNotifications}
                  onToggle={() => update("browserNotifications", !settings.browserNotifications)}
                />

                <PreferenceToggle
                  icon={<Mail size={16} />}
                  title="Product updates & news"
                  description="Receive news about new features, benchmarks, and platform insights."
                  enabled={settings.marketingEmails}
                  onToggle={() => update("marketingEmails", !settings.marketingEmails)}
                />
              </div>
            )}

            {/* 5. Team & Permissions */}
            {activeSection === "team" && (
              <div className="settings-card campaign-owner-settings-form">
                <div className="preference-card-heading">
                  <span className="preference-icon">
                    <Users size={17} />
                  </span>
                  <div>
                    <h2>Team & Permissions</h2>
                    <p>Manage workspace access for collaborators and team members.</p>
                  </div>
                </div>

                <div className="campaign-owner-settings-fields">
                  <label>
                    Team Workspace Name
                    <input
                      value={settings.teamName}
                      onChange={(event) => update("teamName", event.target.value)}
                    />
                  </label>

                  <label>
                    Invite New Teammate
                    <input
                      type="email"
                      placeholder="colleague@company.com"
                      value={settings.inviteEmail}
                      onChange={(event) => update("inviteEmail", event.target.value)}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 6. Billing & Invoicing */}
            {activeSection === "billing" && (
              <div className="settings-card campaign-owner-settings-form">
                <div className="preference-card-heading">
                  <span className="preference-icon">
                    <CreditCard size={17} />
                  </span>
                  <div>
                    <h2>Billing & Invoicing</h2>
                    <p>Update tax parameters and invoice delivery recipients.</p>
                  </div>
                </div>

                <div className="campaign-owner-settings-fields">
                  <label>
                    Tax / VAT Identification
                    <input
                      value={settings.taxId}
                      onChange={(event) => update("taxId", event.target.value)}
                    />
                  </label>

                  <label>
                    Billing Email Recipient
                    <input
                      type="email"
                      value={settings.billingEmail}
                      onChange={(event) => update("billingEmail", event.target.value)}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 7. API & Integrations */}
            {activeSection === "api" && (
              <div className="settings-card campaign-owner-settings-form">
                <div className="preference-card-heading">
                  <span className="preference-icon">
                    <Key size={17} />
                  </span>
                  <div>
                    <h2>API & Integrations</h2>
                    <p>Manage API credentials and event webhooks for automation.</p>
                  </div>
                </div>

                <div className="campaign-owner-settings-fields">
                  <label>
                    API Secret Key
                    <input
                      type="password"
                      value={settings.apiKey}
                      onChange={(event) => update("apiKey", event.target.value)}
                    />
                  </label>

                  <label>
                    Webhook Endpoint URL
                    <input
                      type="url"
                      value={settings.webhookUrl}
                      onChange={(event) => update("webhookUrl", event.target.value)}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Save Actions Bar */}
            <div className="campaign-owner-settings-actions">
              <button
                className="primary-owner-button"
                type="button"
                disabled={isSaving || !loaded}
                onClick={save}
              >
                {isSaving ? <Loader2 size={15} className="spin" /> : <Save size={15} />} Save settings
              </button>
              {saved && (
                <span className="campaign-owner-settings-saved">
                  <CheckCircle2 size={14} /> {relayBackendEnabled() ? "Settings saved" : "Settings saved locally"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}

function PreferenceToggle({
  icon,
  title,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button className="preference-row" type="button" onClick={onToggle}>
      <span className="preference-row-icon">{icon}</span>
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <span className={`theme-switch ${enabled ? "theme-switch-on" : ""}`}>
        <span />
      </span>
    </button>
  );
}
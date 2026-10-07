import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  DollarSign,
  Mail,
  Moon,
  Save,
  Settings as SettingsIcon,
  Sun,
  UserCircle,
} from "lucide-react";
import { Link } from "wouter";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useTheme } from "@/contexts/ThemeContext";
import { CURRENCY_OPTIONS, useCurrency } from "@/lib/currency";
import {
  getRelayProfile,
  relayBackendEnabled,
  saveRelayProfile,
} from "@/lib/relayApi";

type CampaignOwnerSettingsState = {
  name: string;
  email: string;
  defaultDuration: string;
  defaultPlatform: string;
  applicationAlerts: boolean;
  billingAlerts: boolean;
};

const settingsKey = "relay-campaign-owner-settings";

type SettingsSection = "workspace" | "profile" | "defaults";

const settingsSections: {
  id: SettingsSection;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "workspace", label: "Workspace preferences", icon: <SettingsIcon size={16} /> },
  { id: "profile", label: "Campaign Owner profile", icon: <UserCircle size={16} /> },
  { id: "defaults", label: "Campaign defaults", icon: <CheckCircle2 size={16} /> },
];
const defaults: CampaignOwnerSettingsState = {
  name: "Njeri Kamau",
  email: "njeri@relay.local",
  defaultDuration: "7 days",
  defaultPlatform: "WhatsApp",
  applicationAlerts: true,
  billingAlerts: true,
};

function readSettings() {
  try {
    return {
      ...defaults,
      ...JSON.parse(window.localStorage.getItem(settingsKey) ?? "{}"),
    } as CampaignOwnerSettingsState;
  } catch {
    return defaults;
  }
}

function saveSettings(settings: CampaignOwnerSettingsState) {
  window.localStorage.setItem(settingsKey, JSON.stringify(settings));
  window.dispatchEvent(
    new CustomEvent("ownerboard:campaign-owner-settings-updated")
  );
}

export default function CampaignOwnerSettings() {
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [settings, setSettings] = useState<CampaignOwnerSettingsState>(readSettings);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>("workspace");

  useEffect(() => {
    const refresh = () => setSettings(readSettings());
    refresh();

    if (relayBackendEnabled()) {
      void getRelayProfile()
        .then((profile) => {
          if (profile.businessName) {
            setSettings((current) => ({
              ...current,
              name: profile.businessName ?? current.name,
              email: current.email,
            }));
          }
        })
        .catch(() => undefined);
    }

    window.addEventListener("storage", refresh);
    window.addEventListener("ownerboard:campaign-owner-settings-updated", refresh);

    return () => {
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
    saveSettings(settings);
    if (relayBackendEnabled()) {
      try {
        await saveRelayProfile({
          businessName: settings.name,
          onboardingCompleted: true,
        });
      } catch {
        /* Local settings remain available if the backend profile is temporarily unavailable. */
      }
    }
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
              Manage your Campaign Owner profile, workspace preferences, and
              campaign defaults.
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
        <div
          className={`settings-card ${
            activeSection !== "workspace" ? "settings-section-hidden" : ""
          }`}
        >
          <div className="preference-card-heading">
            <span className="preference-icon">
              <SettingsIcon size={17} />
            </span>
            <div>
              <h2>Workspace preferences</h2>
              <p>
                These settings are stored locally for this Campaign Owner workspace.
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
                Use a {theme === "dark" ? "brighter" : "darker"} workspace when you
                need it.
              </small>
            </span>
            <span
              className={`theme-switch ${
                theme === "dark" ? "theme-switch-on" : ""
              }`}
            >
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
            onToggle={() =>
              update("applicationAlerts", !settings.applicationAlerts)
            }
          />

          <PreferenceToggle
            icon={<Mail size={16} />}
            title="Billing alerts"
            description="Keep billing and qualified-click activity visible in workspace updates."
            enabled={settings.billingAlerts}
            onToggle={() => update("billingAlerts", !settings.billingAlerts)}
          />
        </div>

        <div
          className={`settings-card campaign-owner-settings-form ${
            activeSection !== "profile" ? "settings-section-hidden" : ""
          }`}
        >
          <div className="preference-card-heading">
            <span className="preference-icon">
              <UserCircle size={17} />
            </span>
            <div>
              <h2>Campaign Owner profile</h2>
              <p>Update the local profile details shown in this workspace.</p>
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
                onChange={(event) => update("email", event.target.value)}
              />
            </label>
          </div>
        </div>

        <div
          className={`settings-card campaign-owner-settings-form ${
            activeSection !== "defaults" ? "settings-section-hidden" : ""
          }`}
        >
          <div className="preference-card-heading">
            <span className="preference-icon">
              <CheckCircle2 size={17} />
            </span>
            <div>
              <h2>Campaign defaults</h2>
              <p>
                Convenience defaults for future campaign creation. Existing
                campaigns are unchanged.
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

        <div className="campaign-owner-settings-actions">
          <button
            className="primary-owner-button"
            type="button"
            onClick={save}
          >
            <Save size={15} /> Save settings
          </button>
          {saved && (
            <span className="campaign-owner-settings-saved">
              <CheckCircle2 size={14} /> Settings saved locally
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
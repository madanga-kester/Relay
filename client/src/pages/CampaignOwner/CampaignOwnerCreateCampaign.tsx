import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  FileText,
  Globe2,
  Megaphone,
  Send,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";

import { toast } from "sonner";

import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import WorkspaceShell from "@/components/WorkspaceShell";
import { CampaignRecord, readCampaigns, saveCampaigns } from "./campaignData";
import { formatMoney, getCpcBreakdown } from "@/data/marketplaceData";
import {
  createRelayCampaign,
  relayBackendEnabled,
  setRelayBackendId,
  transitionRelayCampaign,
} from "@/lib/relayApi";

const platformOptions = ["WhatsApp", "Telegram", "Facebook", "Discord", "Newsletter"];

const categoryOptions = [
  "Telecom & internet",
  "Financial services",
  "E-commerce",
  "Travel",
  "Fashion & retail",
  "Education",
  "Health & wellness",
];

type FormState = Omit<
  CampaignRecord,
  "id" | "status" | "applications" | "placements" | "clicks"
>;

const emptyForm: FormState = {
  name: "",
  advertiser: "",
  description: "",
  advertisement: "",
  destinationUrl: "",
  platforms: ["WhatsApp"],
  category: "Telecom & internet",
  location: "Kenya",
  minAudience: "",
  maxAudience: "",
  duration: "7 days",
  maxCommunities: "",
  cpc: "",
  budget: "",
  startDate: "",
  endDate: "",
};

const composerStyles = `
  .campaign-composer {
    --composer-ink: var(--ink);
    --composer-muted: var(--muted);
    --composer-line: var(--border);
    --composer-soft: var(--surface-soft);
    --composer-cream: var(--surface);
    --composer-olive: var(--coral);
    --composer-olive-dark: var(--coral-dark);
    --composer-lilac: var(--lilac);
    color: var(--composer-ink);
    max-width: 1440px;
    margin: 0 auto;
    padding: 34px clamp(18px, 4vw, 64px) 72px;
  }

  .campaign-composer a,
  .campaign-composer button,
  .campaign-composer input,
  .campaign-composer textarea,
  .campaign-composer select {
    font: inherit;
  }

  .composer-back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--composer-muted);
    text-decoration: none;
    font-size: 13px;
    font-weight: 700;
    transition: color 160ms ease, transform 160ms ease;
  }

  .composer-back-link:hover {
    color: var(--composer-ink);
    transform: translateX(-2px);
  }

  .composer-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 28px;
    margin: 30px 0 28px;
  }

  .composer-eyebrow,
  .composer-kicker {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    color: var(--composer-olive-dark);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .13em;
    text-transform: uppercase;
  }

  .composer-eyebrow::before,
  .composer-kicker::before {
    content: "";
    width: 28px;
    height: 2px;
    background: var(--composer-olive);
    border-radius: 99px;
  }

  .composer-hero h1 {
    max-width: 720px;
    margin: 10px 0 12px;
    font-family: Fraunces, Georgia, serif;
    font-size: clamp(38px, 5vw, 70px);
    line-height: .98;
    letter-spacing: -.05em;
    font-weight: 500;
  }

  .composer-hero p {
    max-width: 720px;
    margin: 0;
    color: var(--composer-muted);
    font-size: 15px;
    line-height: 1.7;
  }

  .composer-mode-badge {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 13px;
    color: var(--composer-olive-dark);
    background: var(--coral-soft);
    border: 1px solid var(--border);
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
  }

  .composer-mode-badge span {
    width: 7px;
    height: 7px;
    background: var(--coral);
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba(255, 107, 74, .16);
  }

  .composer-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.52fr) minmax(320px, .78fr);
    align-items: start;
    gap: 22px;
  }

  .composer-form {
    display: grid;
    gap: 16px;
    min-width: 0;
  }

  .composer-section,
  .composer-summary {
    background: rgba(255, 255, 255, .84);
    border: 1px solid var(--composer-line);
    border-radius: 22px;
    box-shadow: 0 16px 45px rgba(34, 47, 36, .055);
  }

  .composer-section {
    padding: clamp(20px, 3vw, 30px);
  }

  .composer-section-heading {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    margin-bottom: 22px;
  }

  .composer-section-number {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    color: #fff;
    background: var(--composer-ink);
    border-radius: 11px;
    font-size: 12px;
    font-weight: 900;
  }

  .composer-section-heading h2 {
    margin: 0;
    font-size: 19px;
    letter-spacing: -.02em;
  }

  .composer-section-heading p {
    margin: 5px 0 0;
    color: var(--composer-muted);
    font-size: 13px;
    line-height: 1.55;
  }

  .composer-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 17px;
  }

  .composer-field,
  .composer-fieldset {
    min-width: 0;
  }

  .composer-field.full,
  .composer-fieldset.full {
    grid-column: 1 / -1;
  }

  .composer-field label,
  .composer-fieldset legend {
    display: block;
    margin-bottom: 8px;
    color: #344139;
    font-size: 12px;
    font-weight: 850;
  }

  .composer-field input,
  .composer-field textarea,
  .composer-field select {
    width: 100%;
    min-height: 48px;
    box-sizing: border-box;
    padding: 13px 14px;
    color: var(--composer-ink);
    background: var(--surface);
    border: 1px solid #d8e0d8;
    border-radius: 13px;
    outline: none;
    transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
  }

  .composer-field textarea {
    min-height: 116px;
    resize: vertical;
    line-height: 1.55;
  }

  .composer-field input::placeholder,
  .composer-field textarea::placeholder {
    color: #a7b0aa;
  }

  .composer-field input:focus,
  .composer-field textarea:focus,
  .composer-field select:focus {
    background: var(--surface);
    border-color: var(--composer-olive);
    box-shadow: 0 0 0 4px rgba(255, 107, 74, .1);
  }

  .composer-helper {
    display: block;
    margin-top: 7px;
    color: var(--composer-muted);
    font-size: 11px;
    line-height: 1.45;
  }

  .composer-fieldset {
    margin: 0;
    padding: 0;
    border: 0;
  }

  .composer-platforms {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
  }

  .composer-platform {
    position: relative;
  }

  .composer-platform input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .composer-platform span {
    display: inline-flex;
    align-items: center;
    min-height: 38px;
    padding: 0 13px;
    color: var(--muted-deep);
    background: var(--surface-soft);
    border: 1px solid var(--border);
    border-radius: 999px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 800;
    transition: all 160ms ease;
  }

  .composer-platform input:checked + span {
    color: #fff;
    background: var(--composer-olive-dark);
    border-color: var(--composer-olive-dark);
    box-shadow: 0 7px 15px rgba(255, 107, 74, .18);
  }

  .composer-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 18px;
    padding: 16px 4px 0;
  }

  .composer-footer-note {
    display: inline-flex;
    align-items: flex-start;
    gap: 8px;
    color: var(--composer-muted);
    font-size: 12px;
    line-height: 1.45;
  }

  .composer-submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    min-height: 48px;
    padding: 0 18px;
    color: #fff;
    background: var(--composer-ink);
    border: 0;
    border-radius: 13px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 850;
    white-space: nowrap;
    box-shadow: 0 10px 22px rgba(24, 35, 31, .14);
    transition: transform 160ms ease, background 160ms ease, opacity 160ms ease;
  }

  .composer-submit:hover:not(:disabled) {
    background: var(--composer-olive-dark);
    transform: translateY(-2px);
  }

  .composer-submit:disabled {
    cursor: not-allowed;
    opacity: .42;
    box-shadow: none;
  }

  .composer-summary {
    position: sticky;
    top: 24px;
    overflow: hidden;
  }

  .composer-summary-top {
    padding: 25px 25px 20px;
    background: linear-gradient(145deg, var(--ink), #243d55);
    color: #fff;
  }

  .composer-summary-top .composer-kicker {
    color: var(--coral-soft);
  }

  .composer-summary-top .composer-kicker::before {
    background: #a9c275;
  }

  .composer-summary-top h2 {
    margin: 12px 0 10px;
    font-family: Fraunces, Georgia, serif;
    font-size: 28px;
    font-weight: 500;
    letter-spacing: -.035em;
  }

  .composer-summary-top p {
    margin: 0;
    color: rgba(255,255,255,.68);
    font-size: 12px;
    line-height: 1.55;
  }

  .composer-preview {
    margin: 20px 25px;
    padding: 17px;
    background: var(--composer-cream);
    border: 1px solid #e7e9de;
    border-radius: 16px;
  }

  .composer-preview-label {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--composer-olive-dark);
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .11em;
    text-transform: uppercase;
  }

  .composer-preview strong {
    display: block;
    margin-top: 12px;
    font-size: 16px;
  }

  .composer-preview em {
    display: block;
    margin-top: 4px;
    color: var(--composer-muted);
    font-size: 12px;
    font-style: normal;
  }

  .composer-preview p {
    display: -webkit-box;
    overflow: hidden;
    margin: 12px 0 0;
    color: #526056;
    font-size: 12px;
    line-height: 1.55;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .composer-summary-list {
    display: grid;
    gap: 0;
    margin: 0;
    padding: 0 25px;
  }

  .composer-summary-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 13px 0;
    border-bottom: 1px solid #edf0ea;
  }

  .composer-summary-row dt,
  .composer-summary-row dd {
    margin: 0;
    font-size: 12px;
  }

  .composer-summary-row dt {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--composer-muted);
  }

  .composer-summary-row dd {
    max-width: 58%;
    color: var(--composer-ink);
    font-weight: 850;
    text-align: right;
  }

  .composer-summary-highlight {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin: 20px 25px;
  }

  .composer-metric {
    padding: 13px;
    background: var(--surface-soft);
    border: 1px solid var(--border);
    border-radius: 14px;
  }

  .composer-metric small {
    display: block;
    color: var(--composer-muted);
    font-size: 10px;
    font-weight: 800;
  }

  .composer-metric strong {
    display: block;
    margin-top: 5px;
    font-size: 16px;
  }

  .composer-note,
  .composer-success {
    display: flex;
    gap: 10px;
    margin: 0 25px 25px;
    padding: 14px;
    border-radius: 14px;
    font-size: 12px;
    line-height: 1.55;
  }

  .composer-note {
    color: var(--muted);
    background: var(--surface-soft);
    border: 1px dashed var(--border);
  }

  .composer-success {
    color: var(--coral-dark);
    background: var(--coral-soft);
    border: 1px solid var(--border);
  }

  .composer-success strong,
  .composer-success small {
    display: block;
  }

  .composer-success small {
    margin-top: 4px;
  }

  .composer-success button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 10px;
    padding: 0;
    color: var(--coral-dark);
    background: transparent;
    border: 0;
    cursor: pointer;
    font-size: 12px;
    font-weight: 850;
  }

  @media (max-width: 1050px) {
    .composer-layout {
      grid-template-columns: 1fr;
    }

    .composer-summary {
      position: static;
    }
  }

  @media (max-width: 700px) {
    .campaign-composer {
      padding: 24px 14px 48px;
    }

    .composer-hero {
      display: block;
    }

    .composer-mode-badge {
      margin-top: 18px;
    }

    .composer-grid {
      grid-template-columns: 1fr;
    }

    .composer-field.full,
    .composer-fieldset.full {
      grid-column: auto;
    }

    .composer-footer {
      display: grid;
    }

    .composer-submit {
      width: 100%;
    }
  }
`;

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="composer-section-heading">
      <span className="composer-section-number">{number}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="composer-summary-row">
      <dt>
        {icon}
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function CampaignOwnerCreateCampaign() {
  const [location, navigate] = useLocation();

  const editId = new URLSearchParams(
    typeof window !== "undefined"
      ? window.location.search
      : location.split("?")[1] ?? "",
  ).get("edit");

  const existingDraft = editId
    ? readCampaigns().find(
        (campaign) => campaign.id === editId && campaign.status === "Draft",
      )
    : undefined;

  const [form, setForm] = useState<FormState>(() =>
    existingDraft
      ? {
          name: existingDraft.name,
          advertiser: existingDraft.advertiser,
          description: existingDraft.description,
          advertisement: existingDraft.advertisement,
          destinationUrl: existingDraft.destinationUrl,
          platforms: existingDraft.platforms,
          category: existingDraft.category,
          location: existingDraft.location,
          minAudience: existingDraft.minAudience,
          maxAudience: existingDraft.maxAudience,
          duration: existingDraft.duration,
          maxCommunities: existingDraft.maxCommunities,
          cpc: existingDraft.cpc,
          budget: existingDraft.budget,
          startDate: existingDraft.startDate,
          endDate: existingDraft.endDate,
        }
      : emptyForm,
  );

  const [published, setPublished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const editingDraft = Boolean(existingDraft);

  const update = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const togglePlatform = (platform: string) => {
    update(
      "platforms",
      form.platforms.includes(platform)
        ? form.platforms.filter((item) => item !== platform)
        : [...form.platforms, platform],
    );
  };

  const numericValue = (value: string) =>
    Number(value.replace(/[^0-9.]/g, "")) || 0;

  const { advertiserCpc, platformFee, communityOwnerCpc } =
    getCpcBreakdown(form.cpc);

  const maximumQualifiedClicks =
    advertiserCpc > 0
      ? Math.floor(numericValue(form.budget) / advertiserCpc)
      : 0;

  const canPublish = Boolean(
    form.name &&
      form.advertiser &&
      form.description &&
      form.advertisement &&
      form.destinationUrl &&
      form.location &&
      form.minAudience &&
      form.maxAudience &&
      form.maxCommunities &&
      form.cpc &&
      form.budget &&
      form.startDate &&
      form.endDate &&
      form.platforms.length &&
      advertiserCpc > 0 &&
      numericValue(form.budget) > 0,
  );

  const missingFields = [
    ["campaign name", form.name],
    ["advertiser name", form.advertiser],
    ["description", form.description],
    ["advertisement text", form.advertisement],
    ["destination URL", form.destinationUrl],
    ["location", form.location],
    ["minimum audience", form.minAudience],
    ["maximum audience", form.maxAudience],
    ["maximum communities", form.maxCommunities],
    ["CPC", form.cpc],
    ["budget", form.budget],
    ["start date", form.startDate],
    ["end date", form.endDate],
  ]
    .filter(([, value]) => !value)
    .map(([label]) => label);

  if (!form.platforms.length) missingFields.push("a target platform");
  if (form.cpc && advertiserCpc <= 0) missingFields.push("a CPC above zero");
  if (form.budget && numericValue(form.budget) <= 0) {
    missingFields.push("a budget above zero");
  }

  const publish = async (event: FormEvent) => {
    event.preventDefault();
    if (!canPublish || submitting) return;

    const current = readCampaigns();

    if (editingDraft && existingDraft) {
      const updated = current.map((campaign) =>
        campaign.id === existingDraft.id
          ? {
              ...campaign,
              ...form,
              id: existingDraft.id,
              status: "Draft" as const,
              applications: existingDraft.applications,
              placements: existingDraft.placements,
              clicks: existingDraft.clicks,
            }
          : campaign,
      );

      saveCampaigns(updated);
      setPublished(true);
      return;
    }

    let backendCampaignId: string | undefined;

    if (relayBackendEnabled()) {
      setSubmitting(true);

      try {
        const created = await createRelayCampaign({
          name: form.name,
          advertiserName: form.advertiser,
          description: form.description,
          advertisement: form.advertisement,
          destinationUrl: form.destinationUrl,
          platforms: form.platforms,
          minimumAudience:
            Number(form.minAudience.replace(/[^0-9]/g, "")) || 0,
          maximumAudience:
            Number(form.maxAudience.replace(/[^0-9]/g, "")) || 0,
          category: form.category,
          location: form.location,
          durationDays: Number(form.duration.replace(/[^0-9]/g, "")) || 7,
          maximumCommunities:
            Number(form.maxCommunities.replace(/[^0-9]/g, "")) || 0,
          cpc: numericValue(form.cpc),
          budget: numericValue(form.budget),
          startDate: form.startDate,
          endDate: form.endDate,
        });

        backendCampaignId = created.id;
        await transitionRelayCampaign(created.id, "publish");
      } catch (error) {
        setSubmitting(false);
        toast.error("Could not publish the campaign", { description: error instanceof Error ? error.message : "The server rejected this campaign." });
        return;
      }
    }

    const record: CampaignRecord = {
      ...form,
      id: `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      status: "Published",
      applications: 0,
      placements: 0,
      clicks: 0,
    };

    if (backendCampaignId) {
      setRelayBackendId("campaign", record.id, backendCampaignId);
    }

    saveCampaigns([
      record,
      ...current.filter((campaign) => campaign.id !== record.id),
    ]);

    setSubmitting(false);
    setPublished(true);
  };

  return (
    <WorkspaceShell
      active="Create Campaign"
      workspaceLabel="Campaign Owner"
      workspaceMode="campaign-owner"
    >
      <style>{composerStyles}</style>

      <div className="campaign-composer">
        <Link className="composer-back-link" href="/campaign-owner">
          <ArrowLeft size={15} />
          Back to Campaign Owner overview
        </Link>

        <section className="composer-hero">
          <div>
            <span className="composer-eyebrow">
              {editingDraft ? "Edit draft campaign" : "New advertising campaign"}
            </span>
            <h1>{editingDraft ? "Edit your campaign" : "Create a campaign that travels further."}</h1>
            <p>
              {editingDraft
                ? "Update this draft without changing its identity or historical campaign records."
                : "Shape the brief, audience, budget, and approved advertisement that Community Owners will use when deciding whether to apply."}
            </p>
          </div>

          <span className="composer-mode-badge">
            <span />
            Development mode
          </span>
        </section>

        <form className="composer-layout" onSubmit={publish}>
          <main className="composer-form">
            <section className="composer-section">
              <SectionHeading
                number="01"
                title="Campaign details"
                description="Give Community Owners the context they need to decide whether to apply."
              />

              <div className="composer-grid">
                <div className="composer-field">
                  <label htmlFor="campaign-name">Campaign name</label>
                  <input
                    id="campaign-name"
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    placeholder="e.g. Safaricom Home Fibre"
                    required
                  />
                </div>

                <div className="composer-field">
                  <label htmlFor="advertiser-name">Business / advertiser name</label>
                  <input
                    id="advertiser-name"
                    value={form.advertiser}
                    onChange={(event) => update("advertiser", event.target.value)}
                    placeholder="e.g. Safaricom"
                    required
                  />
                </div>

                <div className="composer-field full">
                  <label htmlFor="campaign-description">Campaign description</label>
                  <textarea
                    id="campaign-description"
                    value={form.description}
                    onChange={(event) => update("description", event.target.value)}
                    placeholder="What is this campaign trying to achieve?"
                    rows={4}
                    required
                  />
                </div>
              </div>
            </section>

            <section className="composer-section">
              <SectionHeading
                number="02"
                title="Advertisement"
                description="This approved text will be shown to selected Community Owners."
              />

              <div className="composer-grid">
                <div className="composer-field full">
                  <label htmlFor="advertisement-text">Advertisement text</label>
                  <textarea
                    id="advertisement-text"
                    value={form.advertisement}
                    onChange={(event) => update("advertisement", event.target.value)}
                    placeholder="Write the exact copy communities should post."
                    rows={5}
                    required
                  />
                  <small className="composer-helper">
                    Keep this copy ready to publish. Community Owners will see the approved version.
                  </small>
                </div>

                <div className="composer-field full">
                  <label htmlFor="destination-url">Destination URL</label>
                  <input
                    id="destination-url"
                    type="url"
                    value={form.destinationUrl}
                    onChange={(event) => update("destinationUrl", event.target.value)}
                    placeholder="https://yourbrand.co.ke/offer"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="composer-section">
              <SectionHeading
                number="03"
                title="Audience targeting"
                description="Set the communities and audiences that are eligible to apply."
              />

              <div className="composer-grid">
                <fieldset className="composer-fieldset full">
                  <legend>Target platforms</legend>
                  <div className="composer-platforms">
                    {platformOptions.map((platform) => (
                      <label className="composer-platform" key={platform}>
                        <input
                          type="checkbox"
                          checked={form.platforms.includes(platform)}
                          onChange={() => togglePlatform(platform)}
                        />
                        <span>{platform}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="composer-field">
                  <label htmlFor="campaign-category">Target category</label>
                  <select
                    id="campaign-category"
                    value={form.category}
                    onChange={(event) => update("category", event.target.value)}
                  >
                    {categoryOptions.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="composer-field">
                  <label htmlFor="campaign-location">Target location</label>
                  <input
                    id="campaign-location"
                    value={form.location}
                    onChange={(event) => update("location", event.target.value)}
                    placeholder="e.g. Nairobi & Kiambu"
                    required
                  />
                </div>

                <div className="composer-field">
                  <label htmlFor="minimum-audience">Minimum audience size</label>
                  <input
                    id="minimum-audience"
                    value={form.minAudience}
                    onChange={(event) => update("minAudience", event.target.value)}
                    placeholder="e.g. 5,000"
                    required
                  />
                </div>

                <div className="composer-field">
                  <label htmlFor="maximum-audience">Maximum audience size</label>
                  <input
                    id="maximum-audience"
                    value={form.maxAudience}
                    onChange={(event) => update("maxAudience", event.target.value)}
                    placeholder="e.g. 50,000"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="composer-section">
              <SectionHeading
                number="04"
                title="Budget and timing"
                description="Control the campaign window, placement volume, and spend."
              />

              <div className="composer-grid">
                <div className="composer-field">
                  <label htmlFor="campaign-duration">Campaign duration</label>
                  <select
                    id="campaign-duration"
                    value={form.duration}
                    onChange={(event) => update("duration", event.target.value)}
                  >
                    <option>3 days</option>
                    <option>5 days</option>
                    <option>7 days</option>
                    <option>10 days</option>
                    <option>14 days</option>
                    <option>30 days</option>
                  </select>
                </div>

                <div className="composer-field">
                  <label htmlFor="maximum-communities">Maximum number of communities</label>
                  <input
                    id="maximum-communities"
                    value={form.maxCommunities}
                    onChange={(event) => update("maxCommunities", event.target.value)}
                    placeholder="e.g. 6"
                    required
                  />
                </div>

                <div className="composer-field">
                  <label htmlFor="campaign-cpc">Cost per click (CPC)</label>
                  <input
                    id="campaign-cpc"
                    value={form.cpc}
                    onChange={(event) => update("cpc", event.target.value)}
                    placeholder={`e.g. ${formatMoney(2, 2)}`}
                    required
                  />
                  <small className="composer-helper">
                    Amount paid for each qualified click generated by participating communities.
                  </small>
                </div>

                <div className="composer-field">
                  <label htmlFor="campaign-budget">Total campaign budget</label>
                  <input
                    id="campaign-budget"
                    value={form.budget}
                    onChange={(event) => update("budget", event.target.value)}
                    placeholder={`e.g. ${formatMoney(108000)}`}
                    required
                  />
                </div>

                <div className="composer-field">
                  <label htmlFor="campaign-start-date">Start date</label>
                  <input
                    id="campaign-start-date"
                    type="date"
                    value={form.startDate}
                    onChange={(event) => update("startDate", event.target.value)}
                    required
                  />
                </div>

                <div className="composer-field">
                  <label htmlFor="campaign-end-date">End date</label>
                  <input
                    id="campaign-end-date"
                    type="date"
                    value={form.endDate}
                    onChange={(event) => update("endDate", event.target.value)}
                    required
                  />
                </div>
              </div>
            </section>

            <div className="composer-footer">
              <span className="composer-footer-note">
                <FileText size={15} />
                {missingFields.length
                  ? `Still needed: ${missingFields.join(", ")}.`
                  : relayBackendEnabled() ? "Your campaign will be saved to your account when you publish." : "Your campaign is saved locally in this development workspace."}
              </span>

              <button
                className="composer-submit"
                type="submit"
                disabled={!canPublish || submitting}
              >
                <Send size={15} />
                {published
                  ? editingDraft
                    ? "Draft Saved"
                    : "Published"
                  : submitting
                    ? "Publishing..."
                    : editingDraft
                      ? "Save Draft"
                      : "Publish Campaign"}
              </button>
            </div>
          </main>

          <aside className="composer-summary" aria-label="Campaign summary">
            <div className="composer-summary-top">
              <span className="composer-kicker">
                {published ? "Ready to share" : "Before publishing"}
              </span>
              <h2>Campaign summary</h2>
              <p>
                A live preview of the information Community Owners will use when evaluating this campaign.
              </p>
            </div>

            <div className="composer-preview">
              <span className="composer-preview-label">
                <Sparkles size={12} />
                Community Owner preview
              </span>
              <strong>{form.name || "Your campaign name"}</strong>
              <em>{form.advertiser || "Business / advertiser"}</em>
              <p>{form.description || "Your campaign description will appear here."}</p>
            </div>

            <dl className="composer-summary-list">
              <SummaryRow
                label="Platforms"
                value={form.platforms.length ? form.platforms.join(", ") : "Select platforms"}
                icon={<Globe2 size={13} />}
              />
              <SummaryRow
                label="Audience"
                value={`${form.minAudience || "—"} – ${form.maxAudience || "—"} members`}
                icon={<Target size={13} />}
              />
              <SummaryRow label="Location" value={form.location || "—"} />
              <SummaryRow label="Duration" value={form.duration} />
              <SummaryRow label="Communities" value={`Up to ${form.maxCommunities || "—"}`} />
              <SummaryRow label="Cost per click" value={form.cpc ? formatMoney(numericValue(form.cpc), 2) : "—"} />
              <SummaryRow
                label="Community owner earns"
                value={communityOwnerCpc ? `${formatMoney(communityOwnerCpc, 2)} / click` : "—"}
              />
              <SummaryRow
                label="Platform fee"
                value={platformFee ? `${formatMoney(platformFee, 2)} / click` : "—"}
              />
              <SummaryRow
                label="Campaign dates"
                value={`${form.startDate || "—"} → ${form.endDate || "—"}`}
              />
            </dl>

            <div className="composer-summary-highlight">
              <div className="composer-metric">
                <small>Maximum billable clicks</small>
                <strong>
                  {maximumQualifiedClicks
                    ? maximumQualifiedClicks.toLocaleString("en-KE")
                    : "—"}
                </strong>
              </div>
              <div className="composer-metric">
                <small>Total campaign budget</small>
                <strong>{form.budget ? formatMoney(numericValue(form.budget)) : "—"}</strong>
              </div>
            </div>

            {published ? (
              <div className="composer-success">
                <CheckCircle2 size={17} />
                <span>
                  <strong>{editingDraft ? "Draft saved" : "Campaign published"}</strong>
                  <small>
                    {editingDraft
                      ? "Your campaign ID and historical records were preserved."
                      : "Community Owners can now discover and apply."}
                  </small>
                  <button type="button" onClick={() => navigate("/campaign-owner/campaigns")}>
                    Open My Campaigns <ChevronRight size={13} />
                  </button>
                </span>
              </div>
            ) : (
              <div className="composer-note">
                <Wallet size={16} />
                <span>
                  Publishing makes this campaign visible to matching Community Owners. They can apply, and you can review their applications.
                </span>
              </div>
            )}
          </aside>
        </form>
      </div>
    </WorkspaceShell>
  );
}

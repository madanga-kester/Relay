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
import { Eye, ImagePlus, X } from "lucide-react";
import { compressImageToDataUrl } from "@/lib/imageUtils";
import { AD_PREVIEW_KEY } from "./CampaignOwnerAdPreview";

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

type CampaignMedia = { mediaImage?: string; mediaVideoUrl?: string };

type FormState = Omit<
  CampaignRecord,
  "id" | "status" | "applications" | "placements" | "clicks"
> &
  CampaignMedia;

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
          mediaImage: (existingDraft as CampaignRecord & CampaignMedia).mediaImage,
          mediaVideoUrl: (existingDraft as CampaignRecord & CampaignMedia).mediaVideoUrl,
        }
      : emptyForm,
  );

  const [published, setPublished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const editingDraft = Boolean(existingDraft);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [mediaError, setMediaError] = useState("");

  const attachImage = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setMediaError("");
    setMediaBusy(true);
    try {
      const dataUrl = await compressImageToDataUrl(file, 1200);
      setForm((current) => ({ ...current, mediaImage: dataUrl }));
    } catch (error) {
      setMediaError(
        error instanceof Error ? error.message : "Could not add this image.",
      );
    }
    setMediaBusy(false);
  };

  const removeImage = () => {
    setMediaError("");
    setForm((current) => ({ ...current, mediaImage: undefined }));
  };

  const videoUrlValid =
    !form.mediaVideoUrl || /^https?:\/\//i.test(form.mediaVideoUrl.trim());
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

  const openPreview = () => {
    try {
      window.localStorage.setItem(
        AD_PREVIEW_KEY,
        JSON.stringify({
          name: form.name,
          advertiser: form.advertiser,
          advertisement: form.advertisement,
          destinationUrl: form.destinationUrl,
          platforms: form.platforms,
          mediaImage: form.mediaImage,
          mediaVideoUrl: form.mediaVideoUrl,
          description: form.description,
          category: form.category,
          location: form.location,
          minAudience: form.minAudience,
          maxAudience: form.maxAudience,
          duration: form.duration,
          maxCommunities: form.maxCommunities,
          cpc: form.cpc,
          budget: form.budget,
          startDate: form.startDate,
          endDate: form.endDate,
        }),
      );
    } catch {
      toast.error("Preview could not be prepared", {
        description: "Browser storage is full. Remove the image or free some space, then try again.",
      });
      return;
    }
    window.open("/campaign-owner/ad-preview", "relay-ad-preview");
  };
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
      numericValue(form.budget) > 0 &&
      videoUrlValid,
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
  if (!videoUrlValid) {
    missingFields.push("a video link starting with http:// or https://");
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
    

      <div className="campaign-composer">
       

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


                
                <div className="composer-field full">
                  <label htmlFor="campaign-image">Advertisement image (optional)</label>
                  <input
                    id="campaign-image"
                    type="file"
                    accept="image/*"
                    disabled={mediaBusy}
                    onChange={(event) => {
                      void attachImage(event.target.files);
                      event.target.value = "";
                    }}
                  />
                  {mediaBusy && <small className="composer-helper">Processing image...</small>}
                  {mediaError && <small role="alert" className="composer-helper">{mediaError}</small>}
                  {form.mediaImage && (
                    <div style={{ position: "relative", marginTop: 10, maxWidth: 360 }}>
                      <img
                        src={form.mediaImage}
                        alt="Advertisement preview"
                        style={{ width: "100%", borderRadius: 10, display: "block" }}
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        aria-label="Remove image"
                        title="Remove image"
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          width: 28,
                          height: 28,
                          display: "grid",
                          placeItems: "center",
                          padding: 0,
                          border: "none",
                          borderRadius: "50%",
                          cursor: "pointer",
                          color: "#fff",
                          background: "rgba(0,0,0,0.65)",
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  {!form.mediaImage && !mediaBusy && (
                    <small className="composer-helper">
                      <ImagePlus size={12} /> One image that Community Owners will post with your text.
                    </small>
                  )}
                </div>

                <div className="composer-field full">
                  <label htmlFor="campaign-video-url">Advertisement video link (optional)</label>
                  <input
                    id="campaign-video-url"
                    type="url"
                    value={form.mediaVideoUrl ?? ""}
                    onChange={(event) => update("mediaVideoUrl", event.target.value)}
                    onBlur={(event) => update("mediaVideoUrl", event.target.value.trim())}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <small className="composer-helper">
                    Paste a link to a video hosted elsewhere, such as YouTube. Video files are not uploaded here.
                  </small>
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

              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  onClick={openPreview}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "inherit",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  <Eye size={15} /> View ad preview
                </button>
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
              {form.mediaImage && (
                <img
                  src={form.mediaImage}
                  alt="Advertisement preview"
                  style={{ width: "100%", borderRadius: 8, marginTop: 10, display: "block" }}
                />
              )}
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

import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  LayoutGrid,
  Link2,
  List,
  MousePointer2,
  UsersRound,
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useCurrency } from "@/lib/currency";

const acceptedCampaigns = [
  {
    slug: "loop-finance",
    advertiser: "Loop Finance",
    title: "Build a calmer money routine",
    community: "After Hours",
    platform: "Discord",
    link: "relay.to/go/after-hours/campaign-4821",
    clicks: "284",
    visitors: "231",
    earnings: 1200,
    remaining: "12 days",
    deadline: "Jul 04",
  },
  {
    slug: "moss-market",
    advertiser: "Moss Market",
    title: "Weekend plans, made easier",
    community: "Sunday Selects",
    platform: "WhatsApp",
    link: "relay.to/go/sunday-selects/campaign-4822",
    clicks: "167",
    visitors: "139",
    earnings: 720,
    remaining: "18 days",
    deadline: "Jul 11",
  },
  {
    slug: "studio-notes",
    advertiser: "Studio Notes",
    title: "A better creative workflow",
    community: "Design Dispatch",
    platform: "Telegram",
    link: "relay.to/go/design-dispatch/campaign-4823",
    clicks: "96",
    visitors: "82",
    earnings: 540,
    remaining: "21 days",
    deadline: "Jul 22",
  },
];

const styles = `
.accepted-page {
  max-width: 1100px;
}

.accepted-page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 20px;
}

.accepted-page-summary {
  display: grid;
  gap: 2px;
  padding: 12px 16px;
  border: 1px solid #e4e4e7;
  border-radius: 10px;
  background: #fff;
  text-align: right;
  min-width: 110px;
}

.accepted-page-summary strong {
  font-size: 22px;
  font-weight: 700;
  color: #18181b;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.accepted-page-summary span {
  font-size: 12px;
  color: #71717a;
  font-weight: 500;
}

.accepted-page-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid #e4e4e7;
  border-radius: 10px;
  background: #fafafa;
  color: #3f3f46;
  font-size: 13.5px;
  line-height: 1.45;
  margin-bottom: 24px;
}

.accepted-page-note svg {
  flex-shrink: 0;
  margin-top: 1px;
  color: #71717a;
}

.accepted-view-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
}

.accepted-view-toolbar strong {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #18181b;
}

.accepted-view-toolbar span {
  font-size: 12.5px;
  color: #71717a;
}

.accepted-view-toggle {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border-radius: 8px;
  background: #f4f4f5;
  border: 1px solid #e4e4e7;
}

.accepted-view-toggle button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 32px;
  padding: 0 11px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #71717a;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}

.accepted-view-toggle button:hover {
  color: #3f3f46;
  background: #e4e4e7;
}

.accepted-view-toggle button.accepted-view-active {
  color: #18181b;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
}

/* Cards / List container */
.accepted-campaign-grid {
  display: grid;
  gap: 10px;
}

.accepted-campaign-cards-view {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.accepted-campaign-list-view {
  grid-template-columns: 1fr;
}

/* Card */
.accepted-campaign-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  background: #fff;
  transition: border-color 0.15s ease;
}

.accepted-campaign-card:hover {
  border-color: #a1a1aa;
}

.accepted-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.accepted-card-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
  margin-bottom: 6px;
}

.accepted-card-status span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #16a34a;
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.25);
  animation: pulse-dot 1.8s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.accepted-card-top h2 {
  margin: 0 0 3px;
  font-size: 15px;
  font-weight: 650;
  color: #18181b;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.accepted-card-top p {
  margin: 0;
  font-size: 13px;
  color: #71717a;
}

.accepted-card-icon {
  color: #a1a1aa;
  flex-shrink: 0;
}

.accepted-card-link {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  background: #fafafa;
  border: 1px solid #f4f4f5;
  border-radius: 8px;
}

.accepted-card-link small {
  font-size: 11px;
  font-weight: 500;
  color: #a1a1aa;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.accepted-card-link code {
  font-size: 12.5px;
  color: #3f3f46;
  word-break: break-all;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.accepted-card-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.accepted-card-stats > span {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  background: #fafafa;
  border-radius: 8px;
}

.accepted-card-stats svg {
  color: #71717a;
  margin-bottom: 2px;
}

.accepted-card-stats strong {
  font-size: 15px;
  font-weight: 650;
  color: #18181b;
  letter-spacing: -0.01em;
}

.accepted-card-stats small {
  font-size: 11px;
  color: #71717a;
  font-weight: 500;
}

.metric-currency {
  font-size: 11px;
  color: #71717a;
  font-weight: 500;
  margin-bottom: 1px;
}

.accepted-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 2px;
}

.accepted-card-footer > span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  color: #71717a;
}

.accepted-workspace-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 12px;
  border-radius: 8px;
  background: #18181b;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.12s ease;
}

.accepted-workspace-button:hover {
  background: #3f3f46;
}

/* List view adjustments */
.accepted-campaign-list-view .accepted-campaign-card {
  flex-direction: row;
  align-items: center;
  gap: 20px;
  padding: 14px 16px;
}

.accepted-campaign-list-view .accepted-card-top {
  flex: 1.4;
  min-width: 0;
}

.accepted-campaign-list-view .accepted-card-link {
  flex: 1.2;
  min-width: 0;
}

.accepted-campaign-list-view .accepted-card-stats {
  flex: 1;
  grid-template-columns: repeat(3, 1fr);
}

.accepted-campaign-list-view .accepted-card-footer {
  flex: 0 0 auto;
  margin-top: 0;
  padding-top: 0;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.accepted-page-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 28px;
  padding-top: 16px;
  border-top: 1px solid #f4f4f5;
  font-size: 13px;
  color: #71717a;
}

@media (max-width: 800px) {
  .accepted-campaign-list-view .accepted-campaign-card {
    flex-direction: column;
    align-items: stretch;
  }
  .accepted-campaign-list-view .accepted-card-footer {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .accepted-card-stats {
    grid-template-columns: repeat(3, 1fr);
  }
}
`;

export default function AcceptedCampaigns() {
  const { format } = useCurrency();
  const currencyLabel = format(0).split(" ")[0];
  const [view, setView] = useState<"list" | "cards">("list");

  return (
    <WorkspaceShell active="Campaigns">
      <div className="dashboard-body accepted-page">
        <style>{styles}</style>

        <Link className="hero-link route-back-link" href="/campaigns">
          <ArrowLeft size={15} /> Back to campaigns
        </Link>

        <section className="route-page-heading accepted-page-heading">
          <div>
            <span className="section-kicker">
              <span className="section-kicker-line" /> Campaign tracking
            </span>
            <h1>Accepted campaigns</h1>
            <p>
              Open a campaign to copy its tracking link, post the approved ad, and follow
              results for that community.
            </p>
          </div>
          <div className="accepted-page-summary">
            <strong>{acceptedCampaigns.length}</strong>
            <span>active campaigns</span>
          </div>
        </section>

        <div className="accepted-page-note">
          <Link2 size={16} />
          <span>
            Every campaign has its own link connected to the advertiser, campaign, community,
            and you as the owner.
          </span>
        </div>

        <div className="accepted-view-toolbar">
          <div>
            <strong>Your active campaigns</strong>
            <span>{acceptedCampaigns.length} campaigns</span>
          </div>
          <div className="accepted-view-toggle" role="group" aria-label="Change campaign view">
            <button
              className={view === "list" ? "accepted-view-active" : ""}
              onClick={() => setView("list")}
              aria-label="List view"
            >
              <List size={15} /> List
            </button>
            <button
              className={view === "cards" ? "accepted-view-active" : ""}
              onClick={() => setView("cards")}
              aria-label="Card view"
            >
              <LayoutGrid size={15} /> Cards
            </button>
          </div>
        </div>

        <section
          className={`accepted-campaign-grid ${
            view === "list" ? "accepted-campaign-list-view" : "accepted-campaign-cards-view"
          }`}
        >
          {acceptedCampaigns.map((campaign) => (
            <article className="accepted-campaign-card" key={campaign.slug}>
              <div className="accepted-card-top">
                <div>
                  <span className="accepted-card-status">
                    <span /> Active
                  </span>
                  <h2>{campaign.title}</h2>
                  <p>
                    {campaign.advertiser} · {campaign.community} · {campaign.platform}
                  </p>
                </div>
                <span className="accepted-card-icon">
                  <BarChart3 size={18} />
                </span>
              </div>

              <div className="accepted-card-link">
                <small>Tracking link</small>
                <code>{campaign.link}</code>
              </div>

              <div className="accepted-card-stats">
                <span>
                  <MousePointer2 size={14} />
                  <strong>{campaign.clicks}</strong>
                  <small>clicks</small>
                </span>
                <span>
                  <UsersRound size={14} />
                  <strong>{campaign.visitors}</strong>
                  <small>visitors</small>
                </span>
                <span>
                  <span className="metric-currency">{currencyLabel}</span>
                  <strong>
                    {format(campaign.earnings, 0).replace(`${currencyLabel} `, "")}
                  </strong>
                  <small>earned</small>
                </span>
              </div>

              <div className="accepted-card-footer">
                <span>
                  <CalendarDays size={13} /> {campaign.remaining} · Ends {campaign.deadline}
                </span>
                <Link
                  href={`/campaigns/${campaign.slug}/workspace`}
                  className="accepted-workspace-button"
                >
                  Open campaign <ArrowUpRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </section>

        <div className="accepted-page-footer">
          <CheckCircle2 size={15} />
          Clicks are counted only when someone opens your tracked destination after leaving
          their community app.
        </div>
      </div>
    </WorkspaceShell>
  );
}
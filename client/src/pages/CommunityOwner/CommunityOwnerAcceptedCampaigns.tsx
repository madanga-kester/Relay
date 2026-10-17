import {

  ArrowUpRight,

  CalendarDays,

  CheckCircle2,

  Clock3,

  LayoutGrid,

  Link2,

  List,

  MousePointer2,

  Search,

  UsersRound,

} from "lucide-react";

import { Link } from "wouter";

import { useState, useMemo } from "react";

import WorkspaceShell from "@/components/WorkspaceShell";

import { getAcceptedCommunityCampaigns, readApplications } from "../CampaignOwner/applicationData";

import { useAcceptedCampaigns } from "./useAcceptedCampaigns";

export type AcceptedCommunityCampaign = {

  id: string;

  placementId?: string;

  name: string;

  advertiser: string;

  community: string;

  platform: string;

  duration: string;

  earnings: string;

  payoutPerClick?: string;

  totalEarnings?: string;

  qualifiedClicks?: number;

  status: "Ready to Post" | "Active" | "Completed";

  clicks: string;

  startDate: string;

  endDate: string;

  trackingLink: string;

  advertisement: string;

  instructions: string[];

  appliedAt?: string;

  acceptedAt?: string;

};

export const acceptedCommunityCampaigns: AcceptedCommunityCampaign[] = [];

function statusClass(status: AcceptedCommunityCampaign["status"]) {

  return `community-accepted-status community-accepted-status-${status

    .toLowerCase()

    .replaceAll(" ", "-")}`;

}

export function getAllAcceptedCommunityCampaigns() {

  return [...getAcceptedCommunityCampaigns(readApplications()), ...acceptedCommunityCampaigns];

}

const listPageStyles = `

.community-accepted-summary-wrapper {

  display: flex;

  gap: 10px;

  flex-wrap: wrap;

}

.community-accepted-summary {

  min-width: 120px;

  padding: 12px 16px;

  border: 1px solid #e4e4e7;

  border-radius: 10px;

  background: #fff;

  display: grid;

  gap: 2px;

}

.community-accepted-summary strong {

  color: #18181b;

  font-size: 20px;

  font-weight: 700;

  letter-spacing: -0.02em;

  line-height: 1.2;

}

.community-accepted-summary span {

  color: #71717a;

  font-size: 12px;

  font-weight: 500;

}

.community-accepted-summary.earnings-summary {

  border-color: #d4d4d8;

  background: #fafafa;

}

.community-accepted-summary.earnings-summary strong {

  color: #18181b;

}

.community-view-toggle {

  display: inline-flex;

  gap: 2px;

  padding: 2px;

  border-radius: 8px;

  background: #f4f4f5;

  border: 1px solid #e4e4e7;

}

.community-view-toggle button {

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

.community-view-toggle button:hover {

  color: #3f3f46;

  background: #e4e4e7;

}

.community-view-toggle button.active {

  color: #18181b;

  background: #fff;

  box-shadow: 0 1px 2px rgba(0,0,0,0.06);

}

.community-accepted-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0;
  white-space: nowrap;
  user-select: none;
}

.community-accepted-status span {
  width: 6px;
  height: 6px;
  border-radius: 2px;
  flex: 0 0 6px;
}

.community-accepted-status-ready-to-post {
  color: #a16207;
}

.community-accepted-status-ready-to-post span {
  background: #d97706;
}

.community-accepted-status-active {
  color: #15803d;
}

.community-accepted-status-active span {
  background: #16a34a;
}

.community-accepted-status-completed {
  color: #71717a;
}

.community-accepted-status-completed span {
  background: #a1a1aa;
}

.community-accepted-list {

  display: grid;

  gap: 8px;

}

.community-accepted-list-row {

  display: grid;

  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 0.9fr) minmax(0, 0.9fr) auto;

  gap: 14px;

  align-items: center;

  padding: 14px 16px;

  border: 1px solid #e4e4e7;

  border-radius: 10px;

  background: #fff;

  transition: border-color 0.15s ease;

}

.community-accepted-list-row:hover {

  border-color: #a1a1aa;

}

.community-accepted-list-main h2 {

  margin: 4px 0 1px;

  color: #18181b;

  font-size: 14px;

  font-weight: 650;

  letter-spacing: -0.01em;

}

.community-accepted-list-main p {

  margin: 0;

  color: #71717a;

  font-size: 12.5px;

}

.community-accepted-list-cell {

  display: grid;

  gap: 2px;

  min-width: 0;

}

.community-accepted-list-cell small {

  color: #a1a1aa;

  font-size: 10.5px;

  font-weight: 500;

  text-transform: uppercase;

  letter-spacing: 0.03em;

}

.community-accepted-list-cell strong {

  color: #27272a;

  font-size: 13px;

  font-weight: 550;

  overflow-wrap: anywhere;

}

.community-accepted-list-actions {

  display: flex;

  align-items: center;

  gap: 10px;

  justify-content: flex-end;

}

@media (max-width: 900px) {

  .community-accepted-list-row {

    grid-template-columns: 1fr 1fr;

    gap: 10px;

  }

  .community-accepted-list-actions {

    grid-column: 1 / -1;

    justify-content: flex-start;

  }

}

@media (max-width: 560px) {

  .community-accepted-list-row {

    grid-template-columns: 1fr;

  }

}

`;

export default function CommunityOwnerAcceptedCampaigns() {

  const { campaigns, loaded } = useAcceptedCampaigns();

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState<string>("All");

  const [platformFilter, setPlatformFilter] = useState<string>("All");

  const [sortBy, setSortBy] = useState<"newest" | "earnings" | "clicks">("newest");

  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  const availablePlatforms = useMemo(() => {

    const platforms = new Set(campaigns.map((c) => c.platform));

    return ["All", ...Array.from(platforms)];

  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {

    return campaigns

      .filter((campaign) => {

        const matchesSearch =

          campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||

          campaign.advertiser.toLowerCase().includes(searchQuery.toLowerCase()) ||

          campaign.community.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "All" || campaign.status === statusFilter;

        const matchesPlatform = platformFilter === "All" || campaign.platform === platformFilter;

        return matchesSearch && matchesStatus && matchesPlatform;

      })

      .sort((a, b) => {

        if (sortBy === "newest") {

          const dateA = a.acceptedAt ? new Date(a.acceptedAt).getTime() : 0;

          const dateB = b.acceptedAt ? new Date(b.acceptedAt).getTime() : 0;

          return dateB - dateA;

        }

        if (sortBy === "clicks") {

          const clicksA = a.qualifiedClicks ?? parseInt(a.clicks) ?? 0;

          const clicksB = b.qualifiedClicks ?? parseInt(b.clicks) ?? 0;

          return clicksB - clicksA;

        }

        if (sortBy === "earnings") {

          const earnA = parseFloat((a.totalEarnings ?? "0").replace(/[^0-9.]/g, "")) || 0;

          const earnB = parseFloat((b.totalEarnings ?? "0").replace(/[^0-9.]/g, "")) || 0;

          return earnB - earnA;

        }

        return 0;

      });

  }, [campaigns, searchQuery, statusFilter, platformFilter, sortBy]);

  const summaryStats = useMemo(() => {

    const totalAccepted = campaigns.length;

    const activeCount = campaigns.filter(

      (c) => c.status === "Active" || c.status === "Ready to Post"

    ).length;

    const completedCount = campaigns.filter((c) => c.status === "Completed").length;

    const aggregateEarnings = campaigns.reduce((acc, curr) => {

      const val = parseFloat((curr.totalEarnings ?? "0").replace(/[^0-9.]/g, "")) || 0;

      return acc + val;

    }, 0);

    return { totalAccepted, activeCount, completedCount, aggregateEarnings };

  }, [campaigns]);

  return (

    <WorkspaceShell

      active="Accepted Campaigns"

      workspaceLabel="Community Owner"

      workspaceMode="community-owner"

    >

      <div className="dashboard-body community-accepted-page">

        <style>{listPageStyles}</style>

        {/* Header */}

        <section className="community-accepted-heading">

          <div>

            <span className="section-kicker">

              <span className="section-kicker-line" /> Campaigns approved by Campaign Owners

            </span>

            <h1>Accepted Campaigns</h1>

            <p>

              These applications were approved. You earn from qualified clicks generated after

              posting the approved advertisement.

            </p>

          </div>

          <div className="community-accepted-summary-wrapper">

            <div className="community-accepted-summary">

              <strong>{summaryStats.totalAccepted}</strong>

              <span>accepted campaigns</span>

            </div>

            <div className="community-accepted-summary">

              <strong>{summaryStats.activeCount}</strong>

              <span>active / ready</span>

            </div>

            <div className="community-accepted-summary earnings-summary">

              <strong>

                KSh {summaryStats.aggregateEarnings.toLocaleString("en-KE", {

                  minimumFractionDigits: 2,

                  maximumFractionDigits: 2,

                })}

              </strong>

              <span>total earnings</span>

            </div>

          </div>

        </section>

        {/* Note */}

        <div className="community-accepted-note">

          <CheckCircle2 size={16} />

          <span>

            Only campaigns accepted by a Campaign Owner appear here. Payout is based on qualified

            clicks, not simply on posting.

          </span>

        </div>

        {/* Toolbar */}

        <div

          className="community-accepted-toolbar"

          style={{

            display: "flex",

            flexWrap: "wrap",

            gap: "12px",

            margin: "20px 0",

            alignItems: "center",

            justifyContent: "space-between",

          }}

        >

          <div className="community-search-box" style={{ position: "relative", flex: "1 1 280px" }}>

            <Search

              size={16}

              style={{

                position: "absolute",

                left: "12px",

                top: "50%",

                transform: "translateY(-50%)",

                color: "var(--text-muted, #94a3b8)",

              }}

            />

            <input

              type="text"

              placeholder="Search by campaign, advertiser, or community..."

              value={searchQuery}

              onChange={(e) => setSearchQuery(e.target.value)}

              style={{

                width: "100%",

                padding: "10px 12px 10px 38px",

                borderRadius: "8px",

                border: "1px solid var(--border-color, #e2e8f0)",

                background: "var(--surface, #fff)",

              }}

            />

          </div>

          <div className="community-filters" style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>

            <select

              value={statusFilter}

              onChange={(e) => setStatusFilter(e.target.value)}

              style={{

                padding: "10px 12px",

                borderRadius: "8px",

                border: "1px solid var(--border-color, #e2e8f0)",

                background: "var(--surface, #fff)",

              }}

            >

              <option value="All">All Statuses</option>

              <option value="Ready to Post">Ready to Post</option>

              <option value="Active">Active</option>

              <option value="Completed">Completed</option>

            </select>

            <select

              value={platformFilter}

              onChange={(e) => setPlatformFilter(e.target.value)}

              style={{

                padding: "10px 12px",

                borderRadius: "8px",

                border: "1px solid var(--border-color, #e2e8f0)",

                background: "var(--surface, #fff)",

              }}

            >

              {availablePlatforms.map((plat) => (

                <option key={plat} value={plat}>

                  {plat === "All" ? "All Platforms" : plat}

                </option>

              ))}

            </select>

            <select

              value={sortBy}

              onChange={(e) => setSortBy(e.target.value as "newest" | "earnings" | "clicks")}

              style={{

                padding: "10px 12px",

                borderRadius: "8px",

                border: "1px solid var(--border-color, #e2e8f0)",

                background: "var(--surface, #fff)",

              }}

            >

              <option value="newest">Sort by: Newest Accepted</option>

              <option value="earnings">Sort by: Highest Earnings</option>

              <option value="clicks">Sort by: Most Clicks</option>

            </select>

            {/* Card / List toggle */}

            <div className="community-view-toggle" role="group" aria-label="View mode">

              <button

                type="button"

                className={viewMode === "cards" ? "active" : ""}

                onClick={() => setViewMode("cards")}

                aria-pressed={viewMode === "cards"}

              >

                <LayoutGrid size={15} /> Cards

              </button>

              <button

                type="button"

                className={viewMode === "list" ? "active" : ""}

                onClick={() => setViewMode("list")}

                aria-pressed={viewMode === "list"}

              >

                <List size={15} /> List

              </button>

            </div>

          </div>

        </div>

        {/* Cards view */}

        {viewMode === "cards" && (

          <section className="community-accepted-grid">

            {filteredCampaigns.map((campaign) => (

              <article className="community-accepted-card" key={campaign.id}>

                <div className="community-accepted-card-top">

                  <div>

                    <span className={statusClass(campaign.status)}>

                      <span /> {campaign.status}

                    </span>

                    <h2>{campaign.name}</h2>

                    <p>{campaign.advertiser}</p>

                  </div>

                  <span className="community-accepted-card-icon">

                    <Link2 size={18} />

                  </span>

                </div>

                <div className="community-accepted-meta">

                  <span>

                    <small>Selected community</small>

                    <strong>

                      <UsersRound size={12} /> {campaign.community}

                    </strong>

                  </span>

                  <span>

                    <small>Platform</small>

                    <strong>{campaign.platform}</strong>

                  </span>

                  <span>

                    <small>Duration</small>

                    <strong>{campaign.duration}</strong>

                  </span>

                  <span>

                    <small>Payout / qualified click</small>

                    <strong>{campaign.payoutPerClick ?? campaign.earnings}</strong>

                  </span>

                  <span>

                    <small>Total earnings</small>

                    <strong>{campaign.totalEarnings ?? "KSh 0.00"}</strong>

                  </span>

                  <span>

                    <small>Qualified clicks</small>

                    <strong>

                      <MousePointer2 size={12} /> {campaign.qualifiedClicks ?? campaign.clicks}

                    </strong>

                  </span>

                  <span>

                    <small>Start · end date</small>

                    <strong>

                      <CalendarDays size={12} /> {campaign.startDate} – {campaign.endDate}

                    </strong>

                  </span>

                  {campaign.appliedAt && (

                    <span>

                      <small>Applied on</small>

                      <strong>

                        <CalendarDays size={12} /> {new Date(campaign.appliedAt).toLocaleString()}

                      </strong>

                    </span>

                  )}

                  {campaign.acceptedAt && (

                    <span>

                      <small>Accepted on</small>

                      <strong>

                        <CheckCircle2 size={12} /> {new Date(campaign.acceptedAt).toLocaleString()}

                      </strong>

                    </span>

                  )}

                </div>

                <div className="community-accepted-card-footer">

                  <span

                    className={

                      campaign.status === "Completed"

                        ? "community-completed-label"

                        : "community-pending-label"

                    }

                  >

                    {campaign.status === "Completed" ? (

                      <CheckCircle2 size={14} />

                    ) : campaign.status === "Active" ? (

                      <CheckCircle2 size={14} />

                    ) : (

                      <Clock3 size={14} />

                    )}{" "}

                    {campaign.status === "Ready to Post"

                      ? "Needs posting"

                      : campaign.status === "Active"

                      ? "Live"

                      : campaign.status}

                  </span>

                  <Link

                    className="community-campaign-link"

                    href={`/community-owner/accepted-campaigns/${campaign.id}`}

                  >

                    Open campaign workspace <ArrowUpRight size={14} />

                  </Link>

                </div>

              </article>

            ))}

          </section>

        )}

        {/* List view */}

        {viewMode === "list" && (

          <section className="community-accepted-list">

            {filteredCampaigns.map((campaign) => (

              <article className="community-accepted-list-row" key={campaign.id}>

                <div className="community-accepted-list-main">

                  <span className={statusClass(campaign.status)}>

                    <span /> {campaign.status}

                  </span>

                  <h2>{campaign.name}</h2>

                  <p>{campaign.advertiser}</p>

                </div>

                <div className="community-accepted-list-cell">

                  <small>Community · Platform</small>

                  <strong>

                    {campaign.community} · {campaign.platform}

                  </strong>

                </div>

                <div className="community-accepted-list-cell">

                  <small>Earnings · Clicks</small>

                  <strong>

                    {campaign.totalEarnings ?? "KSh 0.00"} ·{" "}

                    {campaign.qualifiedClicks ?? campaign.clicks}

                  </strong>

                </div>

                <div className="community-accepted-list-cell">

                  <small>Dates</small>

                  <strong>

                    {campaign.startDate} – {campaign.endDate}

                  </strong>

                </div>

                <div className="community-accepted-list-actions">

                  <Link

                    className="community-campaign-link"

                    href={`/community-owner/accepted-campaigns/${campaign.id}`}

                  >

                    Open workspace <ArrowUpRight size={14} />

                  </Link>

                </div>

              </article>

            ))}

          </section>

        )}

        {/* Empty states */}

        {loaded && campaigns.length === 0 && (

          <div className="community-accepted-note">

            <Clock3 size={16} />

            <span>

              No campaigns have been accepted yet. When a Campaign Owner accepts one of your

              applications, it will appear here.

            </span>

          </div>

        )}

        {loaded && campaigns.length > 0 && filteredCampaigns.length === 0 && (

          <div className="community-accepted-note" style={{ textAlign: "center", padding: "32px" }}>

            <Search size={20} style={{ marginBottom: "8px" }} />

            <span>

              No campaigns match your current search or filter criteria. Try clearing your filters.

            </span>

          </div>

        )}

      </div>

    </WorkspaceShell>

  );

}

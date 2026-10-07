import {
  Activity as ActivityIcon,
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  DollarSign,
  ExternalLink,
  FileCheck,
  Link2,
  List,
  LayoutGrid,
  MapPin,
  Moon,
  Plus,
  Settings as SettingsIcon,
  ShieldCheck,
  Sun,
  Target,
  Upload,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useTheme } from "@/contexts/ThemeContext";
import {
  CURRENCY,
  CURRENCY_OPTIONS,
  formatCurrency,
  useCurrency,
} from "@/lib/currency";
import {
  getCampaignFinancials,
  getPlacementClickStats,
  
  readApplications,
  readCampaignActivities,
  readCampaigns,
  syncServerClickEvents,
} from "@/data/marketplaceData";

import { toast } from "sonner";
import {
  getRelayBackendId,
  getRelayEarnings,
  listMyRelayCommunities,
  listMyRelayPlacements,
  listRelayApplications,
  listRelayCampaigns,
  relayBackendEnabled,
  type RelayCommunity,
} from "@/lib/relayApi";

type Community = {
  slug: string;
  name: string;
  platform: string;
  category: string;
  members: string;
  audience: string;
  location?: string;
  audienceDescription?: string;
  communityLink?: string;
  verificationDate?: string;
  verificationMethod?: string;
  campaignOpportunities?: number;
  verification: "Pending Verification" | "Verified" | "Needs Attention";
  activeCampaigns: number;
  clicks: string;
  earned: number;
  posts: string;
  health: "Healthy" | "Needs attention";
  color: "coral" | "lilac" | "moss";
};

const initialCommunities: Community[] = [
  {
    slug: "after-hours",
    name: "After Hours",
    platform: "Discord",
    category: "Tech & lifestyle",
    members: "18.4k",
    audience: "Global · English-speaking",
    verification: "Verified",
    verificationDate: "September 28, 2026",
    verificationMethod: "Community ownership / submitted proof",
    campaignOpportunities: 3,
    activeCampaigns: 2,
    clicks: "8,420",
    earned: 312.4,
    posts: "12 posts",
    health: "Healthy",
    color: "coral",
  },
  {
    slug: "design-dispatch",
    name: "Design Dispatch",
    platform: "Telegram",
    category: "Design & creative",
    members: "6.8k",
    audience: "US, UK · Design professionals",
    verification: "Verified",
    verificationDate: "September 26, 2026",
    verificationMethod: "Community ownership / submitted proof",
    campaignOpportunities: 2,
    activeCampaigns: 1,
    clicks: "4,180",
    earned: 186.2,
    posts: "8 posts",
    health: "Healthy",
    color: "lilac",
  },
  {
    slug: "sunday-selects",
    name: "Sunday Selects",
    platform: "WhatsApp",
    category: "Local discovery",
    members: "3.2k",
    audience: "Austin, TX · Local communities",
    verification: "Needs Attention",
    campaignOpportunities: 1,
    activeCampaigns: 1,
    clicks: "2,940",
    earned: 144.2,
    posts: "5 posts",
    health: "Needs attention",
    color: "moss",
  },
];

const platforms = ["WhatsApp", "Telegram", "Facebook", "Discord", "Other"];

function readCommunities() {
  try {
    const saved = window.localStorage.getItem("relay-communities");
    if (!saved) return initialCommunities;
    return (JSON.parse(saved) as Community[]).map((community) => {
      const defaults = initialCommunities.find(
        (item) => item.slug === community.slug,
      );
      return {
        ...defaults,
        ...community,
        campaignOpportunities:
          community.campaignOpportunities ??
          defaults?.campaignOpportunities ??
          0,
        verificationDate:
          community.verificationDate ?? defaults?.verificationDate,
        verificationMethod:
          community.verificationMethod ?? defaults?.verificationMethod,
        earned:
          typeof community.earned === "number"
            ? community.earned
            : Number(String(community.earned).replace(/[^0-9.]/g, "")) || 0,
      };
    });
  } catch {
    return initialCommunities;
  }
}

const communityColors = ["coral", "lilac", "moss"] as const;

function toCommunity(
  item: RelayCommunity,
  index: number,
  localSlug: string | undefined,
  activeCampaigns: number,
  opportunities: number,
): Community {
  return {
    slug: localSlug ?? item.id,
    name: item.name,
    platform: item.platform,
    category: item.category,
    members:
      item.members >= 1000
        ? formatAudience(item.members)
        : String(item.members),
    audience: [item.location, item.audienceDescription]
      .filter(Boolean)
      .join(" · "),
    location: item.location,
    audienceDescription: item.audienceDescription ?? undefined,
    communityLink: item.communityLink ?? undefined,
    verification:
      item.verificationStatus === "Verified"
        ? "Verified"
        : item.verificationStatus === "Suspended"
          ? "Needs Attention"
          : "Pending Verification",
    verificationMethod: item.verificationEvidenceKey
      ? "Submitted proof"
      : "Owner evidence pending",
    campaignOpportunities: opportunities,
    activeCampaigns,
    clicks: "0",
    earned: 0,
    posts: "0 posts",
    health:
      item.verificationStatus === "Suspended" ? "Needs attention" : "Healthy",
    color: communityColors[index % 3],
  };
}

function useCommunities() {
  const [items, setItems] = useState<Community[]>(() =>
    relayBackendEnabled() ? [] : readCommunities(),
  );
  const [loaded, setLoaded] = useState(!relayBackendEnabled());
  useEffect(() => {
    if (!relayBackendEnabled()) {
      window.localStorage.setItem("relay-communities", JSON.stringify(items));
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const [communityPage, placementPage, campaignPage] = await Promise.all([
          listMyRelayCommunities(),
          listMyRelayPlacements().catch(() => null),
          listRelayCampaigns().catch(() => null),
        ]);
        if (cancelled) return;
        const local = readCommunities();
        setItems(
          communityPage.items.map((item, index) =>
            toCommunity(
              item,
              index,
              local.find(
                (candidate) =>
                  getRelayBackendId("community", candidate.slug) === item.id,
              )?.slug,
              placementPage
                ? placementPage.items.filter(
                    (placement) =>
                      placement.communityId === item.id &&
                      placement.status === "Active",
                  ).length
                : 0,
              campaignPage
                ? campaignPage.items.filter(
                    (campaign) =>
                      (campaign.status === "Published" ||
                        campaign.status === "Active") &&
                      campaign.platforms.includes(item.platform),
                  ).length
                : 0,
            ),
          ),
        );
      } catch {
        if (!cancelled)
          toast.error("Could not load your communities", {
            description:
              "Check that the API is running, then refresh the page.",
          });
      }
      if (!cancelled) setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return { items, loaded };
}

function PlatformMark({
  platform,
  color,
}: {
  platform: string;
  color: string;
}) {
  return (
    <span className={`community-platform-mark community-platform-${color}`}>
      {platform.slice(0, 1)}
    </span>
  );
}
function parseAudience(value: string) {
  const number = Number(value.replace(/[^0-9.]/g, ""));
  return value.toLowerCase().includes("k") ? number * 1000 : number;
}
function formatAudience(value: number) {
  return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}
function verificationClass(status: Community["verification"]) {
  return status === "Verified"
    ? "verification-pill verification-verified"
    : status === "Pending Verification"
      ? "verification-pill verification-pending"
      : "verification-pill verification-attention";
}

function CommunityCard({ community }: { community: Community }) {
  const { format } = useCurrency();
  const [verificationOpen, setVerificationOpen] = useState(false);
  return (
    <article className="community-asset-card">
      <div className="community-card-main">
        <div className="community-asset-header">
          <div className="community-asset-identity">
            <PlatformMark
              platform={community.platform}
              color={community.color}
            />
            <div>
              <h3>{community.name}</h3>
              <p>
                {community.platform} · {community.category}
              </p>
            </div>
          </div>
          <button
            className={verificationClass(community.verification)}
            onClick={() => setVerificationOpen((open) => !open)}
            aria-expanded={verificationOpen}
          >
            <ShieldCheck size={13} /> {community.verification}
          </button>
        </div>
        {verificationOpen && (
          <div className="verification-card-note">
            <strong>
              {community.verification === "Verified"
                ? "Verified"
                : community.verification}
            </strong>
            <span>
              {community.verification === "Verified"
                ? "Your ownership/management of this community has been verified."
                : "For security, advertisers may only see this community as verified after verification is completed."}
            </span>
          </div>
        )}
        <div className="community-asset-audience">
          <span>
            <UsersRound size={14} /> {community.members} members / followers
          </span>
          <span>
            <MapPin size={14} /> {community.audience}
          </span>
        </div>
        <div className="community-asset-metrics">
          <div>
            <small>Active campaigns</small>
            <strong>{community.activeCampaigns}</strong>
          </div>
          <div>
            <small>Total clicks</small>
            <strong>{community.clicks}</strong>
          </div>
          <div>
            <small>Total earnings</small>
            <strong>{format(community.earned)}</strong>
          </div>
        </div>
      </div>
      <div className="community-opportunity-row">
        <span>
          <Target size={14} />
          <strong>Campaign opportunities</strong>
          <small>
            {community.campaignOpportunities ?? 0} matching campaigns
          </small>
        </span>
      </div>
      <div className="community-asset-footer">
        <span
          className={
            community.health === "Healthy" ? "health-good" : "health-warn"
          }
        >
          {community.health === "Healthy" ? (
            <CheckCircle2 size={14} />
          ) : (
            <Clock3 size={14} />
          )}{" "}
          {community.health}
        </span>
        <Link className="card-link" href={`/communities/${community.slug}`}>
          Open community <ArrowUpRight size={14} />
        </Link>
      </div>
    </article>
  );
}

export function Communities() {
  const { format } = useCurrency();
  const { items } = useCommunities();
  const [view, setView] = useState<"cards" | "list">("cards");
  const totalAudience = items
    .filter((item) => item.verification === "Verified")
    .reduce((sum, item) => sum + parseAudience(item.members), 0);
  return (
    <WorkspaceShell active="My Communities">
      <div className="dashboard-body">
        <section className="route-page-heading communities-heading">
          <div>
            <span className="section-kicker">
              <span className="section-kicker-line" /> Owner portfolio
            </span>
            <h1>My Communities</h1>
            <p>
              Manage the audiences you own, prepare them for campaigns, and turn
              the right opportunities into earnings.
            </p>
          </div>
          <Link className="primary-owner-button" href="/communities/add">
            <Plus size={16} /> Add community
          </Link>
        </section>
        <div className="page-summary-strip">
          <div>
            <strong>{items.length}</strong>
            <span>communities managed</span>
          </div>
          <div>
            <strong>{formatAudience(totalAudience)}</strong>
            <span>total audience</span>
          </div>
          <div>
            <strong>
              {format(items.reduce((sum, item) => sum + item.earned, 0))}
            </strong>
            <span>total earned</span>
          </div>
        </div>
        <div className="verification-explainer">
          <span className="verification-explainer-icon">
            <ShieldCheck size={16} />
          </span>
          <span>
            <strong>Why verification matters</strong>
            <small>
              Advertisers trust verified communities because ownership and
              audience details have been reviewed. Member counts are submitted
              by you and are not automatically verified.
            </small>
          </span>
        </div>
        <div className="monetization-note">
          <strong>You manage an audience.</strong>
          <span>
            Businesses want to reach audiences like yours. Your communities can
            earn money by participating in campaigns.
          </span>
        </div>
        <section className="owner-section">
          <div className="section-heading community-portfolio-heading">
            <div>
              <div className="section-kicker">
                <span className="section-kicker-line section-kicker-line-lilac" />{" "}
                Your digital assets
              </div>
              <h2>Community portfolio</h2>
            </div>
            <div className="community-view-controls">
              <span className="section-count">
                {items.length} active assets
              </span>
              <div
                className="community-view-toggle"
                role="group"
                aria-label="Change community view"
              >
                <button
                  className={view === "cards" ? "view-toggle-active" : ""}
                  onClick={() => setView("cards")}
                >
                  <LayoutGrid size={14} /> Cards
                </button>
                <button
                  className={view === "list" ? "view-toggle-active" : ""}
                  onClick={() => setView("list")}
                >
                  <List size={14} /> List
                </button>
              </div>
            </div>
          </div>
          <div
            className={`community-asset-grid ${view === "list" ? "community-list-view" : ""}`}
          >
            {items.map((community) => (
              <CommunityCard community={community} key={community.slug} />
            ))}
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}

export function CommunityDetail() {
  const { format } = useCurrency();
  const [, params] = useRoute<{ slug: string }>("/communities/:slug");
  const slug = params?.slug ?? "after-hours";
  const { items, loaded } = useCommunities();
  const [verificationOpen, setVerificationOpen] = useState(false);
  const community =
    items.find((item) => item.slug === slug) ??
    (relayBackendEnabled() ? undefined : initialCommunities[0]);

  if (!community) {
    return (
      <WorkspaceShell active="My Communities">
        <div className="dashboard-body">
          <section className="route-page-heading">
            <div>
              <Link className="hero-link route-back-link" href="/communities">
                <ArrowLeft size={15} /> Back to My Communities
              </Link>
              <h1>{loaded ? "Community not found" : "Loading community"}</h1>
            </div>
          </section>
        </div>
      </WorkspaceShell>
    );
  }

  const clicks = parseAudience(community.clicks);
  const completed = relayBackendEnabled() ? 0 : 4;
  const averageClicks = completed ? Math.round(clicks / completed) : 0;
  return (
    <WorkspaceShell active="My Communities">
      <div className="dashboard-body community-detail-page">
        <section className="route-page-heading detail-heading">
          <div>
            <Link className="hero-link route-back-link" href="/communities">
              <ArrowLeft size={15} /> Back to My Communities
            </Link>
            <div className="community-detail-title">
              <PlatformMark
                platform={community.platform}
                color={community.color}
              />
              <div>
                <span className="section-kicker">
                  <span className="section-kicker-line" /> {community.platform}{" "}
                  community
                </span>
                <h1>{community.name}</h1>
                <p>
                  {community.category} ·{" "}
                  {community.location ?? community.audience}
                </p>
              </div>
            </div>
          </div>
          <button
            className={verificationClass(community.verification)}
            onClick={() => setVerificationOpen((open) => !open)}
            aria-expanded={verificationOpen}
          >
            <ShieldCheck size={13} /> {community.verification}
          </button>
        </section>
        {verificationOpen && (
          <div className="verification-detail-callout">
            <FileCheck size={17} />
            <div>
              <strong>
                {community.verification === "Verified"
                  ? "Verified"
                  : community.verification === "Pending Verification"
                    ? "Pending verification"
                    : "Needs attention"}
              </strong>
              <p>
                {community.verification === "Verified"
                  ? "Your ownership/management of this community has been verified."
                  : "For security, advertisers may only see this community as verified after verification is completed. Member counts are submitted by owners and are not automatically verified."}
              </p>
            </div>
          </div>
        )}
        <div className="detail-summary-strip">
          <div>
            <small>Audience size</small>
            <strong>{community.members}</strong>
            <span>members / followers</span>
          </div>
          <div>
            <small>Active campaigns</small>
            <strong>{community.activeCampaigns}</strong>
            <span>Campaigns running</span>
          </div>
          <div>
            <small>Total clicks</small>
            <strong>{community.clicks}</strong>
            <span>Tracked visits</span>
          </div>
          <div>
            <small>Total earned</small>
            <strong>{format(community.earned)}</strong>
            <span>All time</span>
          </div>
        </div>
        <div className="detail-content-grid">
          <main>
            <section className="owner-section audience-overview">
              <div className="section-heading">
                <div>
                  <div className="section-kicker">
                    <span className="section-kicker-line" /> Audience overview
                  </div>
                  <h2>Know the asset you manage</h2>
                </div>
                <Link className="section-link" href="/campaigns">
                  Find Campaigns <ArrowUpRight size={14} />
                </Link>
              </div>
              <p>
                {community.audienceDescription ??
                  `A ${community.category.toLowerCase()} community for ${community.audience.toLowerCase()}.`}
              </p>
              <div className="audience-verification-grid">
                <div>
                  <small>Audience size</small>
                  <strong>{community.members}</strong>
                  <span>members / followers</span>
                </div>
                <div>
                  <small>Verification</small>
                  <strong>{community.verification}</strong>
                  <span>
                    {community.verification === "Verified"
                      ? "Advertiser-ready"
                      : "Review required"}
                  </span>
                </div>
                <div>
                  <small>Verified on</small>
                  <strong>
                    {community.verificationDate ?? "Not yet verified"}
                  </strong>
                  <span>Ownership review</span>
                </div>
                <div>
                  <small>Verification method</small>
                  <strong>
                    {community.verificationMethod ?? "Owner evidence pending"}
                  </strong>
                  <span>Submitted proof</span>
                </div>
              </div>
            </section>
            <section className="owner-section">
              <div className="section-heading">
                <div>
                  <div className="section-kicker">
                    <span className="section-kicker-line section-kicker-line-lilac" />{" "}
                    Performance
                  </div>
                  <h2>Community momentum</h2>
                </div>
                <span className="section-count">Last 30 days</span>
              </div>
              <div className="detail-performance-summary">
                <div>
                  <small>Total clicks</small>
                  <strong>{community.clicks}</strong>
                </div>
                <div>
                  <small>Avg. clicks / campaign</small>
                  <strong>{averageClicks.toLocaleString()}</strong>
                </div>
                <div>
                  <small>Campaigns completed</small>
                  <strong>{completed}</strong>
                </div>
                <div>
                  <small>Total earned</small>
                  <strong>{format(community.earned)}</strong>
                </div>
              </div>
              <div className="detail-chart-card">
                <div className="detail-chart-header">
                  <span>Clicks over time</span>
                  <strong>{community.clicks}</strong>
                </div>
                <div className="detail-bars">
                  {[34, 47, 41, 62, 55, 69, 61, 83].map((height, index) => (
                    <span key={index} style={{ height: `${height}%` }} />
                  ))}
                </div>
                <div className="detail-chart-labels">
                  <span>May 19</span>
                  <span>Jun 02</span>
                  <span>Jun 17</span>
                </div>
              </div>
            </section>
            <section className="owner-section eligibility-section">
              <div className="section-heading">
                <div>
                  <div className="section-kicker">
                    <span className="section-kicker-line" /> Campaign
                    eligibility
                  </div>
                  <h2>Campaigns you can apply for</h2>
                </div>
                <Link className="section-link" href="/campaigns">
                  Find Campaigns <ChevronRight size={14} />
                </Link>
              </div>
              <div className="eligibility-card">
                <div>
                  <span className="campaign-brand">Urban Sneakers Launch</span>
                  <p>
                    {community.platform} · Kenyan shoppers · {format(1.5)} /
                    qualified click · 48 hours
                  </p>
                  <small>
                    Matched by platform, audience, category, location, and
                    audience size.
                  </small>
                </div>
                <Link className="accept-button" href="/campaigns">
                  View Campaign <ArrowUpRight size={14} />
                </Link>
              </div>
            </section>
            <section className="owner-section">
              <div className="section-heading">
                <div>
                  <div className="section-kicker">
                    <span className="section-kicker-line" /> Campaign history
                  </div>
                  <h2>Recent campaign activity</h2>
                </div>
              </div>
              <div className="detail-campaign-card">
                <div className="campaign-identity">
                  <PlatformMark platform="Orbit" color="coral" />
                  <div>
                    <div className="campaign-brand">Orbit Mobile</div>
                    <div className="campaign-category">
                      Tech · Product launch
                    </div>
                  </div>
                </div>
                <span className="status-pill status-pill-active">
                  <span /> Completed
                </span>
                <p>Make space for better mobile plans</p>
                <strong>{format(128.4)} earned · 1,842 clicks</strong>
              </div>
            </section>
          </main>
          <aside className="owner-side-column">
            <section className="insight-card detail-earnings-card">
              <span className="insight-kicker">Asset earnings</span>
              <h2>{format(community.earned)}</h2>
              <p>Generated by {community.name} across active campaigns.</p>
              <Link className="card-link" href="/earnings">
                View earnings <ChevronRight size={14} />
              </Link>
            </section>
            <section className="insight-card detail-owner-card">
              <span className="insight-kicker">Verification</span>
              <h2>
                {community.verification === "Verified"
                  ? "Ready to earn"
                  : community.verification === "Pending Verification"
                    ? "Verification in progress"
                    : "Action needed"}
              </h2>
              <p>
                {community.verification === "Verified"
                  ? "This community is verified and eligible for campaign matching."
                  : "Advertisers may only see this community as verified after verification is completed."}
              </p>
              <div className="verification-check">
                <ShieldCheck size={17} /> {community.verification}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </WorkspaceShell>
  );
}

type PerformanceRow = {
  id: string;
  community: string;
  campaign: string;
  financials: ReturnType<typeof getCampaignFinancials>;
};

export function Performance() {

    const { format } = useCurrency();
  const [applications, setApplications] = useState(readApplications);
  const [backendRows, setBackendRows] = useState<PerformanceRow[] | null>(null);
  const { items: communityItems } = useCommunities();
  const campaigns = readCampaigns();

  useEffect(() => {
    const loadBackend = async () => {
      if (!relayBackendEnabled()) return;

      try {
        const [applicationPage, campaignPage, communityPage] =
          await Promise.all([
            listRelayApplications(),
            listRelayCampaigns(),
            listMyRelayCommunities(),
          ]);

        setBackendRows(
          applicationPage.items
            .filter((application) => application.status === "Accepted")
            .map((application) => {
              const campaign = campaignPage.items.find(
                (item) => item.id === application.campaignId,
              );
              const community = communityPage.items.find(
                (item) => item.id === application.communityId,
              );
              const qualified = application.placement
                ? getPlacementClickStats(application.placement.id).qualified
                : 0;

              return {
                id: application.id,
                community: community?.name ?? "Community",
                campaign: campaign?.name ?? "Campaign",
                financials: getCampaignFinancials(
                  String(campaign?.cpc ?? application.cpc),
                  String(campaign?.budget ?? 0),
                  qualified,
                ),
              };
            }),
        );
      } catch {
        setBackendRows([]);
        toast.error("Could not load performance", {
          description: "Check that the API is running, then refresh the page.",
        });
      }
    };

    const refresh = () => {
      setApplications(readApplications());
      void loadBackend();
    };

    void syncServerClickEvents().then(refresh);
    window.addEventListener("ownerboard:applications-updated", refresh);
    window.addEventListener("ownerboard:click-events-updated", refresh);

    return () => {
      window.removeEventListener("ownerboard:applications-updated", refresh);
      window.removeEventListener("ownerboard:click-events-updated", refresh);
    };
  }, []);

  const demoRows: PerformanceRow[] = applications
    .filter((application) => application.status === "Accepted")
    .map((application) => {
      const campaign = campaigns.find(
        (item) => item.id === application.campaignId,
      );
      const stats = getPlacementClickStats(application.id);
      const financials = campaign
        ? getCampaignFinancials(campaign.cpc, campaign.budget, stats.qualified)
        : getCampaignFinancials(application.cpc, "0", stats.qualified);

      return {
        id: application.id,
        community: application.community,
        campaign: application.campaign,
        financials,
      };
    });

  const rows = relayBackendEnabled() ? (backendRows ?? []) : demoRows;

  return (
    <WorkspaceShell active="Performance">
      <div className="dashboard-body">
        <section className="route-page-heading">
          <div>
            <span className="section-kicker">
              <span className="section-kicker-line section-kicker-line-lilac" />{" "}
              Community performance
            </span>
            <h1>Performance</h1>
            <p>
              See qualified clicks and CPC earnings for your accepted campaigns.
            </p>
          </div>
        </section>

        <div className="page-summary-strip">
          <div>
            <strong>
              {rows
                .reduce((sum, row) => sum + row.financials.qualifiedClicks, 0)
                .toLocaleString()}
            </strong>
            <span>qualified clicks</span>
          </div>
          <div>
            <strong>{rows.length}</strong>
            <span>accepted campaigns</span>
          </div>
          <div>
            <strong>
              {format(
                rows.reduce(
                  (sum, row) => sum + row.financials.communityOwnerEarnings,
                  0,
                ),
              )}
            </strong>
            <span>community earnings</span>
          </div>
        </div>

        <section className="owner-section">
          <div className="section-heading">
            <div>
              <div className="section-kicker">
                <span className="section-kicker-line" /> By accepted campaign
              </div>
              <h2>Qualified-click earnings</h2>
            </div>
            <span className="section-count">Recorded click events</span>
          </div>

          <div className="community-list">
            {rows.length ? (
              rows.map((row) => (
                <div className="activity-row" key={row.id}>
                  <span className="action-icon action-icon-lilac">
                    <BarChart3 size={16} />
                  </span>
                  <span>
                    <strong>
                      {row.community} · {row.campaign}
                    </strong>
                    <small>
                      {row.financials.qualifiedClicks.toLocaleString()}{" "}
                      qualified clicks ·{" "}
                      {format(row.financials.communityOwnerCpc)} payout
                      / click
                    </small>
                  </span>
                  <strong>
                    {format(row.financials.communityOwnerEarnings)}
                  </strong>
                </div>
              ))
            ) : (
              <div className="campaign-performance-empty">
                <BarChart3 size={21} />
                <strong>No accepted campaigns yet</strong>
                <p>
                  Accept a campaign application to start showing qualified-click
                  earnings.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="owner-section">
          <div className="section-heading">
            <div>
              <div className="section-kicker">
                <span className="section-kicker-line section-kicker-line-lilac" />{" "}
                By community
              </div>
              <h2>What is working</h2>
            </div>
            <span className="section-count">Last 30 days</span>
          </div>

          <div className="community-list">
            {communityItems.map((community) => (
              <CommunityCard community={community} key={community.slug} />
            ))}
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}

const earningsTransactions = [
  {
    campaign: "Loop Finance",
    community: "After Hours",
    amount: 420,
    status: "Available",
    date: "Jun 17, 2025",
    color: "coral",
  },
  {
    campaign: "Moss Market",
    community: "Sunday Selects",
    amount: 280,
    status: "Pending",
    date: "Jun 16, 2025",
    color: "moss",
  },
  {
    campaign: "Studio Notes",
    community: "Design Dispatch",
    amount: 180,
    status: "Paid",
    date: "Jun 14, 2025",
    color: "lilac",
  },
  {
    campaign: "Loop Finance",
    community: "After Hours",
    amount: 360,
    status: "Available",
    date: "Jun 12, 2025",
    color: "coral",
  },
  {
    campaign: "Moss Market",
    community: "Sunday Selects",
    amount: 240,
    status: "Paid",
    date: "Jun 08, 2025",
    color: "moss",
  },
];

const earningsByCommunity = [
  { name: "After Hours", amount: 312.4, share: 49, color: "coral" },
  { name: "Design Dispatch", amount: 186.2, share: 29, color: "lilac" },
  { name: "Sunday Selects", amount: 144.2, share: 22, color: "moss" },
];
const earningsByCampaign = [
  {
    name: "Loop Finance",
    amount: 312.4,
    detail: "2 active campaigns",
    color: "coral",
  },
  {
    name: "Moss Market",
    amount: 214.2,
    detail: "Sunday Selects",
    color: "moss",
  },
  {
    name: "Studio Notes",
    amount: 116.2,
    detail: "Design Dispatch",
    color: "lilac",
  },
];



type EarningsRow = {
  id: string;
  campaign: string;
  community: string;
  amount: number;
  status: string;
  date: string;
  color: string;
  clicks: number;
};

function colorFor(name: string) {
  const palette = ["coral", "lilac", "moss"];
  return palette[
    [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 3
  ];
}

function sumOf(rows: { amount: number }[]) {
  return rows.reduce((total, row) => total + row.amount, 0);
}

function groupRows(rows: EarningsRow[], key: (row: EarningsRow) => string) {
  const groups = new Map<string, EarningsRow[]>();
  rows.forEach((row) =>
    groups.set(key(row), [...(groups.get(key(row)) ?? []), row]),
  );
  return Array.from(groups.entries());
}

function useEarnings() {
  const [rows, setRows] = useState<EarningsRow[]>([]);
  const [loaded, setLoaded] = useState(!relayBackendEnabled());
  useEffect(() => {
    if (!relayBackendEnabled()) return;
    let cancelled = false;
    void (async () => {
      try {
        const [earnings, applications] = await Promise.all([
          getRelayEarnings(),
          listRelayApplications(),
        ]);
        if (cancelled) return;
        const byPlacement = new Map(
          applications.items
            .filter((item) => item.placement)
            .map((item) => [item.placement!.id, item]),
        );
        setRows(
          earnings.map((item) => {
            const application = byPlacement.get(item.placementId);
            const campaign = application?.campaign?.name ?? "Campaign";
            const community = application?.community?.name ?? "Community";
            return {
              id: item.payoutId,
              campaign,
              community,
              amount: item.amount,
              status:
                item.status === "Pending"
                  ? "Available"
                  : item.status === "Held"
                    ? "Pending"
                    : item.status === "Completed"
                      ? "Paid"
                      : "Failed",
              date: new Date(item.updatedAt).toLocaleDateString("en-KE", {
                dateStyle: "medium",
              }),
              color: colorFor(community),
              clicks: item.qualifiedClicks,
            };
          }),
        );
      } catch {
        if (!cancelled)
          toast.error("Could not load earnings", {
            description:
              "Check that the API is running, then refresh the page.",
          });
      }
      if (!cancelled) setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return { rows, loaded };
}

export function Earnings() {
  const { currency, format } = useCurrency();
  const backend = relayBackendEnabled();
  const live = useEarnings();
  const transactions: {
    campaign: string;
    community: string;
    amount: number;
    status: string;
    date: string;
    color: string;
  }[] = backend ? live.rows : earningsTransactions;
  const counted = live.rows.filter((row) => row.status !== "Failed");
  const total = sumOf(counted);
  const available = backend
    ? sumOf(live.rows.filter((row) => row.status === "Available"))
    : 642.8;
  const pending = backend
    ? sumOf(live.rows.filter((row) => row.status === "Pending"))
    : 216.4;
  const totalEarned = backend ? total : 859.2;
  const byCommunity = backend
    ? groupRows(counted, (row) => row.community).map(([name, items]) => ({
        name,
        amount: sumOf(items),
        share: total ? Math.round((sumOf(items) / total) * 100) : 0,
        color: colorFor(name),
      }))
    : earningsByCommunity;
  const byCampaign = backend
    ? groupRows(counted, (row) => row.campaign).map(([name, items]) => ({
        name,
        amount: sumOf(items),
        detail: `${items.reduce((clicks, row) => clicks + row.clicks, 0).toLocaleString()} qualified clicks`,
        color: colorFor(name),
      }))
    : earningsByCampaign;
  return (
    <WorkspaceShell active="Earnings">
      <div className="dashboard-body earnings-page">
        <section className="route-page-heading earnings-page-heading">
          <div>
            <span className="section-kicker">
              <span className="section-kicker-line section-kicker-line-lilac" />{" "}
              Your money
            </span>
            <h1>Earnings</h1>
            <p>
              See what is available now, what is still processing, and what your
              communities have earned.
            </p>
          </div>
          <button
            className="withdraw-button"
            onClick={() =>
              window.alert(
                "Withdrawals will be available once your balance reaches the payout threshold.",
              )
            }
          >
            <ArrowDownToLine size={16} /> Withdraw Earnings
          </button>
        </section>
        <section className="earnings-balance-grid">
          <div className="earnings-balance-card earnings-balance-available">
            <span>Available</span>
            <strong>{format(available)}</strong>
            <small>Ready for your next payout</small>
          </div>
          <div className="earnings-balance-card earnings-balance-pending">
            <span>Pending</span>
            <strong>{format(pending)}</strong>
            <small>
              {backend ? "On hold for review" : "Waiting for campaign approval"}
            </small>
          </div>
          <div className="earnings-balance-card earnings-balance-total">
            <span>Total earned</span>
            <strong>{format(totalEarned)}</strong>
            <small>Since joining Relay</small>
          </div>
        </section>
        <section className="earnings-section">
          <div className="earnings-section-heading">
            <div>
              <span className="section-kicker">
                <span className="section-kicker-line" /> Transaction history
              </span>
              <h2>Recent earnings</h2>
            </div>
            <span className="currency-note">All amounts in {currency}</span>
          </div>
          <div className="earnings-transactions">
            <div className="earnings-transaction-header">
              <span>Campaign</span>
              <span>Community</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Date</span>
            </div>
            {transactions.map((transaction, index) => (
              <div
                className="earnings-transaction-row"
                key={`${transaction.campaign}-${transaction.community}-${transaction.date}-${index}`}
              >
                <span className="transaction-campaign">
                  <span
                    className={`community-dot community-dot-${transaction.color}`}
                  />
                  <strong>{transaction.campaign}</strong>
                </span>
                <span>{transaction.community}</span>
                <strong>{format(transaction.amount)}</strong>
                <span
                  className={`earnings-status earnings-status-${transaction.status.toLowerCase()}`}
                >
                  {transaction.status}
                </span>
                <span>{transaction.date}</span>
              </div>
            ))}
            {backend && live.loaded && transactions.length === 0 && (
              <p>
                No earnings yet. Earnings appear here after someone clicks the
                tracking link of one of your active placements.
              </p>
            )}
          </div>
        </section>
        <section className="earnings-breakdown-grid">
          <div className="earnings-breakdown-card">
            <div className="earnings-section-heading">
              <div>
                <span className="section-kicker">
                  <span className="section-kicker-line section-kicker-line-lilac" />{" "}
                  By community
                </span>
                <h2>Community earnings</h2>
              </div>
            </div>
            {byCommunity.map((item) => (
              <div className="breakdown-row" key={item.name}>
                <span className={`breakdown-dot breakdown-dot-${item.color}`} />
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.share}% of total</small>
                </span>
                <strong>{format(item.amount)}</strong>
              </div>
            ))}
          </div>
          <div className="earnings-breakdown-card">
            <div className="earnings-section-heading">
              <div>
                <span className="section-kicker">
                  <span className="section-kicker-line section-kicker-line-lilac" />{" "}
                  By campaign
                </span>
                <h2>Campaign earnings</h2>
              </div>
            </div>
            {byCampaign.map((item) => (
              <div className="breakdown-row" key={item.name}>
                <span className={`breakdown-dot breakdown-dot-${item.color}`} />
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.detail}</small>
                </span>
                <strong>{format(item.amount)}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}










function ActivityView({
  workspaceMode = "legacy",
}: { workspaceMode?: "campaign-owner" | "legacy" } = {}) {
  const [activities, setActivities] = useState(readCampaignActivities);
  useEffect(() => {
    const refresh = () => setActivities(readCampaignActivities());
    window.addEventListener("ownerboard:activity-updated", refresh);
    return () =>
      window.removeEventListener("ownerboard:activity-updated", refresh);
  }, []);
  const fallback = [
    {
      title: "Orbit Mobile post went live",
      detail: "After Hours · 2 hours ago",
    },
    { title: "Tracking link refreshed", detail: "Sunday Selects · Yesterday" },
    { title: "Payout scheduled", detail: "June 30 · Relay payouts" },
    {
      title: "Design Dispatch crossed 6k members",
      detail: "Design Dispatch · 3 days ago",
    },
  ];
  const activityItems = activities.length
    ? activities
    : fallback.map((item, index) => ({
        id: `fallback-${index}`,
        event: item.title,
        campaignName: item.detail,
        timestamp: new Date().toISOString(),
      }));
  const published = activities.filter(
    (item) =>
      item.event.toLowerCase().includes("publish") ||
      item.event.toLowerCase().includes("created"),
  ).length;
  const placements = activities.filter((item) =>
    item.event.toLowerCase().includes("placement"),
  ).length;
  return (
    <WorkspaceShell
      active="Activity"
      workspaceLabel={
        workspaceMode === "campaign-owner" ? "Campaign Owner" : undefined
      }
      workspaceMode={workspaceMode}
    >
      <div className="dashboard-body owner-activity-page">
        <section className="route-page-heading owner-activity-heading">
          <div>
            <span className="section-kicker">
              <span className="section-kicker-line" />{" "}
              {workspaceMode === "campaign-owner"
                ? "Campaign Owner workspace"
                : "Community Owner workspace"}
            </span>
            <h1>Activity</h1>
            <p>
              Keep up with your communities, campaign placements, and recent
              marketplace movement in one place.
            </p>
          </div>
        </section>
        <section className="page-summary-strip owner-activity-summary">
          <div>
            <strong>{activityItems.length}</strong>
            <span>Recent events</span>
          </div>
          <div>
            <strong>{published}</strong>
            <span>Campaign updates</span>
          </div>
          <div>
            <strong>{placements}</strong>
            <span>Placement updates</span>
          </div>
        </section>
        <div className="owner-activity-layout">
          <section className="owner-section activity-section owner-activity-main">
            <div className="section-heading">
              <div>
                <div className="section-kicker">
                  <span className="section-kicker-line section-kicker-line-lilac" />{" "}
                  Activity feed
                </div>
                <h2>Recent movement</h2>
              </div>
              <span className="section-count">Latest first</span>
            </div>
            <div className="activity-list">
              {activityItems.map((item) => (
                <div className="activity-row" key={item.id}>
                  <span className="action-icon action-icon-lilac">
                    <ActivityIcon size={16} />
                  </span>
                  <span>
                    <strong>{item.event}</strong>
                    <small>
                      {item.campaignName} ·{" "}
                      {new Date(item.timestamp).toLocaleString()}
                    </small>
                  </span>
                  <ArrowUpRight size={15} />
                </div>
              ))}
            </div>
          </section>
          <aside className="owner-activity-aside">
            <section className="owner-activity-card">
              <span className="owner-activity-card-icon">
                <ActivityIcon size={17} />
              </span>
              <div>
                <span className="section-kicker">
                  <span className="section-kicker-line section-kicker-line-lilac" />{" "}
                  Stay in control
                </span>
                <h2>Useful updates, not noise</h2>
                <p>
                  Use this feed to spot new campaign opportunities, placement
                  changes, and important community activity.
                </p>
              </div>
              <Link
                className="section-link"
                href={
                  workspaceMode === "campaign-owner"
                    ? "/campaign-owner/placements"
                    : "/communities"
                }
              >
                Explore workspace <ArrowUpRight size={14} />
              </Link>
            </section>
            <section className="owner-activity-card owner-activity-card-soft">
              <strong>Next steps</strong>
              <span>
                Review your latest activity, then open a campaign or placement
                to see the full record.
              </span>
              <Link
                className="section-link"
                href={
                  workspaceMode === "campaign-owner"
                    ? "/campaign-owner/campaigns"
                    : "/campaigns"
                }
              >
                View campaigns <ArrowUpRight size={14} />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </WorkspaceShell>
  );
}
export function Activity() {
  return <ActivityView />;
}
export function CampaignOwnerActivity() {
  return <ActivityView workspaceMode="campaign-owner" />;
}

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  return (
    <WorkspaceShell active="Settings">
      <div className="dashboard-body">
        <section className="route-page-heading">
          <div>
            <span className="section-kicker">
              <span className="section-kicker-line section-kicker-line-lilac" />{" "}
              Workspace preferences
            </span>
            <h1>Settings</h1>
            <p>
              Keep your owner workspace clear, useful, and tuned to how you
              work.
            </p>
          </div>
        </section>
        <section className="settings-card">
          <div className="preference-card-heading">
            <span className="preference-icon">
              <SettingsIcon size={17} />
            </span>
            <div>
              <h2>Workspace preferences</h2>
              <p>These settings only affect your Relay workspace.</p>
            </div>
          </div>
          <button className="preference-row" onClick={toggleTheme}>
            <span className="preference-row-icon">
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </span>
            <span>
              <strong>{theme === "dark" ? "Light theme" : "Dark theme"}</strong>
              <small>
                Use a {theme === "dark" ? "brighter" : "darker"} workspace when
                you need it.
              </small>
            </span>
            <span
              className={`theme-switch ${theme === "dark" ? "theme-switch-on" : ""}`}
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
                Changes financial amounts across your owner workspace.
              </small>
            </span>
            <span className="currency-switcher">
              {CURRENCY_OPTIONS.map((option) => (
                <button
                  key={option}
                  className={
                    currency === option ? "currency-option-active" : ""
                  }
                  onClick={() => setCurrency(option)}
                >
                  {option}
                </button>
              ))}
            </span>
          </div>
          <div className="preference-row preference-row-static">
            <span className="preference-row-icon">
              <CheckCircle2 size={16} />
            </span>
            <span>
              <strong>Weekly owner digest</strong>
              <small>Get one useful summary every Monday.</small>
            </span>
            <span className="preference-check">
              <CheckCircle2 size={13} />
            </span>
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}

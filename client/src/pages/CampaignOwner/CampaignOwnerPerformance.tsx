import { ArrowLeft, ArrowUpRight, BarChart3, CheckCircle2, DollarSign, MousePointer2, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useCurrency } from "@/lib/currency";
import { getCampaignClickStats, getCampaignFinancials } from "@/data/marketplaceData";
import { relayBackendEnabled } from "@/lib/relayApi";
import { readCampaigns } from "./campaignData";
import { readPlacements, getPerformanceSummary } from "./placementData";
import { syncServerClickEvents } from "./applicationData";
import { useCampaignPerformance, type PerformanceRow } from "./useCampaignPerformance";

export default function CampaignOwnerPerformance() {
  const { format } = useCurrency();
  const backend = relayBackendEnabled();
  const live = useCampaignPerformance();
  const [placements, setPlacements] = useState(readPlacements);
  const [campaigns, setCampaigns] = useState(readCampaigns);

  useEffect(() => {
    const refresh = () => { setPlacements(readPlacements()); setCampaigns(readCampaigns()); };
    if (!backend) void syncServerClickEvents().then(refresh);
    window.addEventListener("ownerboard:applications-updated", refresh);
    window.addEventListener("ownerboard:click-events-updated", refresh);
    return () => {
      window.removeEventListener("ownerboard:applications-updated", refresh);
      window.removeEventListener("ownerboard:click-events-updated", refresh);
    };
  }, [backend]);

  const summary = useMemo(() => getPerformanceSummary(placements, campaigns), [placements, campaigns]);

  const demoRows: PerformanceRow[] = useMemo(
    () =>
      campaigns
        .filter((campaign) => placements.some((placement) => placement.campaignId === campaign.id))
        .map((campaign) => {
          const financials = getCampaignFinancials(campaign.cpc, campaign.budget, getCampaignClickStats(campaign.id).qualified);
          const used = financials.maximumQualifiedClicks ? Math.min(100, Math.round((financials.qualifiedClicks / financials.maximumQualifiedClicks) * 100)) : 0;
          return {
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            placementCount: placements.filter((placement) => placement.campaignId === campaign.id).length,
            qualifiedClicks: financials.qualifiedClicks,
            cpc: financials.advertiserCpc,
            spend: financials.advertiserSpend,
            budget: financials.advertiserSpend + financials.remainingBudget,
            remaining: financials.remainingBudget,
            used,
          };
        }),
    [campaigns, placements],
  );

  const rows = backend ? live.rows : demoRows;
  const totalClicks = backend ? live.rows.reduce((sum, row) => sum + row.qualifiedClicks, 0) : summary.totalClicks;
  const activePlacements = backend ? live.activePlacements : summary.activePlacements;
  const completedPlacements = backend ? live.completedPlacements : summary.completedPlacements;
  const spendText = backend ? format(live.rows.reduce((sum, row) => sum + row.spend, 0)) : summary.campaignSpend;
  const remainingText = backend ? format(live.rows.reduce((sum, row) => sum + row.remaining, 0)) : summary.remainingBudget;
  const loading = backend && live.loading;
  const failed = backend && live.failed;

  const metrics = [
    { label: "Total qualified clicks", value: totalClicks.toLocaleString(), detail: backend ? "Qualified destination visits" : "Mock qualified destination visits", icon: MousePointer2, tone: "lilac" },
    { label: "Active placements", value: activePlacements.toString(), detail: "Accepted communities", icon: CheckCircle2, tone: "moss" },
    { label: "Completed placements", value: completedPlacements.toString(), detail: "Campaigns finished", icon: BarChart3, tone: "coral" },
    { label: "Advertiser spend", value: spendText, detail: "Qualified clicks x CPC", icon: DollarSign, tone: "coral" },
    { label: "Remaining budget", value: remainingText, detail: "Across accepted campaigns", icon: WalletCards, tone: "moss" },
  ];

  return (
    <WorkspaceShell active="Performance" workspaceLabel="Campaign Owner" workspaceMode="campaign-owner">
      <div className="dashboard-body campaign-performance-page">
        
        <section className="campaign-performance-heading">
          <div>
            <span className="section-kicker"><span className="section-kicker-line" /> Campaign delivery overview</span>
            <h1>Performance</h1>
            <p>Shared CPC economics for qualified clicks, placements, and budget health.</p>
          </div>
          <div className="campaign-performance-summary">
            <BarChart3 size={18} />
            <span><strong>{totalClicks.toLocaleString()}</strong><small>total qualified clicks</small></span>
          </div>
        </section>
        <div className="campaign-performance-metric-grid">
          {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
            <article className={`campaign-performance-metric campaign-performance-metric-${tone}`} key={label}>
              <span className="campaign-performance-metric-icon"><Icon size={17} /></span>
              <span><small>{label}</small><strong>{value}</strong><em>{detail}</em></span>
            </article>
          ))}
        </div>
        <section className="campaign-performance-section">
          <div className="section-heading">
            <div>
              <div className="section-kicker"><span className="section-kicker-line section-kicker-line-lilac" /> Campaign health</div>
              <h2>Campaign-level CPC performance</h2>
            </div>
            <span className="section-count">Simple delivery view</span>
          </div>
          <div className="campaign-performance-campaign-list">
            {rows.map((row) => (
              <article className="campaign-performance-campaign-row" key={row.id}>
                <div className="campaign-performance-campaign-top">
                  <span>
                    <strong>{row.name}</strong>
                    <small>{row.placementCount} placement{row.placementCount === 1 ? "" : "s"} - {row.status}</small>
                  </span>
                  <b>{row.qualifiedClicks.toLocaleString()} clicks</b>
                </div>
                <div className="campaign-performance-bar"><span style={{ width: `${row.used}%` }} /></div>
                <div className="campaign-performance-campaign-bottom">
                  <span>{row.qualifiedClicks.toLocaleString()} qualified clicks</span>
                  <span>{format(row.cpc)} CPC</span>
                  <span>{format(row.spend)} spend</span>
                  <span>{format(row.budget)} budget</span>
                  <span>{format(row.remaining)} remaining</span>
                  <Link className="section-link" href="/campaign-owner/placements">View placements <ArrowUpRight size={13} /></Link>
                </div>
              </article>
            ))}
          </div>
          {loading && (
            <div className="campaign-performance-empty">
              <BarChart3 size={21} />
              <strong>Loading performance</strong>
              <p>Fetching your campaigns, placements and click totals.</p>
            </div>
          )}
          {failed && (
            <div className="campaign-performance-empty">
              <BarChart3 size={21} />
              <strong>Performance could not be loaded</strong>
              <p>Check that you are signed in as a Campaign Owner and that the API is running, then refresh the page.</p>
            </div>
          )}
          {!loading && !failed && rows.length === 0 && (
            <div className="campaign-performance-empty">
              <BarChart3 size={21} />
              <strong>Performance will appear after you accept a placement</strong>
              <p>Accept a Community Owner application to start tracking campaign delivery.</p>
              <Link className="section-link" href="/campaign-owner/applications">Review applications <ArrowUpRight size={14} /></Link>
            </div>
          )}
        </section>
      </div>
    </WorkspaceShell>
  );
}
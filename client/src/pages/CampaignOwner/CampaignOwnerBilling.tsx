import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BarChart3, CheckCircle2, DollarSign, MousePointer2, Receipt, WalletCards } from "lucide-react";
import { Link } from "wouter";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useCurrency } from "@/lib/currency";
import { PLATFORM_FEE_RATE, getCampaignFinancials, getClickEvents, getCpcBreakdown, moneyToNumber, readCampaigns } from "@/data/marketplaceData";
import { relayBackendEnabled } from "@/lib/relayApi";
import { useCampaignBilling, type BillingActivityItem, type BillingCampaignRow } from "./useCampaignBilling";

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
}

function readDemoBilling() {
  const campaigns = readCampaigns();
  const clicks = getClickEvents();
  const rows: BillingCampaignRow[] = [];
  const activity: BillingActivityItem[] = [];
  campaigns.forEach((campaign) => {
    const qualified = clicks.filter((click) => click.campaignId === campaign.id && click.qualification === "Qualified");
    const financials = getCampaignFinancials(campaign.cpc, campaign.budget, qualified.length);
    const breakdown = getCpcBreakdown(campaign.cpc);
    rows.push({
      id: campaign.id,
      linkId: campaign.id,
      name: campaign.name,
      status: campaign.status,
      budget: moneyToNumber(campaign.budget),
      spend: financials.advertiserSpend,
      fees: financials.platformRevenue,
      payouts: financials.communityOwnerEarnings,
      clicks: financials.qualifiedClicks,
      remaining: financials.remainingBudget,
    });
    qualified.forEach((click) =>
      activity.push({ id: click.clickId, campaign: campaign.name, createdAt: click.timestamp, trackingId: click.trackingId, charge: breakdown.advertiserCpc, fee: breakdown.platformFee }),
    );
  });
  activity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { rows, activity: activity.slice(0, 8) };
}

function statusTone(status: string) {
  return status === "Active" ? "moss" : status === "Completed" || status === "Budget Exhausted" ? "coral" : "lilac";
}

export default function CampaignOwnerBilling() {
  const { format } = useCurrency();
  const backend = relayBackendEnabled();
  const live = useCampaignBilling();
  const [demo, setDemo] = useState(readDemoBilling);

  useEffect(() => {
    if (backend) return;
    const refresh = () => setDemo(readDemoBilling());
    const events = ["storage", "ownerboard:click-events-updated", "ownerboard:campaigns-updated"];
    events.forEach((event) => window.addEventListener(event, refresh));
    return () => events.forEach((event) => window.removeEventListener(event, refresh));
  }, [backend]);

  const rows = backend ? live.rows : demo.rows;
  const activity = backend ? live.activity : demo.activity;
  const loading = backend && live.loading;
  const failed = backend && live.failed;

  const totals = useMemo(
    () =>
      rows.reduce(
        (sum, row) => ({
          spend: sum.spend + row.spend,
          fees: sum.fees + row.fees,
          payouts: sum.payouts + row.payouts,
          clicks: sum.clicks + row.clicks,
          remaining: sum.remaining + row.remaining,
          budget: sum.budget + row.budget,
        }),
        { spend: 0, fees: 0, payouts: 0, clicks: 0, remaining: 0, budget: 0 },
      ),
    [rows],
  );
  const activeSpend = rows.filter((row) => row.status === "Active").reduce((sum, row) => sum + row.spend, 0);
  const spendingCampaigns = rows.filter((row) => row.spend > 0).length;
  const usedPercent = totals.budget ? Math.min((totals.spend / totals.budget) * 100, 100) : 0;

  return (
    <WorkspaceShell active="Billing" workspaceLabel="Campaign Owner" workspaceMode="campaign-owner">
      <div className="dashboard-body campaign-owner-overview">
       
        <section className="campaign-owner-heading">
          <div>
            <span className="section-kicker"><span className="section-kicker-line" /> Campaign Owner billing</span>
            <h1>Billing overview</h1>
            <p>Track qualified-click spend, platform fees, Community Owner payouts, and remaining campaign budget from your live marketplace data.</p>
          </div>
          <Link className="primary-owner-button" href="/campaign-owner/campaigns"><BarChart3 size={16} /> View campaigns</Link>
        </section>
        <div className="campaign-owner-metric-grid">
          <BillingMetric label="Total campaign spend" value={format(totals.spend)} detail={`${totals.clicks.toLocaleString()} qualified clicks`} icon={DollarSign} tone="coral" />
          <BillingMetric label="Platform fees" value={format(totals.fees)} detail={`${Math.round(PLATFORM_FEE_RATE * 100)}% of qualified-click charges`} icon={Receipt} tone="lilac" />
          <BillingMetric label="Community Owner payouts" value={format(totals.payouts)} detail="Paid out of qualified-click charges" icon={WalletCards} tone="moss" />
          <BillingMetric label="Remaining campaign budget" value={format(totals.remaining)} detail={`${format(totals.budget)} total budget`} icon={CheckCircle2} tone="lilac" />
          <BillingMetric label="Active campaign spend" value={format(activeSpend)} detail="Active campaigns only" icon={BarChart3} tone="coral" />
          <BillingMetric label="Campaigns with spending" value={spendingCampaigns} detail={`${rows.length} campaigns in billing data`} icon={MousePointer2} tone="moss" />
        </div>
        <section className="campaign-owner-two-column">
          <section className="campaign-owner-section">
            <div className="section-heading">
              <div>
                <div className="section-kicker"><span className="section-kicker-line section-kicker-line-lilac" /> Campaign ledger</div>
                <h2>Spend by campaign</h2>
              </div>
              <span className="section-count">{rows.length} campaigns</span>
            </div>
            <div className="campaign-owner-campaign-grid">
              {rows.map((row) => (
                <Link className="campaign-owner-campaign-card" href={`/campaign-owner/campaigns/${row.linkId}`} key={row.id}>
                  <div className="campaign-owner-campaign-top">
                    <span className={`campaign-owner-status campaign-owner-status-${statusTone(row.status)}`}><span /> {row.status}</span>
                    <ArrowUpRight size={17} />
                  </div>
                  <h3>{row.name}</h3>
                  <div className="campaign-owner-campaign-meta">
                    <span><strong>{format(row.spend)}</strong><small>campaign spend</small></span>
                    <span><strong>{row.clicks.toLocaleString()}</strong><small>qualified clicks</small></span>
                    <span><strong>{format(row.remaining)}</strong><small>budget left</small></span>
                  </div>
                  <div className="campaign-owner-campaign-footer"><span>{format(row.fees)} platform fee</span><ArrowUpRight size={14} /></div>
                </Link>
              ))}
            </div>
            {loading && (
              <div className="campaign-applications-empty">
                <CheckCircle2 size={21} />
                <strong>Loading billing</strong>
                <p>Fetching your campaigns and charges.</p>
              </div>
            )}
            {failed && (
              <div className="campaign-applications-empty">
                <CheckCircle2 size={21} />
                <strong>Billing could not be loaded</strong>
                <p>Check that you are signed in as a Campaign Owner and that the API is running, then refresh the page.</p>
              </div>
            )}
            {!loading && !failed && rows.length === 0 && (
              <div className="campaign-applications-empty">
                <CheckCircle2 size={21} />
                <strong>No campaigns in billing yet</strong>
                <p>Create a campaign to begin tracking billing activity.</p>
              </div>
            )}
          </section>
          <div className="campaign-owner-budget-card billing-budget-card">
            <div className="section-heading">
              <div>
                <div className="section-kicker"><span className="section-kicker-line section-kicker-line-lilac" /> Budget health</div>
                <h2>Portfolio budget</h2>
              </div>
              <DollarSign size={18} />
            </div>
            <strong className="campaign-owner-budget-number">{format(totals.spend)}</strong>
            <div className="campaign-owner-budget-bar"><span style={{ width: `${usedPercent}%` }} /></div>
            <div className="campaign-owner-budget-labels"><span>{Math.round(usedPercent)}% used</span><span>{format(totals.remaining)} left</span></div>
            <p className="campaign-owner-billing-note">Historical spend remains included for Completed, Paused, and Budget Exhausted campaigns.</p>
            <Link className="section-link" href="/campaign-owner/performance">Open performance <ArrowUpRight size={14} /></Link>
          </div>
        </section>
        <section className="campaign-owner-section">
          <div className="section-heading">
            <div>
              <div className="section-kicker"><span className="section-kicker-line" /> Recent billing activity</div>
              <h2>Qualified-click transactions</h2>
            </div>
            <span className="section-count">Latest 8 charges</span>
          </div>
          <div className="campaign-owner-application-list">
            {activity.map((item) => (
              <div className="campaign-owner-application-row" key={item.id}>
                <span className="campaign-owner-application-avatar campaign-owner-application-avatar-moss"><MousePointer2 size={14} /></span>
                <span><strong>{item.campaign}</strong><small>{dateLabel(item.createdAt)} - {item.trackingId}</small></span>
                <b>{format(item.charge)} spend - {format(item.fee)} fee</b>
                <CheckCircle2 size={15} />
              </div>
            ))}
            {!loading && !failed && activity.length === 0 && (
              <div className="campaign-applications-empty">
                <CheckCircle2 size={21} />
                <strong>No qualified-click billing activity yet</strong>
                <p>Charges appear here after a qualified click is recorded on one of your active placements.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}

function BillingMetric({ label, value, detail, icon: Icon, tone }: { label: string; value: string | number; detail: string; icon: typeof DollarSign; tone: "coral" | "lilac" | "moss" }) {
  return (
    <article className={`campaign-owner-metric campaign-owner-metric-${tone}`}>
      <span className="campaign-owner-metric-icon"><Icon size={17} /></span>
      <span><small>{label}</small><strong>{value}</strong><em>{detail}</em></span>
    </article>
  );
}
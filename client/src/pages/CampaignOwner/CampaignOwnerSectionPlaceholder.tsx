import { ArrowLeft, ArrowUpRight, CheckCircle2, FilePlus2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import WorkspaceShell from "@/components/WorkspaceShell";

const labels: Record<string, { title: string; detail: string }> = {
  campaigns: { title: "My Campaigns", detail: "Your campaign portfolio will live here, including draft, live, paused, and completed campaigns." },
  create: { title: "Create Campaign", detail: "Build a campaign brief, define the audience, set the budget, and publish it for Community Owner applications." },
  applications: { title: "Applications", detail: "Review Community Owner applications, compare audience fit, and accept or reject placements." },
  placements: { title: "Active Placements", detail: "Track accepted communities, live posts, delivery status, and campaign click results." },
  performance: { title: "Performance", detail: "Compare campaign clicks, reach, community placements, and spend over time." },
  billing: { title: "Billing", detail: "Review campaign budgets, committed spend, invoices, and payment activity." },
  activity: { title: "Activity", detail: "See campaign publishes, application decisions, placement updates, and reporting events." },
  settings: { title: "Settings", detail: "Manage advertiser workspace preferences and campaign defaults." },
};

export default function CampaignOwnerSectionPlaceholder() {
  const [, params] = useRoute<{ section: string }>("/campaign-owner/:section");
  const section = labels[params?.section ?? ""] ?? labels.campaigns;
  return <WorkspaceShell active={section.title} workspaceLabel="Campaign Owner" workspaceMode="campaign-owner">
    <div className="dashboard-body campaign-owner-placeholder"><Link className="hero-link route-back-link" href="/campaign-owner"><ArrowLeft size={15} /> Back to Campaign Owner overview</Link><section className="campaign-owner-placeholder-hero"><div><span className="section-kicker"><span className="section-kicker-line" /> Campaign Owner workspace</span><h1>{section.title}</h1><p>{section.detail}</p></div><span className="development-status">Coming next</span></section><section className="campaign-owner-placeholder-panel"><span className="campaign-owner-placeholder-icon">{params?.section === "create" ? <FilePlus2 size={19} /> : <CheckCircle2 size={19} />}</span><h2>Campaign workflow placeholder</h2><p>The overview is ready for review. This section will be built separately while the Campaign Owner workflow is refined.</p><Link className="section-link" href="/campaign-owner"><ArrowUpRight size={14} /> Return to overview</Link></section></div>
  </WorkspaceShell>;
}

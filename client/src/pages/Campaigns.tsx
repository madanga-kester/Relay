import { ArrowLeft, ArrowUpRight, CalendarDays, Check, ChevronDown, ClipboardList, Clock3, Copy, ExternalLink, Filter, Globe2, Link2, MapPin, MousePointer2, Sparkles, Target, UsersRound, WalletCards, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import WorkspaceShell from "@/components/WorkspaceShell";
import { formatCurrency, useCurrency } from "@/lib/currency";

type Campaign = {
  id: string;
  advertiser: string;
  name: string;
  category: string;
  audience: string;
  platform: string;
  location: string;
  duration: string;
  requirements: string;
  payment: { amount: number; suffix: string };
  reach: string;
  deadline: string;
  color: "coral" | "lilac" | "moss";
  featured?: boolean;
};

const campaigns: Campaign[] = [
  { id: "loop-finance", advertiser: "Loop Finance", name: "Build a calmer money routine", category: "Finance & education", audience: "Career-focused adults", platform: "Telegram", location: "US, UK, CA", duration: "14 days", requirements: "1 post + pinned link", payment: { amount: 6, suffix: "per lead" }, reach: "Est. 3.2k clicks", deadline: "Jul 04, 2025", color: "lilac", featured: true },
  { id: "moss-market", advertiser: "Moss Market", name: "Weekend plans, made easier", category: "Lifestyle & local", audience: "Local discovery seekers", platform: "WhatsApp", location: "Austin, TX", duration: "7 days", requirements: "1 post + 48h visibility", payment: { amount: 2.8, suffix: "per click" }, reach: "Est. 1.8k clicks", deadline: "Jul 11, 2025", color: "moss" },
  { id: "orbit-mobile", advertiser: "Orbit Mobile", name: "Make space for better plans", category: "Technology", audience: "Mobile-first communities", platform: "Discord", location: "Global", duration: "21 days", requirements: "2 posts + community pin", payment: { amount: 4.2, suffix: "per signup" }, reach: "Est. 5.4k reach", deadline: "Jul 18, 2025", color: "coral" },
  { id: "studio-notes", advertiser: "Studio Notes", name: "A better creative workflow", category: "Design & creative", audience: "Designers and makers", platform: "Facebook", location: "US, UK, AU", duration: "10 days", requirements: "1 post + discussion prompt", payment: { amount: 180, suffix: "flat fee" }, reach: "Est. 2.1k reach", deadline: "Jul 22, 2025", color: "lilac" },
  { id: "field-guide", advertiser: "Field Guide", name: "Find your next outside day", category: "Travel & experiences", audience: "Weekend adventurers", platform: "Other", location: "Pacific Northwest", duration: "30 days", requirements: "3 posts across the month", payment: { amount: 320, suffix: "flat fee" }, reach: "Est. 8k reach", deadline: "Aug 02, 2025", color: "moss" },
  { id: "good-ground", advertiser: "Good Ground", name: "Small habits, real momentum", category: "Wellness", audience: "Wellness-curious adults", platform: "Telegram", location: "Global", duration: "14 days", requirements: "1 post + tracking link", payment: { amount: 3.4, suffix: "per click" }, reach: "Est. 2.6k clicks", deadline: "Aug 08, 2025", color: "coral" },
];

const filterOptions = {
  platform: ["All platforms", "WhatsApp", "Telegram", "Facebook", "Discord", "Other"],
  category: ["All categories", "Finance & education", "Lifestyle & local", "Technology", "Design & creative", "Travel & experiences", "Wellness"],
  audience: ["All audiences", "Career-focused adults", "Local discovery seekers", "Mobile-first communities", "Designers and makers", "Weekend adventurers", "Wellness-curious adults"],
  location: ["All locations", "Global", "US, UK, CA", "Austin, TX", "US, UK, AU", "Pacific Northwest"],
  payment: ["All payment types", "Per lead", "Per click", "Per signup", "Flat fee"],
  duration: ["Any duration", "7 days", "10 days", "14 days", "21 days", "30 days"],
};

type Filters = { platform: string; category: string; audience: string; location: string; payment: string; duration: string };
const initialFilters: Filters = { platform: filterOptions.platform[0], category: filterOptions.category[0], audience: filterOptions.audience[0], location: filterOptions.location[0], payment: filterOptions.payment[0], duration: filterOptions.duration[0] };

function BrandMark({ color }: { color: Campaign["color"] }) { return <span className={`brand-mark brand-mark-${color}`}><span /><span /><span /></span>; }
function paymentMatches(payment: Campaign["payment"], filter: string) { if (filter === "All payment types") return true; if (filter === "Per lead") return payment.suffix.includes("lead"); if (filter === "Per click") return payment.suffix.includes("click"); if (filter === "Per signup") return payment.suffix.includes("signup"); return payment.suffix.includes("flat"); }

function MarketplaceCard({ campaign, onView }: { campaign: Campaign; onView: () => void }) {
  const { format } = useCurrency();
  return <article className={`marketplace-card ${campaign.featured ? "marketplace-card-featured" : ""}`}><div className="marketplace-card-top"><div className="campaign-identity"><BrandMark color={campaign.color} /><div><div className="campaign-brand">{campaign.advertiser}</div><div className="campaign-category">{campaign.category}</div></div></div>{campaign.featured && <span className="featured-badge"><Sparkles size={12} /> Good fit</span>}</div><h2>{campaign.name}</h2><p className="marketplace-audience"><Target size={14} /> {campaign.audience}</p><div className="marketplace-highlights"><span><Globe2 size={13} /> {campaign.platform}</span><span><MapPin size={13} /> {campaign.location}</span><span><Clock3 size={13} /> {campaign.duration}</span></div><div className="marketplace-card-footer"><div><small>Payment offered</small><strong>{format(campaign.payment.amount, campaign.payment.amount % 1 ? 2 : 0)} {campaign.payment.suffix}</strong></div><div><small>Estimated</small><strong>{campaign.reach}</strong></div></div><div className="marketplace-deadline"><CalendarDays size={13} /> Apply by {campaign.deadline}<button className="view-campaign-button" onClick={onView}>View Campaign <ArrowUpRight size={15} /></button></div></article>;
}

function CampaignDialog({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const { format } = useCurrency();
  const [accepted, setAccepted] = useState(false);
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="campaign-dialog" role="dialog" aria-modal="true" aria-labelledby="campaign-dialog-title"><button className="dialog-close" onClick={onClose} aria-label="Close campaign details"><X size={16} /></button><div className="campaign-dialog-identity"><BrandMark color={campaign.color} /><div><div className="campaign-brand">{campaign.advertiser}</div><div className="campaign-category">{campaign.category}</div></div></div><h2 id="campaign-dialog-title">{campaign.name}</h2><p className="dialog-intro">A campaign opportunity for owners who know how to start an authentic conversation with the right community.</p><div className="campaign-detail-grid"><div><small>Target audience</small><strong>{campaign.audience}</strong></div><div><small>Required platform</small><strong>{campaign.platform}</strong></div><div><small>Campaign duration</small><strong>{campaign.duration}</strong></div><div><small>Campaign deadline</small><strong>{campaign.deadline}</strong></div><div><small>Community requirements</small><strong>{campaign.requirements}</strong></div><div><small>Estimated clicks / reach</small><strong>{campaign.reach}</strong></div></div><div className="campaign-payment-callout"><WalletCards size={18} /><span><small>Payment offered</small><strong>{format(campaign.payment.amount, campaign.payment.amount % 1 ? 2 : 0)} {campaign.payment.suffix}</strong></span></div>{accepted ? <div className="dialog-accepted"><Check size={16} /><span>Campaign added to your workspace. Your post kit will be ready shortly.</span><Link className="workspace-open-link" href={`/campaigns/${campaign.id}/workspace`}>Open Campaign Workspace <ArrowUpRight size={14} /></Link></div> : <button className="accept-button dialog-submit" onClick={() => setAccepted(true)}>Accept campaign <ArrowUpRight size={16} /></button>}</section></div>;
}

export default function Campaigns() {
  const [filters, setFilters] = useState(initialFilters); const [selected, setSelected] = useState<Campaign | null>(null); const [filtersOpen, setFiltersOpen] = useState(false);
  const filtered = useMemo(() => campaigns.filter((campaign) => (filters.platform === "All platforms" || campaign.platform === filters.platform) && (filters.category === "All categories" || campaign.category === filters.category) && (filters.audience === "All audiences" || campaign.audience === filters.audience) && (filters.location === "All locations" || campaign.location === filters.location) && paymentMatches(campaign.payment, filters.payment) && (filters.duration === "Any duration" || campaign.duration === filters.duration)), [filters]);
  const updateFilter = (key: keyof Filters, value: string) => setFilters((current) => ({ ...current, [key]: value }));
  const clearFilters = () => setFilters(initialFilters);
  return <WorkspaceShell active="Campaigns"><div className="dashboard-body campaigns-marketplace"><section className="route-page-heading marketplace-heading"><div><span className="section-kicker"><span className="section-kicker-line" /> Opportunity marketplace</span><h1>Campaigns</h1><p>Browse businesses looking for the right communities. Find a good fit, understand the ask, and choose the opportunities worth your audience’s attention.</p></div><div className="marketplace-summary"><strong>{campaigns.length}</strong><span>open opportunities</span></div></section><section className="marketplace-filter-shell"><div className="marketplace-filter-bar"><div className="filter-title"><Filter size={15} /><strong>Find a good fit</strong></div><button className="filter-toggle" onClick={() => setFiltersOpen((open) => !open)}>{filtersOpen ? "Hide filters" : "Show filters"}<ChevronDown size={14} className={filtersOpen ? "filter-chevron-open" : ""} /></button><span className="filter-result-count">{filtered.length} opportunities</span></div>{filtersOpen && <div className="filter-grid">{(Object.keys(filterOptions) as Array<keyof Filters>).map((key) => <label key={key}><span>{key === "platform" ? "Platform" : key === "category" ? "Category" : key === "audience" ? "Audience" : key === "location" ? "Location" : key === "payment" ? "Payment" : "Duration"}</span><select value={filters[key]} onChange={(event) => updateFilter(key, event.target.value)}>{filterOptions[key].map((option) => <option key={option}>{option}</option>)}</select></label>)}<button className="clear-filters" onClick={clearFilters}>Clear filters</button></div>}</section><section className="marketplace-section"><div className="section-heading"><div><div className="section-kicker"><span className="section-kicker-line section-kicker-line-lilac" /> Matched to your communities</div><h2>Open opportunities</h2></div><span className="section-count">{filtered.length} available now</span></div>{filtered.length === 0 ? <div className="empty-state marketplace-empty"><span className="empty-state-icon"><Filter size={20} /></span><h3>No campaigns match those filters</h3><p>Try widening the audience, platform, or payment filters.</p><button className="clear-filters" onClick={clearFilters}>Reset filters</button></div> : <div className="marketplace-grid">{filtered.map((campaign) => <MarketplaceCard campaign={campaign} onView={() => setSelected(campaign)} key={campaign.id} />)}</div>}</section></div>{selected && <CampaignDialog campaign={selected} onClose={() => setSelected(null)} />}</WorkspaceShell>;
}

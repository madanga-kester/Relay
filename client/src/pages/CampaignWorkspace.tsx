import { ArrowLeft, ArrowUpRight, Check, CheckCircle2, Clipboard, Clock3, Copy, Link2, MousePointer2, UsersRound } from "lucide-react";
import { useState } from "react";
import { Link, useRoute } from "wouter";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useCurrency } from "@/lib/currency";

const communities = [
  { name: "After Hours", platform: "Discord", slug: "after-hours" },
  { name: "Design Dispatch", platform: "Telegram", slug: "design-dispatch" },
  { name: "Sunday Selects", platform: "WhatsApp", slug: "sunday-selects" },
];

const acceptedCampaigns = {
  "loop-finance": { id: "4821", advertiser: "Loop Finance", title: "Build a calmer money routine", brand: "LOOP", defaultCommunity: "after-hours", clicks: "284", unique: "231", earned: 1200, expected: 2850, remaining: "12 days", deadline: "Jul 04", creativeHeadline: "Build small money habits that actually stick.", creativeDescription: "Loop helps you turn financial goals into simple, repeatable routines — so progress feels less overwhelming and more like your own." },
  "moss-market": { id: "4822", advertiser: "Moss Market", title: "Weekend plans, made easier", brand: "MOSS", defaultCommunity: "sunday-selects", clicks: "167", unique: "139", earned: 720, expected: 1640, remaining: "18 days", deadline: "Jul 11", creativeHeadline: "Make your next weekend feel closer.", creativeDescription: "Moss Market helps local communities discover simple, memorable plans without the endless scrolling." },
  "studio-notes": { id: "4823", advertiser: "Studio Notes", title: "A better creative workflow", brand: "STUDIO", defaultCommunity: "design-dispatch", clicks: "96", unique: "82", earned: 540, expected: 1180, remaining: "21 days", deadline: "Jul 22", creativeHeadline: "Make room for your best creative work.", creativeDescription: "Studio Notes brings thoughtful prompts, tools, and ideas to designers and makers who want a calmer workflow." },
} as const;

export default function CampaignWorkspace() {
  const { format } = useCurrency();
  const [, params] = useRoute<{ slug: string }>("/campaigns/:slug/workspace");
  const campaign = acceptedCampaigns[params?.slug as keyof typeof acceptedCampaigns] ?? acceptedCampaigns["loop-finance"];
  const [community, setCommunity] = useState(() => communities.find((item) => item.slug === campaign.defaultCommunity) ?? communities[0]);
  const [copied, setCopied] = useState<"ad" | "link" | null>(null);
  const [posted, setPosted] = useState(false);
  const trackingLink = `relay.to/go/${community.slug}/campaign-${campaign.id}`;

  const copy = async (type: "ad" | "link", value: string) => {
    await navigator.clipboard?.writeText(value);
    setCopied(type);
    window.setTimeout(() => setCopied((current) => current === type ? null : current), 1800);
  };

  return (
    <WorkspaceShell active="Campaigns">
      <div className="dashboard-body campaign-workspace-page">
        <section className="workspace-heading">
          <Link className="hero-link route-back-link" href="/campaigns"><ArrowLeft size={15} /> Back to campaigns</Link>
          <div className="workspace-heading-row">
            <div>
              <span className="section-kicker"><span className="section-kicker-line" /> Accepted campaign · {campaign.advertiser}</span>
              <h1>{campaign.title}</h1>
              <p>One clear path from approved advertisement to measurable community earnings.</p>
            </div>
            <span className="status-pill status-pill-active"><span /> Active</span>
          </div>
        </section>

        <div className="workspace-community-bar">
          <div className="workspace-community-select">
            <span className="workspace-select-label">Posting to</span>
            <select value={community.slug} onChange={(event) => setCommunity(communities.find((item) => item.slug === event.target.value) ?? communities[0])}>
              {communities.map((item) => <option value={item.slug} key={item.slug}>{item.name} · {item.platform}</option>)}
            </select>
          </div>
          <div className="workspace-quick-metrics">
            <span><MousePointer2 size={14} /> {campaign.clicks} clicks</span>
            <span>{format(campaign.earned, 0)} earned</span>
          </div>
        </div>

        <div className="workspace-steps">
          <section className="workspace-step workspace-step-ad">
            <div className="workspace-step-index">01</div>
            <div className="workspace-step-content">
              <div className="workspace-step-heading">
                <div><span className="workspace-step-kicker">Step 1</span><h2>Review Advertisement</h2><p>Use the approved creative exactly as supplied by the advertiser.</p></div>
                <span className="step-state step-state-ready"><CheckCircle2 size={14} /> Ready</span>
              </div>
              <div className="advertisement-preview">
                <div className="advertisement-visual"><span className="ad-visual-badge">{campaign.brand}</span><strong>{campaign.title}</strong><span className="ad-visual-lines" /><span className="ad-visual-orb" /></div>
                <div className="advertisement-copy">
                  <span className="ad-label">Approved advertisement</span>
                  <h3>{campaign.creativeHeadline}</h3>
                  <p>{campaign.creativeDescription}</p>
                  <button className={`copy-ad-button ${copied === "ad" ? "copy-ad-button-success" : ""}`} onClick={() => copy("ad", `${campaign.creativeHeadline} ${campaign.creativeDescription} Start here: ${trackingLink}`)}>
                    {copied === "ad" ? <Check size={15} /> : <Copy size={15} />} {copied === "ad" ? "Advertisement copied" : "Copy Advertisement"}
                  </button>
                </div>
              </div>
              <div className="ad-cta-row"><span><strong>Call to action</strong> Visit the campaign destination <ArrowUpRight size={14} /></span><span><strong>Supplied by</strong> {campaign.advertiser}</span></div>
            </div>
          </section>

          <section className="workspace-step workspace-step-link">
            <div className="workspace-step-index">02</div>
            <div className="workspace-step-content">
              <div className="workspace-step-heading">
                <div><span className="workspace-step-kicker">Step 2</span><h2>Get Your Tracking Link</h2><p>Share this link with your community. Clicks will be recorded automatically.</p></div>
                <span className="step-state"><Link2 size={14} /> Unique to you</span>
              </div>
              <div className="tracking-workspace-card">
                <div className="tracking-workspace-top"><div><span className="ad-label">Your community link</span><strong>{community.name}</strong></div><span className="tracking-live-dot"><span /> Tracking live</span></div>
                <div className="tracking-link-identity"><span>Campaign <strong>{campaign.id}</strong></span><span>Advertiser <strong>{campaign.advertiser}</strong></span><span>Community <strong>{community.name}</strong></span><span>Owner <strong>Ava Sinclair</strong></span></div>
                <div className="workspace-link-field"><span>https://{trackingLink}</span><button className={copied === "link" ? "copy-link-success" : ""} onClick={() => copy("link", `https://${trackingLink}`)}>{copied === "link" ? <Check size={16} /> : <Copy size={16} />} {copied === "link" ? "Copied" : "Copy Tracking Link"}</button></div>
                <div className="tracking-workspace-stats"><span><strong>{campaign.clicks}</strong><small>clicks</small></span><span><strong>{format(campaign.earned, 0)}</strong><small>earned</small></span><span><strong>{campaign.remaining}</strong><small>remaining</small></span></div>
              </div>
              <div className="tracking-boundary-note"><Link2 size={15} /><span><strong>What Relay tracks</strong> Relay records visits only after someone leaves WhatsApp, Telegram, Facebook, Discord, or another community app and opens this tracked destination. Relay cannot see private activity inside those apps.</span></div>
            </div>
          </section>

          <section className={`workspace-step workspace-step-post ${posted ? "workspace-step-complete" : ""}`}>
            <div className="workspace-step-index">03</div>
            <div className="workspace-step-content">
              <div className="workspace-step-heading"><div><span className="workspace-step-kicker">Step 3</span><h2>Post to Your Community</h2><p>Three simple actions to get your campaign moving.</p></div>{posted && <span className="step-state step-state-complete"><CheckCircle2 size={14} /> Posted</span>}</div>
              <ol className="posting-checklist">
                <li><span>1</span><div><strong>Copy the approved advertisement.</strong><small>Keep the wording natural, but don’t remove the tracking link.</small></div></li>
                <li><span>2</span><div><strong>Open {community.name}.</strong><small>Choose the community where this campaign is a good fit.</small></div></li>
                <li><span>3</span><div><strong>Post the advertisement and tracking link.</strong><small>Keep the link in the first two lines so it is easy to find.</small></div></li>
              </ol>
              <button className={`posted-button ${posted ? "posted-button-complete" : ""}`} onClick={() => setPosted(true)}>{posted ? <><Check size={16} /> Posted to {community.name}</> : <>I've Posted It <ArrowUpRight size={16} /></>}</button>
            </div>
          </section>

          <section className="workspace-step workspace-step-results">
            <div className="workspace-step-index">04</div>
            <div className="workspace-step-content">
              <div className="workspace-step-heading"><div><span className="workspace-step-kicker">Step 4</span><h2>Track Results</h2><p>Your campaign performance updates automatically after you post.</p></div><span className="step-state step-state-live"><span /> Live tracking</span></div>
              <div className="workspace-results-chart"><div className="workspace-results-chart-header"><span>Clicks over time</span><strong>{campaign.clicks} total</strong></div><div className="workspace-results-bars">{[28, 42, 35, 55, 48, 68, 60, 84].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div><div className="workspace-results-chart-labels"><span>Jun 04</span><span>Jun 11</span><span>Today</span></div></div>
              <div className="results-grid"><div><MousePointer2 size={16} /><small>Clicks</small><strong>{campaign.clicks}</strong><span>+36 this week</span></div><div><UsersRound size={16} /><small>Unique visitors</small><strong>{campaign.unique}</strong><span>81% of clicks</span></div><div><Clock3 size={16} /><small>Time remaining</small><strong>{campaign.remaining}</strong><span>Ends {campaign.deadline}</span></div><div><Clipboard size={16} /><small>Campaign status</small><strong>{posted ? "Posted" : "Ready to post"}</strong><span>{posted ? "Tracking active" : "Waiting for your post"}</span></div><div className="results-card-earnings"><span className="metric-currency">{format(campaign.expected, 0).split(" ")[0]}</span><small>Expected earnings</small><strong>{format(campaign.expected, 0)}</strong><span>Based on current reach</span></div></div>
            </div>
          </section>
        </div>
        <div className="workspace-footer-note"><CheckCircle2 size={15} /> You stay in control. Relay records performance; you decide what belongs in your community.</div>
      </div>
    </WorkspaceShell>
  );
}

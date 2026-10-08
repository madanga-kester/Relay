import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Globe2,
  HelpCircle,
  LineChart,
  Link2,
  MessageCircle,
  Moon,
  MousePointer2,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Target,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { Link } from "wouter";

type LandingSection = "overview" | "how-it-works" | "advertisers" | "communities" | "why-relay";
type Platform = "whatsapp" | "telegram" | "facebook";

function Brand() {
  return <Link href="/" className="public-brand"><span className="public-brand-mark"><i /><i /><i /></span>relay</Link>;
}

const advertiserSteps = ["Create a campaign", "Define your audience and budget", "Get matched with communities", "Track qualified clicks and results"];
const communitySteps = ["Add your community", "Discover relevant campaigns", "Apply to campaigns", "Publish approved ads and earn"];
const advertiserPoints = ["Reach relevant communities", "Control CPC and campaign budgets", "Choose your targeting", "Track qualified traffic", "Pay based on measurable results"];
const communityPoints = ["Monetize your existing audience", "Find relevant campaigns", "Choose opportunities that fit", "Use unique tracking links", "Earn from qualified clicks"];
const faqs = [
  { question: "How does Relay charge advertisers?", answer: "Relay is built around CPC campaigns. Advertisers choose a cost per click and campaign budget, then qualified clicks are measured against those settings. This keeps campaign spend connected to the traffic that matters." },
  { question: "How do Community Owners earn?", answer: "Community Owners apply to campaigns that fit their audience, publish approved placements, and earn from qualified clicks generated through their unique tracking links. Earnings remain visible in the marketplace workflow." },
  { question: "Can I control which campaigns appear in my community?", answer: "Yes. Community Owners choose which opportunities fit their community before applying. Campaign Owners also define targeting, budgets, and placement requirements so both sides have clearer expectations." },
  { question: "What makes a click qualified?", answer: "Qualified clicks are validated through Relay's existing tracking and financial rules. The platform protects campaign budgets and avoids treating duplicate or invalid activity as new billable results." },
  { question: "Do I need to pay before I can explore the marketplace?", answer: "You can create an account and set up your workspace before launching activity. Payment processing and settlement can be added later without changing the core campaign, placement, or tracking workflow." },
];

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState<LandingSection>("overview");
  const [isDark, setIsDark] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const showSection = (section: LandingSection) => setActiveSection(section);

  useEffect(() => {
    if (activeSection === "overview") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeSection]);

  return <div className={`public-site ${isDark ? "public-site-dark" : ""}`}>
    <header className="public-nav">
      <Brand />
      <nav aria-label="Landing page sections">
        <button type="button" className={`public-nav-section ${activeSection === "overview" ? "public-nav-section-active" : ""}`} onClick={() => showSection("overview")}>Home</button>
        <button type="button" className={`public-nav-section ${activeSection === "how-it-works" ? "public-nav-section-active" : ""}`} onClick={() => showSection("how-it-works")}>How It Works</button>
        <button type="button" className={`public-nav-section ${activeSection === "advertisers" ? "public-nav-section-active" : ""}`} onClick={() => showSection("advertisers")}>For Advertisers</button>
        <button type="button" className={`public-nav-section ${activeSection === "communities" ? "public-nav-section-active" : ""}`} onClick={() => showSection("communities")}>For Communities</button>
        <button type="button" className={`public-nav-section ${activeSection === "why-relay" ? "public-nav-section-active" : ""}`} onClick={() => showSection("why-relay")}>Why Relay</button>
      </nav>
      <div className="public-nav-actions"><button type="button" className="public-theme-toggle" aria-label={isDark ? "Use light theme" : "Use dark theme"} onClick={() => setIsDark((value) => !value)}>{isDark ? <Sun size={15} /> : <Moon size={15} />}</button><Link href="/login" className="public-sign-in">Sign In</Link><Link href="/register" className="public-nav-cta">Get Started <ArrowRight size={15} /></Link></div>
    </header>

    <main>
      <section className="public-hero"><div className="public-hero-copy"><span className="public-eyebrow"><span /> Performance-based community advertising</span><h1>Turn Communities<br /><em>Into Revenue.</em></h1><p>Connect advertisers with trusted online communities and turn qualified attention into measurable results.</p><div className="public-hero-actions"><Link href="/register?role=advertiser" className="public-button public-button-coral">Start Advertising <ArrowRight size={16} /></Link><Link href="/register?role=community-owner" className="public-button public-button-light">Earn From Your Community <ArrowRight size={16} /></Link></div><div className="public-hero-note"><Check size={14} /> CPC pricing · transparent earnings · qualified clicks</div></div><CommunityPreview /></section>
      <section className="public-proof-strip"><span><BarChart3 size={16} /> Transparent CPC pricing</span><span><Link2 size={16} /> Unique tracking links</span><span><Check size={16} /> Verified communities</span><span><WalletCards size={16} /> No vanity metrics</span></section>

      <div ref={sectionRef} className="public-section-switcher" aria-live="polite">
        {activeSection === "overview" && <section className="public-section public-overview-panel"><div className="public-section-heading"><span className="public-eyebrow public-eyebrow-dark"><span /> Start with the marketplace</span><h2>One marketplace.<br /><em>Two ways to grow.</em></h2><p>Choose a path below to see how Relay connects advertisers with trusted communities and turns qualified attention into measurable results.</p></div><div className="public-switcher-cards"><button type="button" className="public-switcher-card public-switcher-card-coral" onClick={() => showSection("advertisers")}><Target size={19} /><strong>For Advertisers</strong><span>Reach people where attention already lives.</span><b>Explore advertiser tools <ArrowRight size={14} /></b></button><button type="button" className="public-switcher-card public-switcher-card-lilac" onClick={() => showSection("communities")}><UsersRound size={19} /><strong>For Community Owners</strong><span>Turn your audience into a transparent revenue stream.</span><b>Explore community earnings <ArrowRight size={14} /></b></button></div><div className="public-measure-cards"><Measure icon={<MousePointer2 />} title="Qualified clicks" text="Only validated clicks become billable results." /><Measure icon={<Target />} title="CPC pricing" text="Advertisers pay for measurable attention." /><Measure icon={<WalletCards />} title="Transparent earnings" text="Community Owner payouts stay visible." /></div><div className="public-quick-stats" aria-label="Relay marketplace highlights"><QuickStat value="75%" label="Community Owner share" icon={<CircleDollarSign />} /><QuickStat value="25%" label="Platform fee" icon={<LineChart />} /><QuickStat value="1 link" label="For every placement" icon={<Link2 />} /><QuickStat value="24/7" label="Campaign visibility" icon={<Activity />} /></div></section>}
        {activeSection === "how-it-works" && <section className="public-section public-switch-panel"><div className="public-section-heading"><span className="public-eyebrow public-eyebrow-dark"><span /> How the marketplace works</span><h2>Simple steps.<br /><em>Clear outcomes.</em></h2><p>Advertisers get relevant attention. Community Owners turn the audiences they have built into a sustainable revenue stream.</p></div><div className="public-workflow-grid"><Workflow title="For Advertisers" accent="coral" steps={advertiserSteps} /><Workflow title="For Community Owners" accent="lilac" steps={communitySteps} /></div><div className="public-process-note"><ShieldCheck size={20} /><div><strong>Designed for shared confidence</strong><span>Targeting, approval, placement status, tracking, and qualified-click results stay connected from launch to reporting.</span></div></div></section>}
        {activeSection === "advertisers" && <section className="public-section public-value-section public-switch-panel"><div className="public-side-copy"><span className="public-eyebrow public-eyebrow-dark"><span /> For Advertisers</span><h2>Reach people where<br />attention already lives.</h2><p>Build campaigns around real communities, set your CPC and budget, then measure the traffic that matters.</p><ul>{advertiserPoints.map(point => <li key={point}><Check size={15} />{point}</li>)}</ul><Link href="/register?role=advertiser" className="public-text-link">Advertise With Us <ArrowRight size={15} /></Link></div><div className="public-side-panel public-side-panel-coral"><div className="public-panel-label">CAMPAIGN CONTROL</div><div className="public-panel-title">Safaricom Home Fibre</div><div className="public-panel-row"><span>Cost per click</span><strong>KSh 2.00</strong></div><div className="public-panel-row"><span>Campaign budget</span><strong>KSh 108,000</strong></div><div className="public-panel-row"><span>Qualified clicks</span><strong>18,420</strong></div><div className="public-panel-meter"><span style={{ width: "72%" }} /></div><small>Campaign delivery is visible from the first click.</small></div></section>}
        {activeSection === "communities" && <section className="public-section public-value-section public-value-reverse public-switch-panel"><div className="public-side-copy"><span className="public-eyebrow public-eyebrow-dark"><span /> For Community Owners</span><h2>Your audience has<br />earned potential.</h2><p>Choose campaigns that fit your community, share approved ads, and earn transparently from qualified clicks.</p><ul>{communityPoints.map(point => <li key={point}><Check size={15} />{point}</li>)}</ul><Link href="/register?role=community-owner" className="public-text-link public-text-link-lilac">Monetize Your Community <ArrowRight size={15} /></Link></div><div className="public-side-panel public-side-panel-lilac"><div className="public-panel-label">COMMUNITY EARNINGS</div><div className="public-panel-title">Nairobi Sneaker Deals</div><div className="public-earnings-number">KSh 12,630.00</div><div className="public-panel-row"><span>Qualified clicks</span><strong>8,420</strong></div><div className="public-panel-row"><span>Earned per click</span><strong>KSh 1.50</strong></div><div className="public-panel-note"><Link2 size={14} /> Active tracking link</div></div></section>}
        {activeSection === "why-relay" && <section className="public-section public-why-panel public-switch-panel"><div className="public-section-heading"><span className="public-eyebrow public-eyebrow-dark"><span /> Why Relay</span><h2>More signal.<br /><em>Less guesswork.</em></h2><p>Relay gives both sides the structure to make better decisions: clear campaign rules, relevant community context, and performance data that can be acted on.</p></div><div className="public-principle-grid"><Principle icon={<SlidersHorizontal />} title="Control by design" text="Set targeting, CPC, budgets, and community limits before a campaign goes live." /><Principle icon={<ShieldCheck />} title="Trust in the workflow" text="Verification, approvals, placement states, and audit-friendly activity create clearer handoffs." /><Principle icon={<Sparkles />} title="Useful performance" text="Focus on qualified clicks, spend, earnings, and outcomes instead of surface-level reach." /></div><div className="public-guardrail-panel"><div><span className="public-panel-label">BUILT-IN GUARDRAILS</span><h3>Marketplace clarity at every step.</h3><p>From the first application to the final report, Relay keeps the important details close to the action.</p></div><ul><li><CheckCircle2 size={16} /> Campaign budgets remain visible</li><li><CheckCircle2 size={16} /> Historical activity is preserved</li><li><CheckCircle2 size={16} /> Community earnings stay transparent</li><li><CheckCircle2 size={16} /> Every placement has a clear status</li></ul></div></section>}
      </div>

      <section className="public-faq-section"><div className="public-section-heading"><span className="public-eyebrow public-eyebrow-dark"><span /> Questions, answered</span><h2>Know the model<br /><em>before you start.</em></h2><p>A few practical answers for advertisers and Community Owners evaluating the marketplace.</p></div><div className="public-faq-list">{faqs.map((faq, index) => { const isOpen = openFaq === index; return <article className={`public-faq-item ${isOpen ? "public-faq-item-open" : ""}`} key={faq.question}><button type="button" aria-expanded={isOpen} onClick={() => setOpenFaq(isOpen ? null : index)}><span><HelpCircle size={16} />{faq.question}</span><ChevronDown size={17} /></button>{isOpen && <p>{faq.answer}</p>}</article>; })}</div></section>
      <section className="public-final-cta"><span className="public-eyebrow"><span /> Start with the marketplace</span><h2>Your audience has value.<br /><em>Put it to work.</em></h2><p>Whether you're looking to reach the right communities or monetize one, start with the marketplace.</p><div className="public-hero-actions"><Link href="/register?role=advertiser" className="public-button public-button-coral">Start Advertising <ArrowRight size={16} /></Link><Link href="/register?role=community-owner" className="public-button public-button-light">Monetize Your Community <ArrowRight size={16} /></Link></div></section>
    </main>

    <footer className="public-footer"><div><Brand /><p>Performance-based advertising for trusted online communities.</p></div><div className="public-footer-links"><div><strong>Marketplace</strong><button type="button" onClick={() => showSection("how-it-works")}>How It Works</button><button type="button" onClick={() => showSection("advertisers")}>For Advertisers</button><button type="button" onClick={() => showSection("communities")}>For Communities</button><button type="button" onClick={() => showSection("why-relay")}>Why Relay</button></div><div><strong>Account</strong><Link href="/login">Sign In</Link><Link href="/register">Create Account</Link></div><div><strong>Legal</strong><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></div></div></footer>
  </div>;
}

function CommunityPreview() {
  const [platform, setPlatform] = useState<Platform>("whatsapp");
  const platformOrder: Platform[] = ["whatsapp", "telegram", "facebook"];
  useEffect(() => { const timer = window.setInterval(() => setPlatform(current => platformOrder[(platformOrder.indexOf(current) + 1) % platformOrder.length]), 4200); return () => window.clearInterval(timer); }, []);
  const config = { whatsapp: { label: "WhatsApp", title: "Nairobi Deals", members: "8,400 members", tone: "whatsapp", icon: MessageCircle, accent: "Community space" }, telegram: { label: "Telegram", title: "Nairobi Deals", members: "8,400 members", tone: "telegram", icon: Send, accent: "Community channel" }, facebook: { label: "Facebook", title: "Nairobi Deals", members: "8,400 members", tone: "facebook", icon: Globe2, accent: "Community group" } }[platform];
  const Icon = config.icon;
  return <div className={`public-community-preview public-community-preview-${config.tone}`}><div className="public-community-tabs" role="tablist" aria-label="Community platforms">{platformOrder.map(item => <button type="button" role="tab" aria-selected={platform === item} className={platform === item ? "public-community-tab-active" : ""} onClick={() => setPlatform(item)} key={item}>{item === "whatsapp" ? <MessageCircle size={14} /> : item === "telegram" ? <Send size={14} /> : <Globe2 size={14} />}<span>{item[0].toUpperCase() + item.slice(1)}</span></button>)}</div><div className="public-community-stage"><div className="public-community-halo" /><div className="public-community-connection"><span /><i /><i /><i /></div><img className="public-community-person" src="/landing-person-modern.svg" alt="" aria-hidden="true" /><div className="public-community-platform-status"><span /><strong>{config.label} {config.accent === "Community space" ? "community" : config.accent === "Community channel" ? "channel" : "group"}</strong><small>Live preview</small></div><div className="public-community-phone"><div className="public-community-phone-top"><span className="public-community-camera" /><span className="public-community-speaker" /></div><div className="public-community-appbar"><span className="public-community-avatar"><Icon size={17} /></span><span><strong>{config.title}</strong><small>{config.members}</small></span><span className="public-community-menu"><i /><i /><i /></span></div><div className="public-community-canvas"><span className="public-community-label">{config.accent}</span><span className="public-community-bubble public-community-bubble-a" /><span className="public-community-bubble public-community-bubble-b" /><span className="public-community-bubble public-community-bubble-c" /><span className="public-community-bubble public-community-bubble-d" /><span className="public-community-typing"><i /><i /><i /></span><div className="public-community-live"><span /><strong>Community active</strong><small>Audience ready for relevant campaigns</small></div></div><div className="public-community-input"><span /><span /><b><ArrowRight size={13} /></b></div></div></div></div>;
}

function Workflow({ title, accent, steps }: { title: string; accent: string; steps: string[] }) { return <div className={`public-workflow public-workflow-${accent}`}><div className="public-workflow-heading"><span className="public-workflow-number">0{accent === "coral" ? 1 : 2}</span><h3>{title}</h3></div>{steps.map((step, index) => <div className="public-step" key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong>{index < steps.length - 1 && <i />}</div>)}</div>; }
function Measure({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <article className="public-measure-card"><span>{icon}</span><h3>{title}</h3><p>{text}</p></article>; }
function QuickStat({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) { return <div className="public-quick-stat"><span>{icon}</span><strong>{value}</strong><small>{label}</small></div>; }
function Principle({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <article className="public-principle-card"><span>{icon}</span><h3>{title}</h3><p>{text}</p></article>; }

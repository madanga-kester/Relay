import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  HelpCircle,
  Info,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { Link } from "wouter";
import { useRelaySession } from "@/contexts/RelaySessionContext";
import { useTheme } from "@/contexts/ThemeContext";

type Plan = {
  id: string;
  name: string;
  priceLabel: string;
  description: string;
  features: string[];
  bestFor: string;
  usage: string;
  highlighted?: boolean;
};

type ComparisonRow = {
  label: string;
  basic: string | boolean;
  pro: string | boolean;
  business: string | boolean;
};

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    priceLabel: "Pricing coming soon",
    description: "For getting started on the platform.",
    bestFor: "Independent advertisers and small communities",
    usage: "A simple starting point for your first campaigns.",
    features: ["Core campaign tools", "Standard reporting", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "Pricing coming soon",
    description: "For owners who want more reach and insight.",
    bestFor: "Growing advertisers and active community owners",
    usage: "More insight and support as your marketplace activity grows.",
    features: [
      "Everything in Basic",
      "Advanced performance reporting",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    priceLabel: "Pricing coming soon",
    description: "For teams running many campaigns or communities.",
    bestFor: "Teams and high-volume marketplace operators",
    usage: "Built for multiple campaigns, communities, and stakeholders.",
    features: [
      "Everything in Pro",
      "Higher usage limits",
      "Dedicated account support",
    ],
  },
];

const comparisonRows: ComparisonRow[] = [
  { label: "Core campaign tools", basic: true, pro: true, business: true },
  { label: "Standard reporting", basic: true, pro: true, business: true },
  { label: "Advanced performance reporting", basic: false, pro: true, business: true },
  { label: "Priority support", basic: false, pro: true, business: true },
  { label: "Higher usage limits", basic: false, pro: false, business: true },
  { label: "Dedicated account support", basic: false, pro: false, business: true },
];

const faqs = [
  {
    question: "Will I be charged when I select a plan?",
    answer:
      "No. Pricing and payment processing are not connected yet. Selecting a plan only records your preference in this page until billing is enabled.",
  },
  {
    question: "Can I change my plan later?",
    answer:
      "Yes. You can return to this page and choose another plan. The current prototype does not lock you into a subscription.",
  },
  {
    question: "Does this change campaign or placement behavior?",
    answer:
      "No. Plan selection is separate from campaigns, communities, applications, placements, CPC calculations, tracking, and marketplace earnings.",
  },
  {
    question: "When will pricing be available?",
    answer:
      "Pricing will be added when billing rules and payment processing are ready. Until then, this page is a plan-preview and selection experience only.",
  },
];

const sharedTransition = "all 180ms ease";

export default function Upgrade() {
  const session = useRelaySession();
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"plans" | "comparison" | "support" | "faq">("plans");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [notice, setNotice] = useState("");

  const role = session.user?.role;
  const homeHref =
    role === "Advertiser"
      ? "/campaign-owner"
      : role === "CommunityOwner"
        ? "/community-owner"
        : "/";

  const palette = useMemo(
    () => ({
      page: dark ? "#0e1724" : "#f7f5f0",
      pageSoft: dark ? "#1b2a3d" : "#fcfbf8",
      card: dark ? "#152235" : "#ffffff",
      cardMuted: dark ? "#1b2a3d" : "#fcfbf8",
      border: dark ? "rgba(255,255,255,.1)" : "#e8e8e3",
      borderStrong: dark ? "rgba(255,255,255,.16)" : "#dcded9",
      text: dark ? "#f4f7fb" : "#132238",
      muted: dark ? "#a5b2c0" : "#718092",
      accent: "#f2552c",
      accentDark: dark ? "#ff7655" : "#d94322",
      accentSoft: dark ? "rgba(242,85,44,.14)" : "#fff0ea",
      accentText: "#ffffff",
      positive: dark ? "#80d6bb" : "#287c67",
      shadow: dark ? "0 18px 44px rgba(0,0,0,.22)" : "0 18px 44px rgba(35,30,25,.07)",
    }),
    [dark],
  );

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
  const selectedIndex = selectedPlan ? plans.findIndex((plan) => plan.id === selectedPlan.id) + 1 : 0;

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 4200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const selectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setNotice("Plan preference saved for this session. No payment has been made.");
  };

  const clearSelection = () => {
    setSelectedPlanId(null);
    setReviewOpen(false);
    setNotice("Plan selection cleared.");
  };

  return (
    <div className="upgrade-page" style={styles.page(palette)}>
      <style>{responsiveCss}</style>
      <div className="upgrade-shell" style={styles.shell}>
        <nav style={styles.topNav(palette)} aria-label="Billing navigation">
          <Link href={homeHref} style={styles.backLink(palette)}>
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to dashboard</span>
          </Link>
          <div style={styles.secureLabel(palette)}>
            <ShieldCheck size={15} aria-hidden="true" />
            <span>Secure account settings</span>
          </div>
        </nav>

        <div className="upgrade-main-layout" style={styles.mainLayout}>
          <aside style={styles.sidebar(palette)} aria-label="Billing sidebar">
            <div style={styles.sidebarBrand(palette)}>
              <div style={styles.sidebarBrandMark(palette)}><CreditCard size={17} /></div>
              <div>
                <strong style={{ color: palette.text, fontSize: 14 }}>Account billing</strong>
                <span style={{ display: "block", color: palette.muted, fontSize: 11, marginTop: 3 }}>Plan management</span>
              </div>
            </div>

            <div style={styles.sidebarGroup}>
              <span style={styles.sidebarLabel(palette)}>This page</span>
              <button type="button" onClick={() => setActiveSection("plans")} style={styles.sidebarLink(palette, activeSection === "plans")}><Sparkles size={15} /> Choose a plan</button>
              <button type="button" onClick={() => setActiveSection("comparison")} style={styles.sidebarLink(palette, activeSection === "comparison")}><BarChart3 size={15} /> Compare features</button>
              <button type="button" onClick={() => setActiveSection("support")} style={styles.sidebarLink(palette, activeSection === "support")}><HelpCircle size={15} /> Support & guidance</button>
              <button type="button" onClick={() => setActiveSection("faq")} style={styles.sidebarLink(palette, activeSection === "faq")}><Info size={15} /> FAQs</button>
            </div>

            <div style={styles.sidebarStatus(palette)}>
              <span style={styles.sidebarLabel(palette)}>Current account</span>
              <div style={styles.statusLine(palette)}><span style={styles.statusDot(palette)} /> Billing preview mode</div>
              <p style={{ color: palette.muted, fontSize: 12, lineHeight: 1.55, margin: "10px 0 0" }}>
                No subscription is active and no payment method is required for this preview.
              </p>
            </div>

            <div style={styles.sidebarSupport(palette)}>
              <div style={styles.sidebarSupportIcon(palette)}><Mail size={15} /></div>
              <strong style={{ color: palette.text, fontSize: 13 }}>Need a hand?</strong>
              <p style={{ color: palette.muted, fontSize: 12, lineHeight: 1.5, margin: "7px 0 12px" }}>
                Talk to the team about choosing a plan for your campaigns or communities.
              </p>
              <a href="mailto:support@example.com" style={styles.sidebarSupportLink(palette)}>Email support <ArrowRight size={13} /></a>
            </div>
          </aside>

          <main style={styles.mainContent} aria-live="polite">

        {activeSection === "plans" && <>
        <header style={styles.hero}>
          <div style={styles.heroCopy}>
            <span style={styles.eyebrow(palette)}>
              <CreditCard size={14} aria-hidden="true" />
              Billing & plans
            </span>
            <h1 style={styles.title(palette)}>Choose the right pace for your marketplace growth.</h1>
            <p style={styles.subtitle(palette)}>
              Compare the available plan directions for your account. Your current campaigns,
              communities, placements, tracking, and financial history remain unchanged.
            </p>
            <div style={styles.heroMeta}>
              <span style={styles.metaItem(palette)}>
                <LockKeyhole size={15} aria-hidden="true" /> No payment collected
              </span>
              <span style={styles.metaItem(palette)}>
                <BadgeCheck size={15} aria-hidden="true" /> Selection can be changed
              </span>
            </div>
          </div>
          <div style={styles.heroPanel(palette)}>
            <div style={styles.heroPanelIcon(palette)}>
              <Sparkles size={20} aria-hidden="true" />
            </div>
            <strong style={{ color: palette.text, fontSize: 16 }}>Plan preview</strong>
            <p style={{ color: palette.muted, margin: "8px 0 0", lineHeight: 1.55, fontSize: 13 }}>
              Select a plan, review what it includes, and keep working while billing is being prepared.
            </p>
          </div>
        </header>

        <section style={styles.progressCard(palette)} aria-label="Upgrade steps">
          <div style={styles.progressHeader}>
            <span style={{ color: palette.text, fontSize: 13, fontWeight: 800 }}>Your plan journey</span>
            <span style={{ color: palette.muted, fontSize: 12 }}>
              {selectedPlan ? `Step ${selectedIndex + 1} of 3` : "Step 1 of 3"}
            </span>
          </div>
          <div style={styles.progressTrack(palette)}>
            <span style={styles.progressFill(palette, selectedPlan ? 66 : 33)} />
          </div>
          <div className="upgrade-step-grid" style={styles.stepGrid}>
            <StepItem palette={palette} number="01" label="Compare plans" active={!selectedPlan} complete={Boolean(selectedPlan)} />
            <StepItem palette={palette} number="02" label="Review choice" active={Boolean(selectedPlan) && !reviewOpen} complete={reviewOpen} />
            <StepItem palette={palette} number="03" label="Confirm preference" active={reviewOpen} complete={false} />
          </div>
        </section>

        <section id="plans" style={styles.sectionBlock} aria-labelledby="plans-heading">
          <div style={styles.sectionHeading}>
            <div>
              <span style={styles.sectionKicker(palette)}>Built around your workflow</span>
              <h2 id="plans-heading" style={styles.sectionTitle(palette)}>Select a plan direction</h2>
            </div>
            <button type="button" onClick={() => setActiveSection("comparison")} style={styles.textButton(palette)}>
              Compare features <ArrowRight size={16} />
            </button>
          </div>

          <div className="upgrade-plan-grid" style={styles.planGrid}>
            {plans.map((plan) => {
              const selected = plan.id === selectedPlanId;
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  selected={selected}
                  palette={palette}
                  onSelect={() => selectPlan(plan.id)}
                />
              );
            })}
          </div>
          {selectedPlan && (
            <div style={styles.selectionBar(palette)} role="status">
              <div>
                <strong style={{ color: palette.text, fontSize: 14 }}>{selectedPlan.name} is selected</strong>
                <span style={{ display: "block", color: palette.muted, fontSize: 12, marginTop: 4 }}>Review the preference before confirming. No payment will be made.</span>
              </div>
              <button type="button" onClick={() => setReviewOpen(true)} style={styles.primaryButton(palette)}>Review selection <ArrowRight size={15} /></button>
            </div>
          )}
        </section>
        </>}

        {activeSection === "comparison" && <section id="comparison" style={styles.panelSection(palette)}>
          <div style={styles.panelIntro}>
            <span style={styles.sectionKicker(palette)}>Side-by-side view</span>
            <h1 style={styles.panelTitle(palette)}>Compare features at a glance.</h1>
            <p style={styles.panelSubtitle(palette)}>Review the capability direction for each plan without leaving your billing workspace.</p>
          </div>
          <ComparisonTable palette={palette} />
        </section>}

        {activeSection === "support" && <section id="support" className="upgrade-support-grid" style={styles.panelSection(palette)}>
          <div style={styles.panelIntro}>
            <span style={styles.sectionKicker(palette)}>Guidance center</span>
            <h1 style={styles.panelTitle(palette)}>Support for your next step.</h1>
            <p style={styles.panelSubtitle(palette)}>Understand how plan capabilities map to campaign, community, reporting, and support needs.</p>
          </div>
          <div style={styles.workspaceGrid}>
          <div style={styles.infoCard(palette)}>
            <div style={styles.infoIcon(palette)}><BarChart3 size={19} /></div>
            <div>
              <h2 style={styles.cardTitle(palette)}>What changes when plans go live?</h2>
              <p style={styles.cardText(palette)}>
                Plan benefits will be applied to account capabilities, reporting depth, support, and usage limits.
                Existing marketplace records will not be recreated or recalculated.
              </p>
              <div style={styles.bulletList}>
                <Bullet palette={palette} icon={<UsersRound size={15} />} text="Keep your existing advertiser or community-owner workspace." />
                <Bullet palette={palette} icon={<BarChart3 size={15} />} text="Unlock the plan features that match your operating scale." />
                <Bullet palette={palette} icon={<ShieldCheck size={15} />} text="Keep marketplace financial rules and historical records intact." />
              </div>
            </div>
          </div>

          <div style={styles.infoCard(palette)}>
            <div style={styles.infoIcon(palette)}><HelpCircle size={19} /></div>
            <div>
              <h2 style={styles.cardTitle(palette)}>Need help choosing?</h2>
              <p style={styles.cardText(palette)}>
                Start with Basic if you are testing the marketplace. Choose Pro when you need deeper insight.
                Business is intended for teams managing multiple active workflows.
              </p>
              <a href="mailto:support@example.com" style={styles.supportLink(palette)}>
                <Mail size={15} /> Contact support <ArrowRight size={14} />
              </a>
            </div>
          </div>
          </div>
        </section>}

        {activeSection === "faq" && <section style={styles.faqSection(palette)} aria-labelledby="faq-heading">
          <div style={styles.sectionHeading}>
            <div>
              <span style={styles.sectionKicker(palette)}>Before you continue</span>
              <h2 id="faq-heading" style={styles.sectionTitle(palette)}>Frequently asked questions</h2>
            </div>
            <Info size={20} color={palette.accent} aria-hidden="true" />
          </div>
          <div style={styles.faqList(palette)}>
            {faqs.map((faq, index) => {
              const open = openFaq === index;
              return (
                <div key={faq.question} style={styles.faqItem(palette)}>
                  <button type="button" onClick={() => setOpenFaq(open ? null : index)} style={styles.faqButton(palette)} aria-expanded={open}>
                    <span>{faq.question}</span>
                    {open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                  </button>
                  {open && <p style={styles.faqAnswer(palette)}>{faq.answer}</p>}
                </div>
              );
            })}
          </div>
        </section>}

        <footer style={styles.footer(palette)}>
          <div>
            <strong style={{ color: palette.text, fontSize: 14 }}>Ready when you are</strong>
            <p style={{ color: palette.muted, margin: "5px 0 0", fontSize: 13 }}>
              You can continue using the marketplace while subscription billing is being prepared.
            </p>
          </div>
          <Link href={homeHref} style={styles.footerLink(palette)}>Return to dashboard <ArrowRight size={15} /></Link>
        </footer>
          </main>
        </div>
      </div>

      {notice && (
        <div role="status" aria-live="polite" style={styles.toast(palette)}>
          <BadgeCheck size={17} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} style={styles.toastClose(palette)} aria-label="Dismiss message"><X size={15} /></button>
        </div>
      )}

      {selectedPlan && reviewOpen && (
        <div style={styles.modalBackdrop} role="presentation" onMouseDown={() => setReviewOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="review-title" style={styles.modal(palette)} onMouseDown={(event) => event.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.sectionKicker(palette)}>Step 3 · Confirm preference</span>
                <h2 id="review-title" style={styles.modalTitle(palette)}>Review your selection</h2>
              </div>
              <button type="button" onClick={() => setReviewOpen(false)} style={styles.iconButton(palette)} aria-label="Close review"><X size={18} /></button>
            </div>
            <div style={styles.reviewPlan(palette)}>
              <div style={styles.reviewIcon(palette)}><CreditCard size={20} /></div>
              <div>
                <strong style={{ color: palette.text, fontSize: 18 }}>{selectedPlan.name}</strong>
                <p style={{ color: palette.muted, margin: "4px 0 0", fontSize: 13 }}>{selectedPlan.description}</p>
              </div>
            </div>
            <div style={styles.reviewRows(palette)}>
              <ReviewRow palette={palette} label="Plan status" value="Preference only" />
              <ReviewRow palette={palette} label="Payment" value="Not connected" />
              <ReviewRow palette={palette} label="Existing marketplace data" value="Unchanged" />
              <ReviewRow palette={palette} label="Next step" value="Billing will be enabled later" />
            </div>
            <div style={styles.noticeBox(palette)}>
              <Info size={16} />
              <span>No charge, subscription, or payment method will be created from this page.</span>
            </div>
            <div style={styles.modalActions}>
              <button type="button" onClick={clearSelection} style={styles.secondaryButton(palette)}>Clear selection</button>
              <button type="button" onClick={() => { setReviewOpen(false); setNotice(`${selectedPlan.name} is saved as your preferred plan direction.`); }} style={styles.primaryButton(palette)}>Confirm preference <Check size={16} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepItem({ palette, number, label, active, complete }: { palette: Record<string, string>; number: string; label: string; active: boolean; complete: boolean }) {
  return (
    <div style={styles.stepItem}>
      <span style={styles.stepNumber(palette, active, complete)}>{complete ? <Check size={13} /> : number}</span>
      <span style={{ color: active || complete ? palette.text : palette.muted, fontSize: 12, fontWeight: active || complete ? 800 : 600 }}>{label}</span>
    </div>
  );
}

function PlanCard({ plan, selected, palette, onSelect }: { plan: Plan; selected: boolean; palette: Record<string, string>; onSelect: () => void }) {
  return (
    <article style={styles.planCard(palette, plan.highlighted, selected)} aria-label={`${plan.name} plan`}>
      {plan.highlighted && <span style={styles.recommended(palette)}>Recommended starting point</span>}
      <div style={styles.planTopline}>
        <div>
          <h3 style={styles.planName(palette)}>{plan.name}</h3>
          <p style={styles.planDescription(palette)}>{plan.description}</p>
        </div>
        <div style={styles.planMark(palette, plan.highlighted)}><Sparkles size={17} /></div>
      </div>
      <div style={styles.priceLabel(palette)}>{plan.priceLabel}</div>
      <div style={styles.bestFor(palette)}><strong>Best for:</strong> {plan.bestFor}</div>
      <ul style={styles.featuresList}>
        {plan.features.map((feature) => <li key={feature} style={styles.featureItem(palette)}><Check size={16} color={palette.accent} /><span>{feature}</span></li>)}
      </ul>
      <p style={styles.usageText(palette)}>{plan.usage}</p>
      <button type="button" onClick={onSelect} aria-pressed={selected} style={styles.planButton(palette, selected)}>
        {selected ? <><Check size={16} /> Selected</> : <>Choose {plan.name} <ArrowRight size={15} /></>}
      </button>
    </article>
  );
}

function ComparisonTable({ palette }: { palette: Record<string, string> }) {
  return (
    <section style={styles.comparisonCard(palette)} aria-label="Plan comparison">
      <div style={styles.comparisonHeader}><div><span style={styles.sectionKicker(palette)}>Side-by-side view</span><h2 style={styles.cardTitle(palette)}>Compare plan capabilities</h2></div><span style={{ color: palette.muted, fontSize: 12 }}>Availability is subject to final billing configuration.</span></div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead><tr><th style={styles.tableHead(palette)}>Capability</th><th style={styles.tableHead(palette)}>Basic</th><th style={styles.tableHead(palette)}>Pro</th><th style={styles.tableHead(palette)}>Business</th></tr></thead>
          <tbody>{comparisonRows.map((row) => <tr key={row.label}><td style={styles.tableCell(palette, true)}>{row.label}</td><ValueCell palette={palette} value={row.basic} /><ValueCell palette={palette} value={row.pro} /><ValueCell palette={palette} value={row.business} /></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

function ValueCell({ palette, value }: { palette: Record<string, string>; value: string | boolean }) {
  return <td style={styles.tableCell(palette, false)}>{typeof value === "boolean" ? (value ? <Check size={17} color={palette.positive} aria-label="Included" /> : <span style={{ color: palette.muted }}>—</span>) : value}</td>;
}

function Bullet({ palette, icon, text }: { palette: Record<string, string>; icon: React.ReactNode; text: string }) {
  return <div style={styles.bulletItem(palette)}><span style={styles.bulletIcon(palette)}>{icon}</span><span>{text}</span></div>;
}

function ReviewRow({ palette, label, value }: { palette: Record<string, string>; label: string; value: string }) {
  return <div style={styles.reviewRow(palette)}><span>{label}</span><strong>{value}</strong></div>;
}

const styles = {
  page: (p: Record<string, string>): React.CSSProperties => ({ height: "100vh", width: "100vw", overflow: "hidden", background: p.page, color: p.text, padding: 0, transition: sharedTransition }),
  shell: { width: "100%", height: "100%", margin: 0 } as React.CSSProperties,
  topNav: (p: Record<string, string>): React.CSSProperties => ({ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, height: 56, padding: "0 28px", borderBottom: `1px solid ${p.border}`, background: p.card }),
  backLink: (p: Record<string, string>): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 8, color: p.muted, textDecoration: "none", fontSize: 14, fontWeight: 700 }),
  secureLabel: (p: Record<string, string>): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 7, color: p.muted, fontSize: 12, fontWeight: 700 }),
  mainLayout: { display: "grid", gridTemplateColumns: "240px minmax(0, 1fr)", gap: 0, height: "calc(100% - 56px)", alignItems: "stretch" } as React.CSSProperties,
  mainContent: { minWidth: 0, minHeight: 0, overflowY: "auto", padding: "0 clamp(24px, 4vw, 62px) 22px" } as React.CSSProperties,
  sidebar: (p: Record<string, string>): React.CSSProperties => ({ position: "sticky", top: 0, display: "flex", flexDirection: "column", gap: 26, height: "100%", overflowY: "auto", padding: "29px 18px 18px", border: 0, borderRight: `1px solid ${p.border}`, borderRadius: 0, background: p.card, boxShadow: "none" }),
  sidebarBrand: (p: Record<string, string>): React.CSSProperties => ({ display: "flex", alignItems: "center", gap: 10, paddingBottom: 16, borderBottom: `1px solid ${p.border}` }),
  sidebarBrandMark: (p: Record<string, string>): React.CSSProperties => ({ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 10, background: p.accent, color: p.accentText }),
  sidebarGroup: { display: "flex", flexDirection: "column", gap: 5 } as React.CSSProperties,
  sidebarLabel: (p: Record<string, string>): React.CSSProperties => ({ color: p.muted, fontSize: 10, fontWeight: 900, letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 5 }),
  sidebarLink: (p: Record<string, string>, active: boolean): React.CSSProperties => ({ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "10px 11px", border: 0, borderRadius: 9, color: active ? p.text : p.muted, background: active ? p.accentSoft : "transparent", textDecoration: "none", fontSize: 12, fontWeight: active ? 900 : 700, textAlign: "left", cursor: "pointer", transition: sharedTransition }),
  sidebarStatus: (p: Record<string, string>): React.CSSProperties => ({ padding: 13, borderRadius: 12, background: p.pageSoft }),
  statusLine: (p: Record<string, string>): React.CSSProperties => ({ display: "flex", alignItems: "center", gap: 7, color: p.text, fontSize: 12, fontWeight: 800 }),
  statusDot: (p: Record<string, string>): React.CSSProperties => ({ width: 7, height: 7, borderRadius: "50%", background: p.positive, boxShadow: `0 0 0 3px ${p.card}` }),
  sidebarSupport: (p: Record<string, string>): React.CSSProperties => ({ padding: 13, border: `1px solid ${p.border}`, borderRadius: 12, background: p.cardMuted }),
  sidebarSupportIcon: (p: Record<string, string>): React.CSSProperties => ({ display: "grid", placeItems: "center", width: 29, height: 29, borderRadius: 9, color: p.accent, background: p.accentSoft, marginBottom: 10 }),
  sidebarSupportLink: (p: Record<string, string>): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 6, color: p.accent, textDecoration: "none", fontSize: 12, fontWeight: 900 }),
  panelSection: (p: Record<string, string>): React.CSSProperties => ({ minHeight: "100%", padding: "44px 14px 20px 0" }),
  panelIntro: { maxWidth: 720, marginBottom: 28 } as React.CSSProperties,
  panelTitle: (p: Record<string, string>): React.CSSProperties => ({ color: p.text, fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.05, letterSpacing: "-.045em", margin: 0 }),
  panelSubtitle: (p: Record<string, string>): React.CSSProperties => ({ color: p.muted, fontSize: 14, lineHeight: 1.65, margin: "12px 0 0", maxWidth: 580 }),
  hero: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) 290px", gap: 32, alignItems: "end", padding: "64px 0 40px" } as React.CSSProperties,
  heroCopy: { maxWidth: 720 } as React.CSSProperties,
  eyebrow: (p: Record<string, string>): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 8, color: p.accent, fontSize: 12, fontWeight: 900, letterSpacing: ".09em", textTransform: "uppercase" }),
  title: (p: Record<string, string>): React.CSSProperties => ({ color: p.text, fontSize: "clamp(34px, 5vw, 58px)", lineHeight: 1.02, letterSpacing: "-.045em", margin: "14px 0 16px", maxWidth: 760 }),
  subtitle: (p: Record<string, string>): React.CSSProperties => ({ color: p.muted, fontSize: 16, lineHeight: 1.7, margin: 0, maxWidth: 650 }),
  heroMeta: { display: "flex", flexWrap: "wrap", gap: 16, marginTop: 24 } as React.CSSProperties,
  metaItem: (p: Record<string, string>): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 7, color: p.muted, fontSize: 12, fontWeight: 700 }),
  heroPanel: (p: Record<string, string>): React.CSSProperties => ({ background: p.card, border: `1px solid ${p.border}`, borderRadius: 20, boxShadow: p.shadow, padding: 22 }),
  heroPanelIcon: (p: Record<string, string>): React.CSSProperties => ({ display: "grid", placeItems: "center", width: 42, height: 42, borderRadius: 13, color: p.accent, background: p.accentSoft, marginBottom: 16 }),
  progressCard: (p: Record<string, string>): React.CSSProperties => ({ background: p.card, border: `1px solid ${p.border}`, borderRadius: 18, padding: "18px 20px", boxShadow: p.shadow }),
  progressHeader: { display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 12 } as React.CSSProperties,
  progressTrack: (p: Record<string, string>): React.CSSProperties => ({ height: 5, overflow: "hidden", background: p.pageSoft, borderRadius: 999 }),
  progressFill: (p: Record<string, string>, width: number): React.CSSProperties => ({ display: "block", height: "100%", width: `${width}%`, background: p.accent, borderRadius: 999, transition: "width 220ms ease" }),
  stepGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 } as React.CSSProperties,
  stepItem: { display: "flex", alignItems: "center", gap: 9 } as React.CSSProperties,
  stepNumber: (p: Record<string, string>, active: boolean, complete: boolean): React.CSSProperties => ({ display: "grid", placeItems: "center", width: 25, height: 25, borderRadius: "50%", background: active || complete ? p.accent : p.pageSoft, color: active || complete ? p.accentText : p.muted, fontSize: 10, fontWeight: 900 }),
  sectionBlock: { marginTop: 64 } as React.CSSProperties,
  sectionHeading: { display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, marginBottom: 22 } as React.CSSProperties,
  sectionKicker: (p: Record<string, string>): React.CSSProperties => ({ display: "block", color: p.accent, fontSize: 11, fontWeight: 900, letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 8 }),
  sectionTitle: (p: Record<string, string>): React.CSSProperties => ({ color: p.text, fontSize: 28, letterSpacing: "-.03em", margin: 0 }),
  textButton: (p: Record<string, string>): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 7, border: 0, background: "transparent", color: p.accent, fontWeight: 800, fontSize: 13, cursor: "pointer", padding: 8 }),
  planGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 18 } as React.CSSProperties,
  planCard: (p: Record<string, string>, highlighted?: boolean, selected?: boolean): React.CSSProperties => ({ position: "relative", display: "flex", flexDirection: "column", minHeight: 390, padding: 23, borderRadius: 19, background: p.card, border: `${highlighted || selected ? 2 : 1}px solid ${highlighted || selected ? p.accent : p.border}`, boxShadow: highlighted || selected ? p.shadow : "none", transition: sharedTransition }),
  recommended: (p: Record<string, string>): React.CSSProperties => ({ position: "absolute", top: -12, left: 18, padding: "5px 10px", borderRadius: 999, background: p.accent, color: p.accentText, fontSize: 10, fontWeight: 900, letterSpacing: ".05em", textTransform: "uppercase" }),
  planTopline: { display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 } as React.CSSProperties,
  planName: (p: Record<string, string>): React.CSSProperties => ({ color: p.text, fontSize: 22, margin: 0 }),
  planDescription: (p: Record<string, string>): React.CSSProperties => ({ color: p.muted, fontSize: 13, lineHeight: 1.5, minHeight: 40, margin: "7px 0 0" }),
  planMark: (p: Record<string, string>, highlighted?: boolean): React.CSSProperties => ({ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 11, color: highlighted ? p.accentText : p.accent, background: highlighted ? p.accent : p.accentSoft }),
  priceLabel: (p: Record<string, string>): React.CSSProperties => ({ color: p.text, fontSize: 15, fontWeight: 900, margin: "22px 0 13px", paddingBottom: 16, borderBottom: `1px solid ${p.border}` }),
  bestFor: (p: Record<string, string>): React.CSSProperties => ({ color: p.muted, fontSize: 12, lineHeight: 1.5, minHeight: 38 }),
  featuresList: { listStyle: "none", padding: 0, margin: "20px 0 12px", display: "flex", flexDirection: "column", gap: 11, flexGrow: 1 } as React.CSSProperties,
  featureItem: (p: Record<string, string>): React.CSSProperties => ({ display: "flex", alignItems: "center", gap: 9, color: p.text, fontSize: 13 }),
  usageText: (p: Record<string, string>): React.CSSProperties => ({ color: p.muted, fontSize: 12, lineHeight: 1.5, minHeight: 36, margin: "0 0 17px" }),
  planButton: (p: Record<string, string>, selected: boolean): React.CSSProperties => ({ display: "inline-flex", justifyContent: "center", alignItems: "center", gap: 8, border: `1px solid ${p.accent}`, background: selected ? p.accent : "transparent", color: selected ? p.accentText : p.accent, borderRadius: 10, padding: "12px 14px", fontSize: 13, fontWeight: 900, cursor: "pointer", transition: sharedTransition }),
  comparisonCard: (p: Record<string, string>): React.CSSProperties => ({ marginTop: 22, padding: 22, border: `1px solid ${p.border}`, borderRadius: 18, background: p.card, boxShadow: p.shadow }),
  comparisonHeader: { display: "flex", justifyContent: "space-between", alignItems: "end", gap: 18, marginBottom: 18 } as React.CSSProperties,
  tableWrap: { overflowX: "auto" } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse", minWidth: 620 } as React.CSSProperties,
  tableHead: (p: Record<string, string>): React.CSSProperties => ({ color: p.muted, textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", padding: "12px 10px", borderBottom: `1px solid ${p.border}` }),
  tableCell: (p: Record<string, string>, first: boolean): React.CSSProperties => ({ color: first ? p.text : p.muted, fontWeight: first ? 800 : 600, fontSize: 13, padding: "15px 10px", borderBottom: `1px solid ${p.border}`, textAlign: first ? "left" : "center" }),
  workspaceGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18, marginTop: 22 } as React.CSSProperties,
  infoCard: (p: Record<string, string>): React.CSSProperties => ({ display: "flex", gap: 15, padding: 22, borderRadius: 18, border: `1px solid ${p.border}`, background: p.cardMuted }),
  infoIcon: (p: Record<string, string>): React.CSSProperties => ({ flex: "0 0 auto", display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 12, color: p.accent, background: p.accentSoft }),
  cardTitle: (p: Record<string, string>): React.CSSProperties => ({ color: p.text, fontSize: 17, margin: 0 }),
  cardText: (p: Record<string, string>): React.CSSProperties => ({ color: p.muted, fontSize: 13, lineHeight: 1.65, margin: "9px 0 0" }),
  bulletList: { display: "flex", flexDirection: "column", gap: 10, marginTop: 16 } as React.CSSProperties,
  bulletItem: (p: Record<string, string>): React.CSSProperties => ({ display: "flex", alignItems: "center", gap: 9, color: p.text, fontSize: 12, lineHeight: 1.45 }),
  bulletIcon: (p: Record<string, string>): React.CSSProperties => ({ display: "grid", placeItems: "center", color: p.accent, flex: "0 0 auto" }),
  supportLink: (p: Record<string, string>): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 16, color: p.accent, fontSize: 13, fontWeight: 900, textDecoration: "none" }),
  faqSection: (p: Record<string, string>): React.CSSProperties => ({ marginTop: 64, padding: "28px 0 0", borderTop: `1px solid ${p.border}` }),
  faqList: (p: Record<string, string>): React.CSSProperties => ({ borderTop: `1px solid ${p.border}` }),
  faqItem: (p: Record<string, string>): React.CSSProperties => ({ borderBottom: `1px solid ${p.border}` }),
  faqButton: (p: Record<string, string>): React.CSSProperties => ({ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, border: 0, background: "transparent", color: p.text, textAlign: "left", padding: "18px 0", fontSize: 14, fontWeight: 800, cursor: "pointer" }),
  faqAnswer: (p: Record<string, string>): React.CSSProperties => ({ maxWidth: 800, color: p.muted, fontSize: 13, lineHeight: 1.7, margin: "-4px 0 18px" }),
  footer: (p: Record<string, string>): React.CSSProperties => ({ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, marginTop: 64, paddingTop: 24, borderTop: `1px solid ${p.border}` }),
  footerLink: (p: Record<string, string>): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 8, color: p.accent, textDecoration: "none", fontSize: 13, fontWeight: 900 }),
  toast: (p: Record<string, string>): React.CSSProperties => ({ position: "fixed", zIndex: 20, right: 20, bottom: 20, display: "flex", alignItems: "center", gap: 10, maxWidth: 420, padding: "13px 14px", border: `1px solid ${p.borderStrong}`, borderRadius: 13, background: p.card, color: p.text, boxShadow: p.shadow, fontSize: 13, fontWeight: 700 }),
  toastClose: (p: Record<string, string>): React.CSSProperties => ({ display: "grid", placeItems: "center", border: 0, background: "transparent", color: p.muted, cursor: "pointer", padding: 2 }),
  modalBackdrop: { position: "fixed", zIndex: 30, inset: 0, display: "grid", placeItems: "center", padding: 20, background: "rgba(0,0,0,.58)" } as React.CSSProperties,
  modal: (p: Record<string, string>): React.CSSProperties => ({ width: "min(100%, 520px)", maxHeight: "calc(100vh - 40px)", overflowY: "auto", border: `1px solid ${p.border}`, borderRadius: 20, background: p.card, boxShadow: "0 26px 90px rgba(0,0,0,.3)", padding: 24 }),
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 } as React.CSSProperties,
  modalTitle: (p: Record<string, string>): React.CSSProperties => ({ color: p.text, fontSize: 26, letterSpacing: "-.03em", margin: 0 }),
  iconButton: (p: Record<string, string>): React.CSSProperties => ({ display: "grid", placeItems: "center", width: 34, height: 34, border: `1px solid ${p.border}`, borderRadius: 10, background: "transparent", color: p.muted, cursor: "pointer" }),
  reviewPlan: (p: Record<string, string>): React.CSSProperties => ({ display: "flex", alignItems: "center", gap: 13, marginTop: 24, padding: 15, borderRadius: 13, background: p.accentSoft }),
  reviewIcon: (p: Record<string, string>): React.CSSProperties => ({ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 12, background: p.accent, color: p.accentText }),
  reviewRows: (p: Record<string, string>): React.CSSProperties => ({ marginTop: 18, borderTop: `1px solid ${p.border}` }),
  reviewRow: (p: Record<string, string>): React.CSSProperties => ({ display: "flex", justifyContent: "space-between", gap: 18, padding: "13px 0", borderBottom: `1px solid ${p.border}`, color: p.muted, fontSize: 13 }),
  noticeBox: (p: Record<string, string>): React.CSSProperties => ({ display: "flex", alignItems: "flex-start", gap: 9, marginTop: 18, padding: 13, borderRadius: 11, background: p.pageSoft, color: p.muted, fontSize: 12, lineHeight: 1.5 }),
  modalActions: { display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 10, marginTop: 22 } as React.CSSProperties,
  secondaryButton: (p: Record<string, string>): React.CSSProperties => ({ border: `1px solid ${p.borderStrong}`, background: "transparent", color: p.text, borderRadius: 10, padding: "11px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer" }),
  primaryButton: (p: Record<string, string>): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${p.accent}`, background: p.accent, color: p.accentText, borderRadius: 10, padding: "11px 14px", fontSize: 13, fontWeight: 900, cursor: "pointer" }),
  selectionBar: (p: Record<string, string>): React.CSSProperties => ({ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, marginTop: 18, padding: "15px 17px", border: `1px solid ${p.borderStrong}`, borderRadius: 14, background: p.accentSoft }),
};

const responsiveCss = `
  @media (max-width: 860px) {
    .upgrade-main-layout { grid-template-columns: 1fr !important; }
    .upgrade-main-layout aside { position: static !important; }
  }
  @media (max-width: 680px) {
    .upgrade-page { height: auto !important; min-height: 100vh; overflow: visible !important; }
    .upgrade-shell { max-width: 100%; }
    .upgrade-main-layout { height: auto !important; }
    .upgrade-main-layout main { overflow: visible !important; padding-right: 0 !important; }
    .upgrade-main-layout main > header { grid-template-columns: 1fr !important; padding-top: 42px !important; }
    .upgrade-step-grid, .upgrade-plan-grid, .upgrade-support-grid { grid-template-columns: 1fr !important; }
    .upgrade-main-layout main > section[aria-label="Upgrade steps"] .upgrade-step-grid { grid-template-columns: 1fr; }
    .upgrade-main-layout main > section[aria-label="Upgrade steps"] .upgrade-step-grid > div { justify-content: flex-start; }
    .upgrade-main-layout main > section[aria-labelledby="plans-heading"] > div:first-child { align-items: flex-start; flex-direction: column; }
    .upgrade-main-layout main > section[aria-labelledby="plans-heading"] .upgrade-plan-grid { grid-template-columns: 1fr !important; }
    .upgrade-main-layout main > section[aria-labelledby="plans-heading"] [role="status"] { align-items: flex-start; flex-direction: column; }
    .upgrade-main-layout main > footer { align-items: flex-start; flex-direction: column; }
  }
`;

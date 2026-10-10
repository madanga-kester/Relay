import { useEffect, useMemo, useState } from "react";
import { 
  ArrowUpRight, 
  CheckCheck, 
  MessageCircle, 
  Share2, 
  ThumbsUp, 
  Info,
  Wifi,
  Battery,
  Signal,
  Play,
  Smartphone,
  Monitor
} from "lucide-react";
import { getTrackingPath } from "@/data/marketplaceData";
import { PlatformMark } from "@/pages/OwnerPages";

export const AD_PREVIEW_KEY = "relay-ad-preview-draft";

type PreviewData = {
  name: string;
  advertiser: string;
  advertisement: string;
  destinationUrl: string;
  platforms: string[];
  mediaImage?: string;
  mediaVideoUrl?: string;
  description?: string;
  category?: string;
  location?: string;
  minAudience?: string;
  maxAudience?: string;
  duration?: string;
  maxCommunities?: string;
  cpc?: string;
  budget?: string;
  startDate?: string;
  endDate?: string;
};

const supported = ["WhatsApp", "Telegram", "Facebook", "Discord", "Newsletter"] as const;
type Supported = (typeof supported)[number];

function readPreview(): PreviewData | null {
  try {
    const saved = window.localStorage.getItem(AD_PREVIEW_KEY);
    return saved ? (JSON.parse(saved) as PreviewData) : null;
  } catch {
    return null;
  }
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export default function CampaignOwnerAdPreview() {
  function youtubeId(url: string) {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./, "");
      if (host === "youtu.be") return parsed.pathname.slice(1).split("/")[0] || "";
      if (host === "youtube.com" || host === "m.youtube.com") {
        if (parsed.pathname === "/watch") return parsed.searchParams.get("v") ?? "";
        const match = parsed.pathname.match(/^\/(shorts|embed|live)\/([^/?]+)/);
        if (match) return match[2];
      }
    } catch {
      return "";
    }
    return "";
  }

  function isDirectVideo(url: string) {
    try {
      return /\.(mp4|webm|ogg|mov)$/i.test(new URL(url).pathname);
    } catch {
      return false;
    }
  }

  const [data, setData] = useState<PreviewData | null>(readPreview);
  const [deviceView, setDeviceView] = useState<"mobile" | "desktop">("mobile");

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === AD_PREVIEW_KEY) setData(readPreview());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const available = useMemo<Supported[]>(() => {
    const chosen = supported.filter((item) => data?.platforms?.includes(item));
    return chosen.length ? chosen : [...supported];
  }, [data]);

  const [activePlatform, setActivePlatform] = useState<Supported>(available[0] || "WhatsApp");

  useEffect(() => {
    if (!available.includes(activePlatform)) setActivePlatform(available[0] || "WhatsApp");
  }, [available, activePlatform]);

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "var(--surface-soft)", color: "var(--ink)" }}>
        <div style={{ maxWidth: 400, textAlign: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 32 }}>
          <Info size={32} style={{ color: "var(--muted)", marginBottom: 12 }} />
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No draft data found</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            Go back to the Create Campaign page, complete your details, and click "View ad preview".
          </p>
        </div>
      </div>
    );
  }

  const campaignName = data.name.trim() || "Your campaign name";
  const text = data.advertisement.trim() || "Your advertisement text will appear here.";
  const host = hostOf(data.destinationUrl);
  const trackingLink = `${window.location.origin}${getTrackingPath("sample")}`;
  const video = data.mediaVideoUrl && /^https?:\/\//i.test(data.mediaVideoUrl.trim()) ? data.mediaVideoUrl.trim() : "";
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const community = "Sample Community";

  const image = (radius: number) =>
    data.mediaImage ? (
      <img src={data.mediaImage} alt="Advertisement" style={{ width: "100%", display: "block", borderRadius: radius, objectFit: "cover", maxHeight: 260 }} />
    ) : null;

  const ytId = video ? youtubeId(video) : "";
  const directVideo = video ? isDirectVideo(video) : false;

  const playBadge = (
    <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <span style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(0,0,0,0.65)", display: "grid", placeItems: "center" }}>
        <Play size={22} color="#ffffff" fill="#ffffff" />
      </span>
    </span>
  );

  const videoVisual = directVideo ? (
    <video
      src={video}
      controls
      preload="metadata"
      style={{ width: "100%", display: "block", borderRadius: 8, maxHeight: 260, background: "#000000" }}
    />
  ) : ytId ? (
    <a href={video} target="_blank" rel="noreferrer" style={{ position: "relative", display: "block" }}>
      <img
        src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
        alt="Video thumbnail"
        style={{ width: "100%", display: "block", borderRadius: 8, objectFit: "cover", maxHeight: 260 }}
      />
      {playBadge}
    </a>
  ) : (
    <a
      href={video}
      target="_blank"
      rel="noreferrer"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 140, borderRadius: 8, background: "#1f2937", color: "#ffffff", textDecoration: "none", fontSize: 14, fontWeight: 600 }}
    >
      <Play size={22} color="#ffffff" fill="#ffffff" /> {hostOf(video) || "Watch video"}
    </a>
  );

  const videoLine = (color: string) =>
    video ? (
      <div style={{ marginTop: 8 }}>
        {videoVisual}
        <div style={{ fontSize: 13, color, wordBreak: "break-all", marginTop: 6 }}>Video: {video}</div>
      </div>
    ) : null;

  /* Mock renderers */
  const whatsapp = (
    <div style={{ background: "#efeae2", padding: "16px 12px", minHeight: 480 }}>
      <div style={{ background: "#d9fdd3", color: "#111b21", borderRadius: 12, padding: 10, maxWidth: deviceView === "desktop" ? "750px" : "92%", marginLeft: "auto", marginRight: "auto", boxShadow: "0 1px 2px rgba(0,0,0,0.12)" }}>
        {image(8)}
        <div style={{ padding: "8px 4px 0", whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.45 }}>{text}</div>
        <div style={{ padding: "0 4px" }}>{videoLine("#027eb5")}</div>
        <div style={{ background: "rgba(0,0,0,0.05)", borderRadius: 8, padding: 10, margin: "8px 0 4px" }}>
          <strong style={{ display: "block", fontSize: 13 }}>{campaignName}</strong>
          <small style={{ color: "#667781" }}>{host || "your-link.com"}</small>
        </div>
        <div style={{ padding: "0 4px", fontSize: 13, color: "#027eb5", wordBreak: "break-all" }}>{trackingLink}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, fontSize: 11, color: "#667781", padding: "4px 4px 0" }}>
          {time} <CheckCheck size={14} color="#53bdeb" />
        </div>
      </div>
    </div>
  );

  const telegram = (
    <div style={{ background: "#cfe3f0", padding: "16px 12px", minHeight: 480 }}>
      <div style={{ background: "#ffffff", color: "#000000", borderRadius: 12, padding: 12, maxWidth: deviceView === "desktop" ? "750px" : "92%", margin: "0 auto", boxShadow: "0 1px 2px rgba(0,0,0,0.12)" }}>
        <strong style={{ display: "block", fontSize: 13, color: "#3390ec", marginBottom: 6 }}>{community}</strong>
        {image(8)}
        <div style={{ padding: "8px 0 0", whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.45 }}>{text}</div>
        {videoLine("#3390ec")}
        <div style={{ borderLeft: "3px solid #3390ec", padding: "4px 10px", margin: "10px 0 6px", background: "#f8f9fa" }}>
          <strong style={{ display: "block", fontSize: 13 }}>{campaignName}</strong>
          <small style={{ color: "#707579" }}>{host || "your-link.com"}</small>
        </div>
        <div style={{ fontSize: 13, color: "#3390ec", wordBreak: "break-all" }}>{trackingLink}</div>
        <div style={{ textAlign: "right", fontSize: 11, color: "#707579", marginTop: 4 }}>{time}</div>
      </div>
    </div>
  );

  const facebook = (
    <div style={{ background: "#f0f2f5", padding: "12px 10px", minHeight: 480 }}>
      <div style={{ background: "#ffffff", color: "#050505", borderRadius: 12, overflow: "hidden", maxWidth: deviceView === "desktop" ? "750px" : "100%", margin: "0 auto", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12 }}>
          <span style={{ width: 38, height: 38, borderRadius: "50%", background: "#1877f2", color: "#ffffff", display: "grid", placeItems: "center", fontWeight: 700 }}>S</span>
          <span>
            <strong style={{ display: "block", fontSize: 14 }}>{community}</strong>
            <small style={{ color: "#65676b" }}>Just now</small>
          </span>
        </div>
        <div style={{ padding: "0 12px 10px", whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.45 }}>{text}</div>
        <div style={{ padding: "0 12px" }}>{videoLine("#1877f2")}</div>
        {image(0)}
        <div style={{ background: "#f0f2f5", padding: "10px 12px" }}>
          <small style={{ color: "#65676b", textTransform: "uppercase", fontSize: 11, fontWeight: 600 }}>{host || "your-link.com"}</small>
          <strong style={{ display: "block", fontSize: 14, marginTop: 2 }}>{campaignName}</strong>
        </div>
        <div style={{ padding: "8px 12px", fontSize: 13, color: "#1877f2", wordBreak: "break-all" }}>{trackingLink}</div>
        <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid #ced0d4", padding: 10, color: "#65676b", fontSize: 13, fontWeight: 500 }}>
          <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><ThumbsUp size={15} /> Like</span>
          <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><MessageCircle size={15} /> Comment</span>
          <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Share2 size={15} /> Share</span>
        </div>
      </div>
    </div>
  );

  const discord = (
    <div style={{ background: "#313338", color: "#dbdee1", padding: "16px 12px", minHeight: 480 }}>
      <div style={{ maxWidth: deviceView === "desktop" ? "850px" : "100%", margin: "0 auto", display: "flex", gap: 10 }}>
        <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: "50%", background: "#5865f2", color: "#ffffff", display: "grid", placeItems: "center", fontWeight: 700 }}>S</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ marginBottom: 4 }}>
            <strong style={{ color: "#ffffff", fontSize: 14 }}>{community}</strong>{" "}
            <small style={{ color: "#949ba4", fontSize: 11, marginLeft: 4 }}>Today at {time}</small>
          </div>
          <div style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.45 }}>{text}</div>
          {videoLine("#00a8fc")}
          <div style={{ fontSize: 13, color: "#00a8fc", wordBreak: "break-all", margin: "6px 0" }}>{trackingLink}</div>
          <div style={{ borderLeft: "4px solid #5865f2", background: "#2b2d31", borderRadius: 6, padding: 10, marginTop: 8 }}>
            <small style={{ color: "#949ba4", fontSize: 11 }}>{host || "your-link.com"}</small>
            <strong style={{ display: "block", color: "#00a8fc", fontSize: 14, margin: "2px 0 8px" }}>{campaignName}</strong>
            {image(6)}
          </div>
        </div>
      </div>
    </div>
  );

  const newsletter = (
    <div style={{ background: "#f4f4f5", padding: "14px 10px", minHeight: 480 }}>
      <div style={{ background: "#ffffff", color: "#18181b", borderRadius: 12, overflow: "hidden", border: "1px solid #e4e4e7", maxWidth: deviceView === "desktop" ? "750px" : "100%", margin: "0 auto" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #e4e4e7" }}>
          <small style={{ color: "#71717a" }}>From {data.advertiser.trim() || "Business / advertiser"}</small>
          <strong style={{ display: "block", fontSize: 17, marginTop: 2 }}>{campaignName}</strong>
        </div>
        {image(0)}
        <div style={{ padding: 16, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.5 }}>{text}</div>
        <div style={{ padding: "0 16px" }}>{videoLine("#2563eb")}</div>
        <div style={{ padding: 16 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#18181b", color: "#ffffff", padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
            Open offer <ArrowUpRight size={14} />
          </span>
          <div style={{ fontSize: 12, color: "#71717a", wordBreak: "break-all", marginTop: 10 }}>{trackingLink}</div>
        </div>
      </div>
    </div>
  );

  const mocks: Record<Supported, JSX.Element> = {
    WhatsApp: whatsapp,
    Telegram: telegram,
    Facebook: facebook,
    Discord: discord,
    Newsletter: newsletter,
  };

  const isDarkTheme = activePlatform === "Discord";

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-soft)", color: "var(--ink)", padding: "32px 20px" }}>
      <div style={{ width: "80%", maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* Title Header with Device View Switcher */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Ad Campaign Preview</h1>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              Test and inspect how your offer looks across target platforms prior to launching.
            </p>
          </div>

          {/* Desktop / Mobile Toggle */}
          <div style={{ display: "inline-flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 4, gap: 4 }}>
            <button
              onClick={() => setDeviceView("mobile")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                border: "none",
                background: deviceView === "mobile" ? "var(--ink)" : "transparent",
                color: deviceView === "mobile" ? "var(--surface)" : "var(--muted)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <Smartphone size={15} /> Mobile
            </button>
            <button
              onClick={() => setDeviceView("desktop")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                border: "none",
                background: deviceView === "desktop" ? "var(--ink)" : "transparent",
                color: deviceView === "desktop" ? "var(--surface)" : "var(--muted)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <Monitor size={15} /> Desktop
            </button>
          </div>
        </div>

        {/* Main Workspace (Full Width Center) */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
          
          {/* Control Bar: Platform Selector */}
          <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface-soft)", gap: 8, overflowX: "auto" }}>
            {available.map((platform) => {
              const isActive = activePlatform === platform;
              return (
                <button
                  key={platform}
                  onClick={() => setActivePlatform(platform)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1px solid",
                    borderColor: isActive ? "var(--ink)" : "transparent",
                    background: isActive ? "var(--surface)" : "transparent",
                    color: "var(--ink)",
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    cursor: "pointer",
                    boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap"
                  }}
                >
                  <PlatformMark platform={platform} color="coral" />
                  {platform}
                </button>
              );
            })}
          </div>

          {/* Stage / Device Mockup Screen */}
          <div style={{ padding: deviceView === "desktop" ? "30px 40px" : "40px 20px", display: "flex", justifyContent: "center", background: "#f1f5f9", minHeight: 560, transition: "padding 0.2s ease" }}>
            
            {deviceView === "mobile" ? (
              /* Smartphone Frame Outer Shell */
              <div 
                style={{ 
                  width: 360, 
                  background: "#0f172a", 
                  borderRadius: 48, 
                  padding: "12px", 
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                  position: "relative"
                }}
              >
                {/* Hardware Speaker Notch */}
                <div style={{ width: 120, height: 18, background: "#0f172a", position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", borderBottomLeftRadius: 14, borderBottomRightRadius: 14, zIndex: 30 }} />

                {/* Smartphone Screen Canvas */}
                <div 
                  style={{ 
                    borderRadius: 38, 
                    overflow: "hidden", 
                    background: isDarkTheme ? "#313338" : "#ffffff", 
                    display: "flex", 
                    flexDirection: "column",
                    minHeight: 520,
                    position: "relative"
                  }}
                >
                  {/* Phone Status Bar (Time & Status Icons) */}
                  <div 
                    style={{ 
                      padding: "10px 20px 4px", 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      fontSize: 12, 
                      fontWeight: 600, 
                      color: isDarkTheme ? "#f8fafc" : "#0f172a",
                      zIndex: 20
                    }}
                  >
                    <span>{time}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Signal size={12} />
                      <Wifi size={12} />
                      <Battery size={14} />
                    </div>
                  </div>

                  {/* App Message Screen Content */}
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    {mocks[activePlatform]}
                  </div>

                  {/* iOS-Style Home Indicator Swipe Bar */}
                  <div style={{ padding: "8px 0 6px", display: "flex", justifyContent: "center", background: "transparent" }}>
                    <div style={{ width: 120, height: 4, background: isDarkTheme ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)", borderRadius: 2 }} />
                  </div>

                </div>
              </div>
            ) : (
              /* Desktop Browser Frame Shell */
              <div 
                style={{ 
                  width: "100%", 
                  maxWidth: 960,
                  background: "#1e293b", 
                  borderRadius: 16, 
                  overflow: "hidden",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {/* Browser Window Titlebar */}
                <div style={{ padding: "12px 16px", background: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                  </div>
                  <div style={{ flex: 1, margin: "0 16px", background: "#1e293b", padding: "4px 12px", borderRadius: 6, fontSize: 12, color: "#94a3b8", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {data.destinationUrl || "https://relay.market/preview"}
                  </div>
                </div>

                {/* Desktop Viewport Canvas */}
                <div style={{ background: isDarkTheme ? "#313338" : "#ffffff", minHeight: 520, overflowY: "auto" }}>
                  {mocks[activePlatform]}
                </div>
              </div>
            )}

          </div>
          
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", background: "var(--surface)", fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
            Sample preview view. Dynamic tracking URLs are generated automatically once posts go live.
          </div>
        </div>

      </div>
    </div>
  );
}
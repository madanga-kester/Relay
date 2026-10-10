import { ArrowLeft, ArrowUpRight, FileCheck, Upload } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import WorkspaceShell from "@/components/WorkspaceShell";
import { createRelayCommunity, relayBackendEnabled, setRelayBackendId, uploadRelayVerificationEvidence } from "@/lib/relayApi";
import { compressImageToDataUrl } from "@/lib/imageUtils";

type CommunityRecord = {
  slug: string; name: string; platform: string; category: string; members: string; audience: string; location: string; audienceDescription: string; communityLink?: string; verification: "Pending Verification"; activeCampaigns: number; campaignOpportunities: number; clicks: string; earned: number; posts: string; health: "Healthy"; color: "coral"; verificationMethod: string; images?: string[];
};
const platforms = ["WhatsApp", "Telegram", "Facebook", "Discord", "Other"];
const MAX_COMMUNITY_IMAGES = 15;
function savedCommunities(): CommunityRecord[] { try { const saved = window.localStorage.getItem("relay-communities"); return saved ? JSON.parse(saved) as CommunityRecord[] : []; } catch { return []; } }

export default function AddCommunity() {
  const [, navigate] = useLocation();
  const [name, setName] = useState(""); const [proofFile, setProofFile] = useState<File | undefined>(); const [platform, setPlatform] = useState("WhatsApp"); const [link, setLink] = useState(""); const [category, setCategory] = useState(""); const [members, setMembers] = useState(""); const [location, setLocation] = useState(""); const [description, setDescription] = useState(""); const [proofName, setProofName] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const addImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImageError("");
    const room = MAX_COMMUNITY_IMAGES - images.length;
    if (room <= 0) {
      setImageError(`You can add up to ${MAX_COMMUNITY_IMAGES} images.`);
      return;
    }
    const total = files.length;
    const picked = Array.from(files).slice(0, room);
    setImageBusy(true);
    const added: string[] = [];
    let failed = 0;
    for (const file of picked) {
      try {
        added.push(await compressImageToDataUrl(file));
      } catch {
        failed += 1;
      }
    }
    setImages((current) => [...current, ...added].slice(0, MAX_COMMUNITY_IMAGES));
    const skipped = total - picked.length;
    if (failed > 0 || skipped > 0) {
      const parts: string[] = [];
      if (failed > 0) parts.push(`${failed} could not be added (not an image, or over 8MB)`);
      if (skipped > 0) parts.push(`${skipped} skipped because of the ${MAX_COMMUNITY_IMAGES} image limit`);
      setImageError(parts.join(". ") + ".");
    }
    setImageBusy(false);
  };
  const removeImage = (index: number) => setImages((current) => current.filter((_, i) => i !== index));
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!name.trim() || !category.trim() || !members.trim() || !location.trim() || !description.trim()) return; let backendCommunityId: string | undefined; let verificationEvidenceKey: string | undefined; if (relayBackendEnabled()) { try { if (proofFile) verificationEvidenceKey = (await uploadRelayVerificationEvidence(proofFile)).key; const created = await createRelayCommunity({ name, platform, members: Number(members.replace(/[^0-9]/g, "")) || 0, category, location, communityLink: link || undefined, audienceDescription: description, verificationEvidenceKey }); backendCommunityId = created.id; } catch { /* Keep local creation available when the API is offline. */ } } const community: CommunityRecord = { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), name, platform, category, members, audience: `${location} · ${description}`, location, audienceDescription: description, communityLink: link, verification: "Pending Verification", activeCampaigns: 0, campaignOpportunities: 0, clicks: "0", earned: 0, posts: "0 posts", health: "Healthy", color: "coral", verificationMethod: proofName ? `Submitted proof · ${proofName}` : "Pending owner evidence", images }; if (backendCommunityId) setRelayBackendId("community", community.slug, backendCommunityId); try { window.localStorage.setItem("relay-communities", JSON.stringify([...savedCommunities(), community])); } catch { setImageError("Browser storage is full, so this community could not be saved. Remove some images and try again."); return; } navigate("/communities"); };
  return <WorkspaceShell active="My Communities"><div className="dashboard-body add-community-page"><Link className="hero-link route-back-link" href="/communities"><ArrowLeft size={15} /> Back to My Communities</Link><section className="add-community-heading"><span className="section-kicker"><span className="section-kicker-line" /> New digital asset</span><h1>Add a community</h1><p>Add an audience you own or manage, then submit simple proof so advertisers can trust the listing.</p></section><form className="add-community-form" onSubmit={submit}><div className="add-form-section"><div className="add-form-section-heading"><span>01</span><div><h2>Community details</h2><p>Tell us where your audience lives and who it is for.</p></div></div><div className="add-form-grid"><label>Community name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. After Hours" required /></label><label>Platform<select value={platform} onChange={(event) => setPlatform(event.target.value)}>{platforms.map((item) => <option key={item}>{item}</option>)}</select></label><label>Category<input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="e.g. Tech & lifestyle" required /></label><label>Community link <span className="field-optional">where available</span><input type="url" value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://chat.whatsapp.com/..." /></label></div></div><div className="add-form-section"><div className="add-form-section-heading"><span>02</span><div><h2>Audience profile</h2><p>Your audience size helps advertisers understand your potential reach.</p></div></div><div className="add-form-grid"><label>Members / followers<input value={members} onChange={(event) => setMembers(event.target.value)} placeholder="e.g. 12,500" required /></label><label>Location<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Nairobi, Kenya" required /></label><label className="add-form-full">Audience description<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Who is this community for?" rows={4} required /></label></div></div><div className="add-form-section"><div className="add-form-section-heading"><span>03</span><div><h2>Verification evidence</h2><p>New communities start as Pending Verification. Entering a member count does not automatically verify ownership.</p></div></div><div className="proof-guidance"><FileCheck size={18} /><div><strong>What to include in screenshots</strong><small>Show the group or channel name, platform, visible member/follower count, and ownership or admin proof. Hide private messages, phone numbers, and unrelated personal data.</small></div></div><label className="proof-upload">Upload a screenshot or supported proof <span className="field-optional">optional</span><span className="file-input-shell"><Upload size={15} /> <span>{proofName || "Choose an image or PDF"}</span><input type="file" accept="image/*,.pdf" onChange={(event) => { const file = event.target.files?.[0]; setProofFile(file); setProofName(file?.name ?? ""); }} /></span></label></div><div className="add-form-section"><div className="add-form-section-heading"><span>04</span><div><h2>Community images</h2><p>Add up to 15 photos of your community so advertisers can see what it looks like.</p></div></div><label className="proof-upload">Upload community images <span className="field-optional">optional</span><span className="file-input-shell"><Upload size={15} /> <span>{imageBusy ? "Processing images..." : `${images.length} of ${MAX_COMMUNITY_IMAGES} added`}</span><input type="file" accept="image/*" multiple disabled={imageBusy || images.length >= MAX_COMMUNITY_IMAGES} onChange={(event) => { void addImages(event.target.files); event.target.value = ""; }} /></span></label>{imageError && <p role="alert" className="field-optional">{imageError}</p>}{images.length > 0 && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 10, marginTop: 12 }}>{images.map((src, index) => <div key={index} style={{ position: "relative" }}><img src={src} alt={`Community image ${index + 1}`} style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: 8, display: "block" }} /><button type="button" onClick={() => removeImage(index)} aria-label={`Remove image ${index + 1}`} style={{ position: "absolute", top: 4, right: 4, border: "none", borderRadius: 4, padding: "2px 6px", fontSize: 11, cursor: "pointer", background: "rgba(0,0,0,0.65)", color: "#fff" }}>Remove</button></div>)}</div>}</div><div className="add-form-footer"><p>We may ask for additional evidence before approving this community for advertiser matching.</p><button className="accept-button" type="submit">Submit for verification <ArrowUpRight size={16} /></button></div></form></div></WorkspaceShell>;
}

const API_BASE = (import.meta.env.VITE_RELAY_API_URL as string | undefined)?.replace(/\/$/, "") ?? "/api/v1";
const ID_MAP_KEY = "relay-backend-id-map";
let csrfToken: string | null = null;

export type RelayPage<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type RelayProfile = {
  userId: string;
  businessName?: string | null;
  industry?: string | null;
  website?: string | null;
  location?: string | null;
  primaryGoal?: string | null;
  phoneNumber?: string | null;
  avatarKey?: string | null;
  onboardingCompleted: boolean;
  communityName?: string | null;
  communityPlatform?: string | null;
  communityMembers?: number | null;
  communityCategory?: string | null;
};

export type RelayCampaign = {
  id: string;
  advertiserId: string;
  name: string;
  advertiserName: string;
  description: string;
  advertisement: string;
  destinationUrl: string;
  platforms: string[];
  minimumAudience: number;
  maximumAudience: number;
  category: string;
  location: string;
  durationDays: number;
  maximumCommunities: number;
  cpc: number;
  budget: number;
  startDate: string;
  endDate: string;
  status: string;
};

export type RelayCommunity = {
  id: string;
  ownerId: string;
  name: string;
  platform: string;
  members: number;
  category: string;
  location: string;
  communityLink?: string | null;
  audienceDescription?: string | null;
  verificationEvidenceKey?: string | null;
  verificationStatus: string;
};

export type RelayUser = {
  id: string;
  email: string;
  displayName: string;
  role: "Advertiser" | "CommunityOwner" | "Admin";
  status: string;
};

export async function verifyRelayEmail(email: string, code: string) {
  return relayRequest<void>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function resendRelayVerification(email: string) {
  return relayRequest<void>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

type RequestOptions = RequestInit & { skipCsrf?: boolean };

async function getCsrf() {
  if (csrfToken) return csrfToken;
  const response = await fetch(`${API_BASE}/auth/csrf`, { credentials: "include" });
  if (!response.ok) throw new Error("Backend CSRF initialization failed");
  csrfToken = (await response.json() as { token: string }).token;
  return csrfToken;
}

export async function relayRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method) && !options.skipCsrf) {
    headers.set("X-CSRF-TOKEN", await getCsrf());
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json() as {
        title?: string;
        detail?: string;
        errors?: Record<string, string[]>;
      };
      detail =
        body.detail ??
        body.title ??
        Object.values(body.errors ?? {}).flat().join(" ");
    } catch {
      /* Use the status fallback below. */
    }
    throw new Error(detail || `Relay API request failed (${response.status})`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function relayBackendEnabled() {
  return Boolean(
    import.meta.env.VITE_RELAY_API_URL ||
    import.meta.env.VITE_RELAY_BACKEND_ENABLED === "true"
  );
}

export function setRelayBackendId(
  type: "campaign" | "community" | "application" | "placement",
  localId: string,
  backendId: string
) {
  try {
    const current = JSON.parse(
      localStorage.getItem(ID_MAP_KEY) ?? "{}"
    ) as Record<string, string>;
    current[`${type}:${localId}`] = backendId;
    localStorage.setItem(ID_MAP_KEY, JSON.stringify(current));
  } catch {
    /* Mapping is an optional migration aid. */
  }
}

export function getRelayBackendId(
  type: "campaign" | "community" | "application" | "placement",
  localId: string
) {
  try {
    const current = JSON.parse(
      localStorage.getItem(ID_MAP_KEY) ?? "{}"
    ) as Record<string, string>;
    return current[`${type}:${localId}`];
  } catch {
    return undefined;
  }
}

export async function registerRelayAccount(payload: {
  email: string;
  displayName: string;
  password: string;
  role: "Advertiser" | "CommunityOwner";
}) {
  return relayRequest<RelayUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginRelayAccount(email: string, password: string) {
  const user = await relayRequest<RelayUser>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  window.dispatchEvent(new Event("relay:session-changed"));
  return user;
}

export async function getRelaySession() {
  return relayRequest<RelayUser>("/auth/me");
}

export async function logoutRelayAccount() {
  csrfToken = null;
  const result = await relayRequest<void>("/auth/logout", {
    method: "POST",
  });
  [
    "relay_signup_role",
    "relay_signup_name",
    "relay_signup_email",
    "relay_onboarding_complete_role",
    "relay_reset_email",
    "relay_reset_token",
  ].forEach((key) => sessionStorage.removeItem(key));
  window.dispatchEvent(new Event("relay:session-changed"));
  return result;
}

export async function saveRelayProfile(profile: {
  businessName?: string;
  industry?: string;
  website?: string;
  location?: string;
  primaryGoal?: string;
  phoneNumber?: string;
  avatarKey?: string;
  onboardingCompleted: boolean;
  communityName?: string;
  communityPlatform?: string;
  communityMembers?: number;
  communityCategory?: string;
}) {
  return relayRequest<RelayProfile>("/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

export async function getRelayProfile() {
  return (
    (await relayRequest<RelayProfile | undefined>("/profile")) ??
    ({ userId: "", onboardingCompleted: false } as RelayProfile)
  );
}

export async function requestRelayPasswordReset(email: string) {
  return relayRequest<void>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetRelayPassword(token: string, newPassword: string) {
  return relayRequest<void>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function createRelayCampaign(payload: {
  name: string;
  advertiserName: string;
  description: string;
  advertisement: string;
  destinationUrl: string;
  platforms: string[];
  minimumAudience: number;
  maximumAudience: number;
  category: string;
  location: string;
  durationDays: number;
  maximumCommunities: number;
  cpc: number;
  budget: number;
  startDate: string;
  endDate: string;
}) {
  return relayRequest<RelayCampaign>("/campaigns", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createRelayCommunity(payload: {
  name: string;
  platform: string;
  members: number;
  category: string;
  location: string;
  communityLink?: string;
  audienceDescription: string;
  verificationEvidenceKey?: string;
}) {
  return relayRequest<RelayCommunity>("/communities", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadRelayVerificationEvidence(file: File) {
  const csrf = await getCsrf();
  const body = new FormData();
  body.append("file", file);
  return relayRequest<{ key: string; contentType: string; size: number }>(
    "/communities/verification-evidence",
    {
      method: "POST",
      headers: { "X-CSRF-TOKEN": csrf },
      body,
    }
  );
}

export async function transitionRelayCampaign(
  id: string,
  action: "publish" | "pause" | "resume" | "complete"
) {
  return relayRequest<RelayCampaign>(`/campaigns/${id}/actions/${action}`, {
    method: "POST",
  });
}

export async function createRelayApplication(
  campaignId: string,
  communityId: string
) {
  return relayRequest<{
    id: string;
    campaignId: string;
    communityId: string;
    status: string;
  }>("/applications", {
    method: "POST",
    body: JSON.stringify({ campaignId, communityId }),
  });
}

export async function reviewRelayApplication(
  id: string,
  accept: boolean,
  reason?: string
) {
  return relayRequest<{
    id: string;
    campaignId: string;
    communityId: string;
    status: string;
    placement?: { id: string; trackingId: string; status: string };
  }>(`/applications/${id}/review`, {
    method: "POST",
    body: JSON.stringify({ accept, reason }),
  });
}

export async function activateRelayPlacement(id: string) {
  return relayRequest(`/placements/${id}/activate`, {
    method: "POST",
  });
}

export async function completeRelayPlacement(id: string) {
  return relayRequest(`/placements/${id}/complete`, {
    method: "POST",
  });
}

export type RelayAdminOverview = {
  totalUsers: number;
  advertisers: number;
  communityOwners: number;
  campaigns: number;
  activeCampaigns: number;
  communities: number;
  activeCommunities: number;
  applications: number;
  pendingApplications: number;
  placements: number;
  activePlacements: number;
  qualifiedClicks: number;
  advertiserSpend: number;
  communityOwnerEarnings: number;
  platformRevenue: number;
};

export async function getRelayAdminOverview() {
  return relayRequest<RelayAdminOverview>("/admin/overview");
}

export type RelayAdminReport = {
  from?: string | null;
  to?: string | null;
  campaigns: number;
  activeCampaigns: number;
  communities: number;
  activeCommunities: number;
  applications: number;
  placements: number;
  qualifiedClicks: number;
  advertiserSpend: number;
  communityOwnerEarnings: number;
  platformRevenue: number;
  reconciliationDelta: number;
};

export type RelayAdminHealth = {
  activeCampaigns: number;
  activePlacements: number;
  qualifiedClicksLast24Hours: number;
  failedEventsLast24Hours: number;
  activityEventsLast24Hours: number;
  financialsReconciled: boolean;
};

export async function getRelayAdminReport(from?: string, to?: string) {
  const query = new URLSearchParams();
  if (from) query.set("from", from);
  if (to) query.set("to", to);
  return relayRequest<RelayAdminReport>(
    `/admin/reports${query.toString() ? `?${query}` : ""}`
  );
}

export async function getRelayAdminHealth() {
  return relayRequest<RelayAdminHealth>("/admin/health");
}

export type RelayAdminNote = {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  text: string;
  authorId: string;
  createdAt: string;
};

export type RelayReviewCase = {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  reason: string;
  status: string;
  resolutionAction?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
};

export type RelayPayout = {
  id: string;
  communityOwnerId: string;
  campaignId: string;
  placementId: string;
  amount: number;
  status: string;
  failureReason?: string | null;
  createdAt: string;
};

export type RelayAdminNotification = {
  id: string;
  type: string;
  title: string;
  description: string;
  href: string;
  entityId?: string | null;
  read: boolean;
  createdAt: string;
};

export async function listRelayAdminNotes(
  entityType?: string,
  entityId?: string
) {
  const query = new URLSearchParams();
  if (entityType) query.set("entityType", entityType);
  if (entityId) query.set("entityId", entityId);
  return relayRequest<RelayPage<RelayAdminNote>>(`/admin/notes?${query}`);
}

export async function addRelayAdminNote(payload: {
  entityType: string;
  entityId: string;
  entityName: string;
  text: string;
}) {
  return relayRequest<RelayAdminNote>("/admin/notes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteRelayAdminNote(id: string) {
  return relayRequest<void>(`/admin/notes/${id}`, {
    method: "DELETE",
  });
}

export async function listRelayReviewCases() {
  return relayRequest<RelayPage<RelayReviewCase>>("/admin/reviews");
}

export async function createRelayReviewCase(payload: {
  entityType: string;
  entityId: string;
  entityName: string;
  reason: string;
}) {
  return relayRequest<RelayReviewCase>("/admin/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resolveRelayReviewCase(
  id: string,
  status: string,
  action: string
) {
  return relayRequest<RelayReviewCase>(`/admin/reviews/${id}/resolve`, {
    method: "POST",
    body: JSON.stringify({ status, action }),
  });
}

export async function listRelayPayouts() {
  return relayRequest<RelayPage<RelayPayout>>("/admin/payouts");
}

export async function changeRelayPayoutStatus(
  id: string,
  status: string,
  failureReason?: string
) {
  return relayRequest<RelayPayout>(`/admin/payouts/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status, failureReason }),
  });
}

export async function listRelayAdminNotifications() {
  return relayRequest<RelayPage<RelayAdminNotification>>(
    "/admin/notifications"
  );
}

export async function markRelayAdminNotificationRead(id: string) {
  return relayRequest<RelayAdminNotification>(
    `/admin/notifications/${id}/read`,
    { method: "POST" }
  );
}

export async function getRelayAdminSetting(key: string) {
  return relayRequest<{ key: string; value: string }>(
    `/admin/settings/${encodeURIComponent(key)}`
  );
}

export async function saveRelayAdminSetting(key: string, value: string) {
  return relayRequest<{ key: string; value: string }>(
    `/admin/settings/${encodeURIComponent(key)}`,
    {
      method: "PUT",
      body: JSON.stringify({ value }),
    }
  );
}

export async function changeRelayAdminUserStatus(
  id: string,
  status: "Active" | "Suspended"
) {
  return relayRequest<void>(`/admin/users/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

export async function changeRelayAdminCommunityStatus(
  id: string,
  status: "Verified" | "Suspended"
) {
  return relayRequest<void>(`/admin/communities/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

export async function changeRelayAdminPlacementStatus(
  id: string,
  status: "Active" | "Completed"
) {
  return relayRequest<void>(`/admin/placements/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

export async function getRelayVerificationEvidenceUrl(communityId: string) {
  return relayRequest<{ url: string; expiresInSeconds: number }>(
    `/communities/verification-evidence/${communityId}/url`
  );
}

export async function listRelayCampaigns(page = 1, pageSize = 100) {
  return relayRequest<RelayPage<RelayCampaign>>(
    `/campaigns?page=${page}&pageSize=${pageSize}`
  );
}

export async function listMyRelayCampaigns(page = 1, pageSize = 100) {
  return relayRequest<RelayPage<RelayCampaign>>(
    `/campaigns/mine?page=${page}&pageSize=${pageSize}`
  );
}

export async function listRelayCommunities(page = 1, pageSize = 100) {
  return relayRequest<RelayPage<RelayCommunity>>(
    `/communities?page=${page}&pageSize=${pageSize}`
  );
}

export async function listMyRelayCommunities(page = 1, pageSize = 100) {
  return relayRequest<RelayPage<RelayCommunity>>(
    `/communities/mine?page=${page}&pageSize=${pageSize}`
  );
}

export async function listRelayApplications(page = 1, pageSize = 100) {
  return relayRequest<
    RelayPage<{
      id: string;
      campaignId: string;
      communityId: string;
      communityOwnerId: string;
      cpc: number;
      status: string;
      placement?: { id: string; trackingId: string; status: string };
    }>
  >(`/applications/mine?page=${page}&pageSize=${pageSize}`);
}

export async function listMyRelayPlacements(page = 1, pageSize = 100) {
  return relayRequest<
    RelayPage<{
      id: string;
      campaignId: string;
      communityId: string;
      communityOwnerId: string;
      trackingId: string;
      status: string;
    }>
  >(`/placements/mine?page=${page}&pageSize=${pageSize}`);
}
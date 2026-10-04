export const ADMIN_PROFILE_KEY = "relay-admin-profile";

export type AdminProfile = { name: string; email: string; avatar: string; phone: string };

export const defaultAdminProfile: AdminProfile = {
  name: "Admin Director",
  email: "admin@relay.local",
  avatar: "",
  phone: "+254 700 000 000",
};

export function readAdminProfile(): AdminProfile {
  try {
    const stored = JSON.parse(window.localStorage.getItem(ADMIN_PROFILE_KEY) ?? "null") as Partial<AdminProfile> | null;
    return { ...defaultAdminProfile, ...(stored ?? {}) };
  } catch {
    return defaultAdminProfile;
  }
}

export function saveAdminProfile(profile: AdminProfile) {
  window.localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent("ownerboard:admin-profile-updated"));
}

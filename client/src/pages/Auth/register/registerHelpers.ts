import { RelayApiError } from "@/lib/relayApi";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FALLBACK_MESSAGE_PREFIX = "Relay API request failed";

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

export function getRegisterErrorMessage(error: unknown): string {
  if (!(error instanceof RelayApiError)) {
    return "Could not reach Relay. Check your connection and try again.";
  }
  if (error.status === 429) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (error.status >= 500) {
    return "Relay is having a problem right now. Please try again shortly.";
  }
  if (error.message && !error.message.startsWith(FALLBACK_MESSAGE_PREFIX)) {
    return error.message;
  }
  return "Relay could not create this account. Check the details and try again.";
}
import { Check } from "lucide-react";
import { CSSProperties } from "react";

export type PasswordRule = { id: string; label: string; met: boolean };

const SYMBOL_PATTERN = /[!-\/:-@\[-`{-~]/;

export function getPasswordRules(password: string, confirm: string): PasswordRule[] {
  return [
    { id: "length", label: "At least 12 characters", met: password.length >= 12 },
    { id: "uppercase", label: "One uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { id: "lowercase", label: "One lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { id: "number", label: "One number (0-9)", met: /[0-9]/.test(password) },
    { id: "symbol", label: "One symbol (for example ! @ # $ %)", met: SYMBOL_PATTERN.test(password) },
    { id: "match", label: "Passwords match", met: confirm.length > 0 && password === confirm },
  ];
}

const srOnlyStyle: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

type PasswordRulesProps = {
  rules: PasswordRule[];
  allMet: boolean;
};

export function PasswordRules({ rules, allMet }: PasswordRulesProps) {
  return (
    <ul
      id="password-rules"
      aria-live="polite"
      style={{ listStyle: "none", margin: "0 0 14px", padding: 0, display: "grid", gap: 6, fontSize: 13 }}
    >
      {rules.map(rule => (
        <li key={rule.id} style={{ display: "flex", alignItems: "center", gap: 8, color: rule.met ? "#16a34a" : "#6b7280" }}>
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: rule.met ? "1px solid #16a34a" : "1px solid #9ca3af",
              background: rule.met ? "#16a34a" : "transparent",
              color: "#ffffff",
            }}
          >
            {rule.met && <Check size={10} />}
          </span>
          <span>{rule.label}</span>
          <span style={srOnlyStyle}>{rule.met ? "requirement met" : "requirement not met"}</span>
        </li>
      ))}
      {allMet && (
        <li style={{ color: "#16a34a", fontWeight: 600 }}>All password requirements met.</li>
      )}
    </ul>
  );
}
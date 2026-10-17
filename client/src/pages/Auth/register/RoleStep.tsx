import { ArrowRight, BriefcaseBusiness, Check, UsersRound } from "lucide-react";
import { Link } from "wouter";
import type { Role } from "./types";

type RoleStepProps = {
  role: Role;
  onRoleChange: (role: Role) => void;
  onContinue: () => void;
};

export function RoleStep({ role, onRoleChange, onContinue }: RoleStepProps) {
  return (
    <>
      <span className="public-eyebrow public-eyebrow-dark"><span /> Step 1 of 2</span>
      <h2>Join the marketplace.</h2>
      <p>Select your primary role to get started.</p>

      <div className="role-picker">
        <button
          type="button"
          className={role === "advertiser" ? "role-card role-card-selected" : "role-card"}
          onClick={() => onRoleChange("advertiser")}
        >
          <span><BriefcaseBusiness size={18} /></span>
          <strong>Campaign Owner (Advertiser)</strong>
          <small>Create campaigns and reach relevant communities.</small>
          {role === "advertiser" && <Check size={15} />}
        </button>

        <button
          type="button"
          className={role === "community-owner" ? "role-card role-card-selected role-card-lilac" : "role-card"}
          onClick={() => onRoleChange("community-owner")}
        >
          <span><UsersRound size={18} /></span>
          <strong>Community Owner</strong>
          <small>Monetize your community through relevant advertising.</small>
          {role === "community-owner" && <Check size={15} />}
        </button>
      </div>

      <button
        type="button"
        className="auth-submit"
        onClick={onContinue}
        style={{ marginTop: 24, width: "auto", paddingLeft: 32, paddingRight: 32 }}
      >
        Continue <ArrowRight size={16} />
      </button>

      <p className="auth-switch" style={{ marginTop: 20 }}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}
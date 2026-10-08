import { Building2, Globe2, MapPin, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { OnboardingShell, ReviewRow } from "./OnboardingShell";
import { getRelayProfile, relayBackendEnabled, saveRelayProfile } from "@/lib/relayApi";

type AdvertiserForm = {
  contactName: string;
  businessName: string;
  industry: string;
  website: string;
  location: string;
  goal: string;
};

const steps = [
  { label: "Profile", title: "Tell us about you", description: "Start with the person and business behind your campaigns." },
  { label: "Business", title: "Shape your campaign workspace", description: "These details help organize your advertising marketplace experience." },
  { label: "Review", title: "Review your setup", description: "Everything looks good? Complete onboarding to enter your workspace." },
];

export default function AdvertiserOnboardingPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [form, setForm] = useState<AdvertiserForm>({
    contactName: sessionStorage.getItem("relay_signup_name") ?? "",
    businessName: "",
    industry: "",
    website: "",
    location: "",
    goal: "",
  });

  useEffect(() => {
    if (!relayBackendEnabled()) return;
    void getRelayProfile()
      .then((profile) =>
        setForm((current) => ({
          ...current,
          businessName: profile.businessName ?? current.businessName,
          industry: profile.industry ?? current.industry,
          website: profile.website ?? current.website,
          location: profile.location ?? current.location,
          goal: profile.primaryGoal ?? current.goal,
        }))
      )
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Your saved profile could not be loaded.");
      });
  }, []);

  const update = (key: keyof AdvertiserForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const next = async () => {
    setError("");
    if (step === 0 && form.contactName.trim().length < 2) {
      setError("Add your name to continue.");
      return;
    }
    if (step === 1 && (!form.businessName.trim() || !form.industry.trim())) {
      setError("Add your business name and industry to continue.");
      return;
    }
    if (step < steps.length - 1) {
      setStep((value) => value + 1);
      return;
    }
    sessionStorage.setItem("relay_onboarding_advertiser", JSON.stringify(form));
    sessionStorage.setItem("relay_onboarding_complete_role", "advertiser");
    if (relayBackendEnabled()) {
      try {
        await saveRelayProfile({
          businessName: form.businessName,
          industry: form.industry,
          website: form.website,
          location: form.location,
          primaryGoal: form.goal,
          onboardingCompleted: true,
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : "Your profile could not be saved. Try again.");
        return;
      }
    }
    setLocation("/campaign-owner");
  };

  const back = () => {
    setError("");
    setStep((value) => Math.max(value - 1, 0));
  };

  return (
    <OnboardingShell
      role="Advertiser"
      steps={steps}
      step={step}
      onBack={back}
      onContinue={next}
      continueLabel={step === 2 ? "Complete setup" : "Continue"}
    >
      {step === 0 && (
        <div className="onboarding-fields">
          <label>
            Contact name
            <div className="onboarding-input">
              <Building2 size={16} />
              <input
                value={form.contactName}
                onChange={(event) => update("contactName", event.target.value)}
                placeholder="Your full name"
              />
            </div>
          </label>
          <label>
            Work email
            <div className="onboarding-input">
              <input
                value={sessionStorage.getItem("relay_signup_email") ?? ""}
                readOnly
                placeholder="you@company.com"
              />
            </div>
          </label>
          <label>
            What do you want to achieve?
            <div className="onboarding-input">
              <Target size={16} />
              <select value={form.goal} onChange={(event) => update("goal", event.target.value)}>
                <option value="">Select a primary goal</option>
                <option>Reach relevant communities</option>
                <option>Launch my first campaign</option>
                <option>Improve campaign performance</option>
              </select>
            </div>
          </label>
        </div>
      )}

      {step === 1 && (
        <div className="onboarding-fields">
          <label>
            Business or brand name
            <div className="onboarding-input">
              <Building2 size={16} />
              <input
                value={form.businessName}
                onChange={(event) => update("businessName", event.target.value)}
                placeholder="e.g. Urban Sneakers"
              />
            </div>
          </label>
          <label>
            Industry
            <div className="onboarding-input">
              <input
                value={form.industry}
                onChange={(event) => update("industry", event.target.value)}
                placeholder="e.g. Fashion & retail"
              />
            </div>
          </label>
          <div className="onboarding-field-grid">
            <label>
              Business location
              <div className="onboarding-input">
                <MapPin size={16} />
                <input
                  value={form.location}
                  onChange={(event) => update("location", event.target.value)}
                  placeholder="Nairobi, Kenya"
                />
              </div>
            </label>
            <label>
              Website <span className="onboarding-optional">Optional</span>
              <div className="onboarding-input">
                <Globe2 size={16} />
                <input
                  value={form.website}
                  onChange={(event) => update("website", event.target.value)}
                  placeholder="https://"
                />
              </div>
            </label>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="onboarding-review">
          <ReviewRow label="Contact" value={form.contactName} />
          <ReviewRow label="Business" value={form.businessName} />
          <ReviewRow label="Industry" value={form.industry} />
          <ReviewRow label="Location" value={form.location} />
          <ReviewRow label="Primary goal" value={form.goal} />
        </div>
      )}

      {error && <p className="onboarding-error">{error}</p>}
    </OnboardingShell>
  );
}
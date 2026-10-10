import type { CSSProperties } from "react";
import type { IconType } from "react-icons";
import {
  FaDiscord,
  FaFacebookF,
  FaTelegramPlane,
  FaWhatsapp,
} from "react-icons/fa";

const platformBrands: Record<string, { icon: IconType; color: string }> = {
  telegram: { icon: FaTelegramPlane, color: "#26a5e4" },
  whatsapp: { icon: FaWhatsapp, color: "#25d366" },
  facebook: { icon: FaFacebookF, color: "#1877f2" },
  discord: { icon: FaDiscord, color: "#5865f2" },
};

export default function PlatformMark({
  platform,
  className,
  fallback,
  iconSize = 16,
  style,
}: {
  platform: string;
  className?: string;
  fallback?: string;
  iconSize?: number;
  style?: CSSProperties;
}) {
  const brand = platformBrands[platform.toLowerCase()];
  if (!brand) {
    return (
      <span className={className} style={style}>
        {fallback ?? platform.slice(0, 1)}
      </span>
    );
  }
  const Icon = brand.icon;
  return (
    <span
      className={className}
      style={{ ...style, background: brand.color }}
      role="img"
      aria-label={platform}
      title={platform}
    >
      <Icon size={iconSize} color="#ffffff" aria-hidden="true" />
    </span>
  );
}
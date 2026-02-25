"use client";

import { useState } from "react";

/**
 * Resolve domain for logo lookup. Clearbit expects format like "stripe.com".
 * Uses domain if it looks valid (contains a dot), else derives from company name.
 */
function resolveLogoDomain(domain: string | null | undefined, company: string | null | undefined): string | null {
  const d = (domain || "").trim();
  if (d && d !== "—" && d.includes(".")) return d;
  const c = (company || "").trim().replace(/\s+/g, "").replace(/[^a-z0-9.-]/gi, "").toLowerCase();
  if (!c) return null;
  return c.includes(".") ? c : `${c}.com`;
}

type CompanyLogoProps = {
  domain?: string | null;
  company?: string | null;
  size?: number;
  className?: string;
};

/**
 * Company logo via Clearbit (free, no API key). Falls back to initials on load error.
 */
export function CompanyLogo({ domain, company, size = 40, className = "" }: CompanyLogoProps) {
  const [imgError, setImgError] = useState(false);
  const logoDomain = resolveLogoDomain(domain, company);
  const logoUrl = logoDomain && !imgError
    ? `https://logo.clearbit.com/${logoDomain}`
    : null;

  const initials = (company || "?")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 ${className}`}
      style={{ width: size, height: size }}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          className="h-full w-full object-contain p-1"
          style={{ minWidth: size, minHeight: size }}
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className="text-gray-500 font-medium"
          style={{ fontSize: Math.max(10, size * 0.4) }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

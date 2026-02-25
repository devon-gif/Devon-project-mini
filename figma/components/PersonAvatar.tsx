"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";

/** Generate a profile image URL from name (initials on colored background). No API key. */
export function avatarUrlFromName(name: string | null, size = 80): string {
  const n = (name || "?").trim() || "?";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&size=${size}&background=2563eb&color=fff`;
}

/** Open Google Image search for "[Name] [Company]" so user can find a photo to use. */
export function searchForPersonPhotoUrl(name: string | null, company?: string | null): string {
  const q = [name, company].filter(Boolean).join(" ");
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(q)}`;
}

type PersonAvatarProps = {
  name: string | null;
  avatar_url?: string | null;
  company?: string | null;
  size?: number;
  className?: string;
  showFindPhoto?: boolean;
};

export function PersonAvatar({
  name,
  avatar_url,
  company,
  size = 32,
  className = "",
  showFindPhoto = true,
}: PersonAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const src = avatar_url && !imgError ? avatar_url : avatarUrlFromName(name, size);
  const showInitials = imgError; // fallback when image fails to load
  const initials =
    (name || "?")
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 ${className}`} style={{ width: size, height: size }}>
      {showInitials ? (
        <span className="flex items-center justify-center text-[10px] font-medium text-blue-600" style={{ fontSize: Math.max(10, size * 0.35) }}>
          {initials}
        </span>
      ) : (
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          style={{ minWidth: size, minHeight: size }}
          onError={() => setImgError(true)}
        />
      )}
      {showFindPhoto && (
        <a
          href={searchForPersonPhotoUrl(name, company)}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#2563EB]"
          title="Search for a profile photo"
        >
          <ImagePlus className="h-2.5 w-2.5" />
        </a>
      )}
    </div>
  );
}

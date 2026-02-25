"use client";

import { useState, useRef } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

/** Generate a profile image URL from name (initials on colored background). No API key. */
export function avatarUrlFromName(name: string | null, size = 80): string {
  const n = (name || "?").trim() || "?";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&size=${size}&background=2563eb&color=fff`;
}

type PersonAvatarProps = {
  name: string | null;
  avatar_url?: string | null;
  company?: string | null;
  size?: number;
  className?: string;
  /** When set, show upload button instead of search link. Pass person id for DB-backed people. */
  personId?: string;
  /** Called when avatar is successfully uploaded. */
  onAvatarChange?: (avatarUrl: string) => void;
};

export function PersonAvatar({
  name,
  avatar_url,
  company,
  size = 32,
  className = "",
  personId,
  onAvatarChange,
}: PersonAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const effectiveUrl = localAvatar || avatar_url;
  const src = effectiveUrl && !imgError ? effectiveUrl : avatarUrlFromName(name, size);
  const showInitials = imgError; // fallback when image fails to load
  const initials =
    (name || "?")
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const showUpload = personId != null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || !personId) return;
    e.target.value = "";

    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch(`/api/people/${personId}/avatar`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      const url = data.avatar_url ?? "";
      setLocalAvatar(url);
      setImgError(false);
      onAvatarChange?.(url);
      toast.success("Photo added");
    } catch (err) {
      console.error("Avatar upload failed:", err);
      toast.error(err instanceof Error ? err.message : "Failed to add photo");
    } finally {
      setUploading(false);
    }
  };

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
      {showUpload && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#2563EB] disabled:opacity-50"
            title="Add your own photo"
          >
            {uploading ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <ImagePlus className="h-2.5 w-2.5" />}
          </button>
        </>
      )}
    </div>
  );
}

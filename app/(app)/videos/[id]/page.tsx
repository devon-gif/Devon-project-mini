"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { VideoDetailClient } from "./VideoDetailClient";

type ForwardRow = { id: string; recipient_name: string; recipient_email: string; note: string | null; created_at: string };

type DetailData = {
  video: Record<string, unknown>;
  events: Array<{ id: string; created_at: string; event_type: string; progress_percent?: number; meta?: Record<string, unknown> }>;
  forwards?: ForwardRow[];
};

export default function VideoDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/videos/${id}/detail`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) {
    router.replace("/videos");
    return null;
  }
  if (loading) return <div className="p-6 text-gray-500">Loading…</div>;
  if (error || !data) return <div className="p-6 text-gray-500">Video not found.</div>;

  return <VideoDetailClient video={data.video} events={data.events} forwards={data.forwards ?? []} />;
}

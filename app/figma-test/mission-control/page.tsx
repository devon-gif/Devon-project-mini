"use client";

import dynamic from "next/dynamic";

const MissionControl = dynamic(
  () => import("@/figma/pages/MissionControl").then((m) => ({ default: m.MissionControl })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[400px] items-center justify-center p-8">
        <div className="text-sm text-gray-500">Loading Mission Control…</div>
      </div>
    ),
  }
);

export default function MissionControlPage() {
  return <MissionControl />;
}

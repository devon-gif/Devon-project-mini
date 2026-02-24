"use client";

import { Suspense } from "react";
import { CreateVideo } from "@/figma/pages/CreateVideo";

export default function CreateVideoPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">Loading…</div>}>
      <CreateVideo />
    </Suspense>
  );
}

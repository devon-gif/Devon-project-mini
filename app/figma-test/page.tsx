"use client";

import React from "react";
import { createMemoryRouter, RouterProvider, Outlet } from "react-router-dom";

// Figma layout + pages
import { AppShell } from "@/figma/components/layout/AppShell";
import { Login } from "@/figma/pages/Login";
import { MissionControl } from "@/figma/pages/MissionControl";
import { Accounts } from "@/figma/pages/Accounts";
import { Inbox } from "@/figma/pages/Inbox";
import { Tasks } from "@/figma/pages/Tasks";
import { VideoOutreach } from "@/figma/pages/VideoOutreach";
import { CreateVideo } from "@/figma/pages/CreateVideo";
import { VideoDetail } from "@/figma/pages/VideoDetail";
import { VideoLanding } from "@/figma/pages/VideoLanding";
import { Settings } from "@/figma/pages/Settings";

export default function FigmaTestPage() {
  const router = React.useMemo(
    () =>
      createMemoryRouter([
        { path: "/login", element: <Login /> },
        {
          path: "/",
          element: <AppShell><Outlet /></AppShell>,
          children: [
            { index: true, element: <MissionControl /> },
            { path: "accounts", element: <Accounts /> },
            { path: "inbox", element: <Inbox /> },
            { path: "tasks", element: <Tasks /> },
            { path: "videos", element: <VideoOutreach /> },
            { path: "videos/create", element: <CreateVideo /> },
            { path: "videos/landing-preview", element: <VideoLanding /> },
            { path: "videos/landing-preview/:id", element: <VideoLanding /> },
            { path: "videos/:id", element: <VideoDetail /> },
            { path: "settings", element: <Settings /> },
          ],
        },
      ]),
    []
  );

  return <RouterProvider router={router} />;
}

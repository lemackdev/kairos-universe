"use client";

import dynamic from "next/dynamic";

// WebGL needs the browser, so the viewer is never rendered on the server.
const CampusViewer = dynamic(() => import("./CampusViewer"), {
  ssr: false,
  loading: () => <p className="campusSummary">Loading the 3D campus&hellip;</p>,
});

export function CampusViewerLoader() {
  return <CampusViewer />;
}

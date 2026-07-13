import { Suspense } from "react";
import SurfaceAnalyticsView from "@/features/analytics/SurfaceAnalyticsView";

export default function AnalyticsPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 p-8">
      <Suspense fallback={<div className="text-white">Loading Analytics...</div>}>
        <SurfaceAnalyticsView />
      </Suspense>
    </div>
  );
}

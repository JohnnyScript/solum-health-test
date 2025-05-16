import { DashboardMetrics } from "@/components/dashboard-metrics";

export default function HomePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Métricas</h2>
      </div>

      <DashboardMetrics />
    </div>
  );
}

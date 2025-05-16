import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CallsTable } from "@/components/calls-table";
import { CallsFilter } from "@/components/calls-filter";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { DashboardMetrics } from "@/components/dashboard-metrics";

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Subir Excel
        </Button>
      </div>

      <Tabs defaultValue="calls" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calls">Llamadas</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        <TabsContent value="calls" className="space-y-4">
          <CallsTable />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <DashboardMetrics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

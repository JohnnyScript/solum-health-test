import { CallsTable } from "@/components/calls-table";

export default function CallsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Calls</h2>
      </div>
      <CallsTable />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DataTable } from "@/components/data-table";

type Assistant = {
  id: string;
  name: string;
  calls: number;
  avgScore: number;
};

export default function AssistantsPage() {
  const [agentRanking, setAgentRanking] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        const { data: agentData } = await supabase
          .from("calls")
          .select(
            `
            assistant:assistant_id (
              id,
              name
            ),
            evaluation_score_human
          `
          )
          .not("evaluation_score_human", "is", null);

        // Process agent data
        const agentStats = (agentData || []).reduce(
          (acc: { [key: string]: Assistant }, curr: any) => {
            const agentId = curr.assistant?.id;
            const agentName = curr.assistant?.name;
            if (!agentId || !agentName) return acc;

            if (!acc[agentId]) {
              acc[agentId] = {
                id: agentId,
                name: agentName,
                calls: 0,
                avgScore: 0,
              };
            }
            acc[agentId].calls++;
            acc[agentId].avgScore += curr.evaluation_score_human || 0;
            return acc;
          },
          {}
        );

        const ranking = Object.values(agentStats || {})
          .map((agent) => ({
            ...agent,
            avgScore: agent.avgScore / agent.calls,
          }))
          .sort((a, b) => b.avgScore - a.avgScore);

        setAgentRanking(ranking);
      } catch (error) {
        console.error("Error fetching agent data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, []);

  return (
    <main className="flex min-h-screen flex-col p-6">
      <h1 className="text-2xl font-bold mb-6">Assistants Performance</h1>
      <DataTable title="Agent Ranking" data={agentRanking} loading={loading} />
    </main>
  );
}

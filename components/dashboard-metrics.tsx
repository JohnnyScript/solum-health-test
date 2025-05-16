"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type MetricsData = {
  totalCalls: number;
  avgDuration: number;
  successRate: number;
  discrepancyRate: number;
  callsByDay: { date: string; count: number }[];
};

export function DashboardMetrics() {
  const [metricsData, setMetricsData] = useState<MetricsData>({
    totalCalls: 0,
    avgDuration: 0,
    successRate: 0,
    discrepancyRate: 0,
    callsByDay: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetricsData = async () => {
      try {
        setLoading(true);

        // Fetch total calls
        const { count: totalCalls } = await supabase
          .from("calls")
          .select("*", { count: "exact", head: true });

        // Fetch average duration
        const { data: durationData } = await supabase
          .from("calls")
          .select("duration")
          .not("duration", "is", null);

        const avgDuration = durationData
          ? durationData.reduce((acc, curr) => acc + (curr.duration || 0), 0) /
            durationData.length
          : 0;

        // Fetch success rate (calls with positive outcome)
        const { count: successfulCalls } = await supabase
          .from("calls")
          .select("*", { count: "exact", head: true })
          .gte("evaluation_score_human", 4);

        // Fetch discrepancy rate (difference between human and LLM scores > 1)
        const { data: callsData } = await supabase
          .from("calls")
          .select("evaluation_score_human, evaluation_score_llm")
          .not("evaluation_score_human", "is", null)
          .not("evaluation_score_llm", "is", null);

        const discrepantCalls =
          callsData?.filter(
            (call) =>
              Math.abs(
                (call.evaluation_score_human || 0) -
                  (call.evaluation_score_llm || 0)
              ) > 1
          ).length || 0;

        // Fetch calls by day for the last 10 days
        const { data: callsByDay } = await supabase
          .from("calls")
          .select("created_at")
          .gte(
            "created_at",
            new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          )
          .order("created_at");

        // Process calls by day
        const dailyCalls = callsByDay?.reduce(
          (acc: { [key: string]: number }, curr) => {
            const date = new Date(curr.created_at).toISOString().split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          },
          {}
        );

        const callsByDayArray = Object.entries(dailyCalls || {}).map(
          ([date, count]) => ({
            date,
            count,
          })
        );

        setMetricsData({
          totalCalls: totalCalls || 0,
          avgDuration,
          successRate: totalCalls ? (successfulCalls || 0) / totalCalls : 0,
          discrepancyRate: callsData?.length
            ? discrepantCalls / callsData.length
            : 0,
          callsByDay: callsByDayArray,
        });
      } catch (error) {
        console.error("Error fetching metrics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetricsData();
  }, []);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return <div>Loading metrics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsData.totalCalls}</div>
            <p className="text-xs text-muted-foreground">
              +
              {metricsData.callsByDay[metricsData.callsByDay.length - 1]
                ?.count || 0}{" "}
              today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Duration
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(metricsData.avgDuration)}
            </div>
            <p className="text-xs text-muted-foreground">Minutes per call</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metricsData.successRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Calls with positive outcome
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discrepancies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metricsData.discrepancyRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Between human and LLM evaluation
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

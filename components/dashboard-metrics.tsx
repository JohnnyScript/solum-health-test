"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Phone,
  Clock,
  CheckCircle,
  AlertTriangle,
  Percent,
  Star,
  Bot,
  FileCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

type MetricsData = {
  totalCalls: number;
  successRate: number;
  avgHumanScore: number;
  avgLLMScore: number;
  evaluatedRate: number;
  avgScoreDifference: number;
  highDiscrepancyRate: number;
  scoresOverTime: {
    date: string;
    humanScore: number;
    llmScore: number;
  }[];
  scoresByAssistant: {
    name: string;
    avgScore: number;
  }[];
  scoresByClinic: {
    name: string;
    avgScore: number;
  }[];
  sentimentDistribution: {
    name: string;
    value: number;
  }[];
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function DashboardMetrics() {
  const [metricsData, setMetricsData] = useState<MetricsData>({
    totalCalls: 0,
    successRate: 0,
    avgHumanScore: 0,
    avgLLMScore: 0,
    evaluatedRate: 0,
    avgScoreDifference: 0,
    highDiscrepancyRate: 0,
    scoresOverTime: [],
    scoresByAssistant: [],
    scoresByClinic: [],
    sentimentDistribution: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetricsData = async () => {
      try {
        setLoading(true);

        // Fetch all calls with their scores and relationships
        const { data: calls } = await supabase.from("calls").select(`
            *,
            assistant:assistant_id(name),
            clinic:clinic_id(name)
          `);

        if (!calls) return;

        // Calculate basic metrics
        const totalCalls = calls.length;
        const evaluatedCalls = calls.filter((call) => call.evaluated);
        const callsWithBothScores = calls.filter(
          (call) => call.evaluation_score_human && call.evaluation_score_llm
        );

        // Calculate KPIs
        const successRate =
          calls.filter((call) => (call.evaluation_score_human || 0) >= 3)
            .length / totalCalls;
        const avgHumanScore =
          calls.reduce(
            (acc, call) => acc + (call.evaluation_score_human || 0),
            0
          ) / totalCalls;
        const avgLLMScore =
          calls.reduce(
            (acc, call) => acc + (call.evaluation_score_llm || 0),
            0
          ) / totalCalls;
        const evaluatedRate = evaluatedCalls.length / totalCalls;

        // Calculate discrepancy metrics
        const scoreDifferences = callsWithBothScores.map((call) =>
          Math.abs(
            (call.evaluation_score_human || 0) -
              (call.evaluation_score_llm || 0)
          )
        );
        const avgScoreDifference =
          scoreDifferences.reduce((acc, diff) => acc + diff, 0) /
          scoreDifferences.length;
        const highDiscrepancyRate =
          callsWithBothScores.filter(
            (call) =>
              Math.abs(
                (call.evaluation_score_human || 0) -
                  (call.evaluation_score_llm || 0)
              ) >= 2
          ).length / callsWithBothScores.length;

        // Process scores over time
        const scoresOverTime = Array.from(
          new Set(
            calls.map(
              (call) =>
                new Date(call.created_at || "").toISOString().split("T")[0]
            )
          )
        )
          .map((date) => {
            const daysCalls = calls.filter(
              (call) =>
                new Date(call.created_at || "").toISOString().split("T")[0] ===
                date
            );
            return {
              date,
              humanScore:
                daysCalls.reduce(
                  (acc, call) => acc + (call.evaluation_score_human || 0),
                  0
                ) / daysCalls.length,
              llmScore:
                daysCalls.reduce(
                  (acc, call) => acc + (call.evaluation_score_llm || 0),
                  0
                ) / daysCalls.length,
            };
          })
          .sort((a, b) => a.date.localeCompare(b.date));

        // Process scores by assistant
        const assistantScores = new Map<
          string,
          { total: number; count: number }
        >();
        calls.forEach((call) => {
          if (call.assistant?.name && call.evaluation_score_human) {
            const current = assistantScores.get(call.assistant.name) || {
              total: 0,
              count: 0,
            };
            assistantScores.set(call.assistant.name, {
              total: current.total + call.evaluation_score_human,
              count: current.count + 1,
            });
          }
        });
        const scoresByAssistant = Array.from(assistantScores.entries()).map(
          ([name, stats]) => ({
            name,
            avgScore: stats.total / stats.count,
          })
        );

        // Process scores by clinic
        const clinicScores = new Map<
          string,
          { total: number; count: number }
        >();
        calls.forEach((call) => {
          if (call.clinic?.name && call.evaluation_score_human) {
            const current = clinicScores.get(call.clinic.name) || {
              total: 0,
              count: 0,
            };
            clinicScores.set(call.clinic.name, {
              total: current.total + call.evaluation_score_human,
              count: current.count + 1,
            });
          }
        });
        const scoresByClinic = Array.from(clinicScores.entries()).map(
          ([name, stats]) => ({
            name,
            avgScore: stats.total / stats.count,
          })
        );

        // Process sentiment distribution (based on LLM scores)
        const sentimentCounts = calls.reduce((acc, call) => {
          let sentiment = "Neutral";
          const score = call.evaluation_score_llm;
          if (score !== null) {
            if (score >= 4) sentiment = "Positive";
            else if (score <= 2) sentiment = "Negative";
          }
          acc[sentiment] = (acc[sentiment] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const sentimentDistribution = Object.entries(sentimentCounts).map(
          ([name, value]) => ({
            name,
            value: value as number,
          })
        );

        setMetricsData({
          totalCalls,
          successRate,
          avgHumanScore,
          avgLLMScore,
          evaluatedRate,
          avgScoreDifference,
          highDiscrepancyRate,
          scoresOverTime,
          scoresByAssistant,
          scoresByClinic,
          sentimentDistribution,
        });
      } catch (error) {
        console.error("Error fetching metrics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetricsData();
  }, []);

  if (loading) {
    return <div>Loading metrics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsData.totalCalls}</div>
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
            <p className="text-xs text-muted-foreground">Score ≥ 3</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Human Score
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsData.avgHumanScore.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg LLM Score</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsData.avgLLMScore.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Evaluated Rate
            </CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metricsData.evaluatedRate * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discrepancy Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Score Difference
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsData.avgScoreDifference.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Between human and LLM
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              High Discrepancy Rate
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metricsData.highDiscrepancyRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Difference ≥ 2</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scores Over Time */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Average Scores Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metricsData.scoresOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="humanScore"
                    stroke="#8884d8"
                    name="Human Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="llmScore"
                    stroke="#82ca9d"
                    name="LLM Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Scores by Assistant */}
        <Card>
          <CardHeader>
            <CardTitle>Average Score by Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricsData.scoresByAssistant}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Scores by Clinic */}
        <Card>
          <CardHeader>
            <CardTitle>Average Score by Clinic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricsData.scoresByClinic}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Call Sentiment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metricsData.sentimentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {metricsData.sentimentDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

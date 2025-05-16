"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Phone,
  CheckCircle,
  AlertTriangle,
  Percent,
  Star,
  Bot,
  FileCheck,
  Calendar,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
};

type Clinic = {
  id: string;
  name: string;
};

type Assistant = {
  id: string;
  name: string;
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
  });
  const [loading, setLoading] = useState(true);

  // Filter states
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(
    null
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Load clinics and assistants
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const { data: clinicsData } = await supabase
          .from("clinics")
          .select("id, name")
          .order("name");

        setClinics(clinicsData || []);

        const { data: assistantsData } = await supabase
          .from("assistants")
          .select("id, name")
          .order("name");

        setAssistants(assistantsData || []);
      } catch (error) {
        console.error("Error loading filter options:", error);
      }
    };

    loadOptions();
  }, []);

  // Update assistants when clinic changes
  useEffect(() => {
    const loadAssistantsByClinic = async () => {
      if (!selectedClinic) {
        const { data } = await supabase
          .from("assistants")
          .select("id, name")
          .order("name");
        setAssistants(data || []);
        return;
      }

      const { data } = await supabase
        .from("assistants")
        .select("id, name")
        .eq("clinic_id", selectedClinic)
        .order("name");

      setAssistants(data || []);
    };

    loadAssistantsByClinic();
  }, [selectedClinic]);

  useEffect(() => {
    const fetchMetricsData = async () => {
      try {
        setLoading(true);

        // Build the query with filters
        let query = supabase.from("calls").select(`
            *,
            assistant:assistant_id(name),
            clinic:clinic_id(name)
          `);

        // Apply filters
        if (selectedClinic) {
          query = query.eq("clinic_id", selectedClinic);
        }
        if (selectedAssistant) {
          query = query.eq("assistant_id", selectedAssistant);
        }
        if (startDate) {
          query = query.gte("created_at", startDate);
        }
        if (endDate) {
          query = query.lte("created_at", endDate);
        }

        const { data: calls } = await query;

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
        console.log("scoresByClinic", scoresByClinic);

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
        });
      } catch (error) {
        console.error("Error fetching metrics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetricsData();
  }, [selectedClinic, selectedAssistant, startDate, endDate]);

  const handleReset = () => {
    setSelectedClinic(null);
    setSelectedAssistant(null);
    setStartDate("");
    setEndDate("");
  };

  if (loading) {
    return <div>Loading metrics...</div>;
  }

  return (
    <div className="space-y-6 w-full">
      {/* Filters */}
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Select
                  value={selectedClinic || "all"}
                  onValueChange={(value) =>
                    setSelectedClinic(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Clinic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clinics</SelectItem>
                    {clinics.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select
                  value={selectedAssistant || "all"}
                  onValueChange={(value) =>
                    setSelectedAssistant(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assistant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assistants</SelectItem>
                    {assistants.map((assistant) => (
                      <SelectItem key={assistant.id} value={assistant.id}>
                        {assistant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <span>-</span>
              <div className="relative flex-1">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <Button onClick={handleReset} variant="outline" className="w-20">
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <Tooltip formatter={(value: number) => value.toFixed(2)} />
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
                  <Tooltip formatter={(value: number) => value.toFixed(2)} />
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
                  <Tooltip formatter={(value: number) => value.toFixed(2)} />
                  <Bar dataKey="avgScore" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

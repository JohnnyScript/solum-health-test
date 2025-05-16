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
import { CallsFilter, FilterParams } from "@/components/calls-filter";

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
  const [currentFilters, setCurrentFilters] = useState<FilterParams>({});

  // Filter states
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);

  // Load clinics and assistants
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await fetch("/api/options");
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setClinics(data.clinics);
        setAssistants(data.assistants);
      } catch (error) {
        console.error("Error loading filter options:", error);
      }
    };

    loadOptions();
  }, []);

  // Update assistants when clinic changes
  useEffect(() => {
    const loadAssistantsByClinic = async () => {
      try {
        const url = new URL("/api/options", window.location.origin);
        if (currentFilters.clinic_id) {
          url.searchParams.set("clinicId", currentFilters.clinic_id);
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setAssistants(data.assistants);
      } catch (error) {
        console.error("Error loading assistants:", error);
      }
    };

    loadAssistantsByClinic();
  }, [currentFilters.clinic_id]);

  const handleFilter = async (filters: FilterParams) => {
    try {
      setLoading(true);
      setCurrentFilters(filters);
      const url = new URL("/api/metrics", window.location.origin);

      // Add filter params
      if (filters.clinic_id)
        url.searchParams.set("clinicId", filters.clinic_id);
      if (filters.assistant_id)
        url.searchParams.set("assistantId", filters.assistant_id);
      if (filters.start_date)
        url.searchParams.set("startDate", filters.start_date);
      if (filters.end_date) url.searchParams.set("endDate", filters.end_date);
      if (filters.search_query)
        url.searchParams.set("search", filters.search_query);

      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMetricsData(data);
    } catch (error) {
      console.error("Error loading metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    handleFilter({});
  }, []);

  if (loading) {
    return <div>Loading metrics...</div>;
  }

  console.log(metricsData.successRate);

  return (
    <div className="space-y-6 w-full">
      {/* Filters */}
      <CallsFilter onFilter={handleFilter} initialFilters={currentFilters} />

      {/* Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsData.totalCalls}</div>
          </CardContent>
        </Card>

        {/* <Card>
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
        </Card> */}

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

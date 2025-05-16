"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Phone, Clock, CheckCircle, AlertTriangle } from "lucide-react";

// Example data for metrics
const metricsData = {
  totalCalls: 1245,
  avgDuration: 180, // in seconds
  successRate: 0.78,
  discrepancyRate: 0.12,

  // Chart data
  callsByDay: [
    { date: "2024-05-01", count: 42 },
    { date: "2024-05-02", count: 38 },
    { date: "2024-05-03", count: 45 },
    { date: "2024-05-04", count: 32 },
    { date: "2024-05-05", count: 30 },
    { date: "2024-05-06", count: 48 },
    { date: "2024-05-07", count: 50 },
    { date: "2024-05-08", count: 47 },
    { date: "2024-05-09", count: 55 },
    { date: "2024-05-10", count: 60 },
  ],

  // Agent ranking data
  agentRanking: [
    { name: "Assistant 1", calls: 420, avgScore: 0.92 },
    { name: "Assistant 2", calls: 385, avgScore: 0.85 },
    { name: "Assistant 3", calls: 440, avgScore: 0.78 },
  ],

  // Clinic data
  clinicStats: [
    { name: "San Jose Clinic", calls: 520, avgScore: 0.88 },
    { name: "North Medical Center", calls: 425, avgScore: 0.82 },
    { name: "Central Hospital", calls: 300, avgScore: 0.75 },
  ],
};

export function DashboardMetrics() {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getScoreColor = (score: number) => {
    if (score > 0.8) return "default";
    if (score < 0.5) return "destructive";
    return "secondary";
  };

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
              +{metricsData.callsByDay[metricsData.callsByDay.length - 1].count}{" "}
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

      <Tabs defaultValue="agents">
        <TabsList>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="clinics">Clinics</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Calls</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metricsData.agentRanking.map((agent) => (
                    <TableRow key={agent.name}>
                      <TableCell className="font-medium">
                        {agent.name}
                      </TableCell>
                      <TableCell>{agent.calls}</TableCell>
                      <TableCell>
                        {(agent.avgScore * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Badge variant={getScoreColor(agent.avgScore)}>
                          {agent.avgScore > 0.8
                            ? "Excellent"
                            : agent.avgScore > 0.5
                            ? "Good"
                            : "Needs Improvement"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clinic Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clinic</TableHead>
                    <TableHead>Calls</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metricsData.clinicStats.map((clinic) => (
                    <TableRow key={clinic.name}>
                      <TableCell className="font-medium">
                        {clinic.name}
                      </TableCell>
                      <TableCell>{clinic.calls}</TableCell>
                      <TableCell>
                        {(clinic.avgScore * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Badge variant={getScoreColor(clinic.avgScore)}>
                          {clinic.avgScore > 0.8
                            ? "Excellent"
                            : clinic.avgScore > 0.5
                            ? "Good"
                            : "Needs Improvement"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

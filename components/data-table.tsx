"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type DataItem = {
  id: string;
  name: string;
  calls: number;
  avgScore: number;
};

interface DataTableProps {
  title: string;
  data: DataItem[];
  loading: boolean;
}

export function DataTable({ title, data, loading }: DataTableProps) {
  const getScoreColor = (score: number) => {
    if (score > 0.8) return "default";
    if (score < 0.5) return "destructive";
    return "secondary";
  };

  if (loading) {
    return <div>Loading {title.toLowerCase()}...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Calls</TableHead>
                <TableHead>Average Score</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.calls}</TableCell>
                  <TableCell>{(item.avgScore * 100).toFixed(1)}%</TableCell>
                  <TableCell>
                    <Badge variant={getScoreColor(item.avgScore)}>
                      {item.avgScore > 0.8
                        ? "Excellent"
                        : item.avgScore > 0.5
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
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";
import { useRouter } from "next/navigation";
type Call = {
  id: string;
  call_id: string;
  created_at: string;
  transcript: string;
  evaluation_score_human: number | null;
  evaluation_score_llm: number | null;
  assistant: {
    id: string;
    name: string;
  };
  clinic: {
    id: string;
    name: string;
  };
};

type Clinic = {
  id: string;
  name: string;
};

type Assistant = {
  id: string;
  name: string;
};

export function CallsTable() {
  // State for data
  const [calls, setCalls] = useState<Call[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCalls, setTotalCalls] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // State for filters and pagination
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(
    null
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const router = useRouter();
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
        console.error("Error loading options:", error);
      }
    };

    loadOptions();
  }, []);

  // Update assistants when clinic changes
  useEffect(() => {
    const loadAssistantsByClinic = async () => {
      try {
        const url = new URL("/api/options", window.location.origin);
        if (selectedClinic) {
          url.searchParams.set("clinicId", selectedClinic);
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
  }, [selectedClinic]);

  // Load calls data
  useEffect(() => {
    const loadCalls = async () => {
      try {
        setLoading(true);
        const url = new URL("/api/calls", window.location.origin);

        // Add pagination params
        url.searchParams.set("page", currentPage.toString());
        url.searchParams.set("pageSize", pageSize.toString());

        // Add filter params
        if (selectedClinic) url.searchParams.set("clinicId", selectedClinic);
        if (selectedAssistant)
          url.searchParams.set("assistantId", selectedAssistant);
        if (startDate)
          url.searchParams.set("startDate", startDate.toISOString());
        if (endDate) url.searchParams.set("endDate", endDate.toISOString());
        if (searchTerm) url.searchParams.set("search", searchTerm);

        // Add sorting params
        url.searchParams.set("sortBy", sortBy);
        url.searchParams.set("sortOrder", sortOrder);

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setCalls(data.calls);
        setTotalCalls(data.totalCalls);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error loading calls:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCalls();
  }, [
    currentPage,
    pageSize,
    selectedClinic,
    selectedAssistant,
    startDate,
    endDate,
    searchTerm,
    sortBy,
    sortOrder,
  ]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleReset = () => {
    setSelectedClinic(null);
    setSelectedAssistant(null);
    setStartDate(null);
    setEndDate(null);
    setSearchTerm("");
    setCurrentPage(1);
    setSortBy("created_at");
    setSortOrder("desc");
  };

  if (loading) {
    return <div>Loading calls...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Select
                  value={selectedClinic || undefined}
                  onValueChange={(value) => {
                    setSelectedClinic(value === "all" ? null : value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Clinic" />
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
                  value={selectedAssistant || undefined}
                  onValueChange={(value) => {
                    setSelectedAssistant(value === "all" ? null : value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Assistant" />
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

              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Start Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate || undefined}
                      onSelect={(date) => {
                        setStartDate(date || null);
                        setCurrentPage(1);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "End Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate || undefined}
                      onSelect={(date) => {
                        setEndDate(date || null);
                        setCurrentPage(1);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Search calls..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="max-w-sm"
              />
              <Button onClick={handleReset} variant="outline">
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("call_id")}
              >
                Call ID{" "}
                {sortBy === "call_id" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("created_at")}
              >
                Date{" "}
                {sortBy === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Clinic</TableHead>
              <TableHead>Assistant</TableHead>
              <TableHead>Human Score</TableHead>
              <TableHead>LLM Score</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.map((call) => (
              <TableRow key={call.id}>
                <TableCell>{call.call_id}</TableCell>
                <TableCell>
                  {format(new Date(call.created_at), "PPP")}
                </TableCell>
                <TableCell>{call.clinic.name}</TableCell>
                <TableCell>{call.assistant.name}</TableCell>
                <TableCell>{call.evaluation_score_human || "-"}</TableCell>
                <TableCell>{call.evaluation_score_llm || "-"}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      router.push(`/calls/${call.id}`);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {calls.length} of {totalCalls} calls
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

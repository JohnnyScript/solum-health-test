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
import { useRouter, useSearchParams } from "next/navigation";
import { CallsFilter, FilterParams } from "@/components/calls-filter";

type Call = {
  id: string;
  call_id: string;
  call_start_time: string;
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
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for data
  const [calls, setCalls] = useState<Call[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCalls, setTotalCalls] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<FilterParams>({});

  // State for pagination and sorting
  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get("page");
    return page ? parseInt(page) : 1;
  });
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState("call_start_time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Function to update URL with current state
  const updateURL = (page: number, filters: FilterParams) => {
    const url = new URL(window.location.href);

    // Update page parameter
    url.searchParams.set("page", page.toString());

    // Update filter parameters
    if (filters.clinic_id) url.searchParams.set("clinicId", filters.clinic_id);
    else url.searchParams.delete("clinicId");

    if (filters.assistant_id)
      url.searchParams.set("assistantId", filters.assistant_id);
    else url.searchParams.delete("assistantId");

    if (filters.start_date)
      url.searchParams.set("startDate", filters.start_date);
    else url.searchParams.delete("startDate");

    if (filters.end_date) url.searchParams.set("endDate", filters.end_date);
    else url.searchParams.delete("endDate");

    if (filters.search_query)
      url.searchParams.set("search", filters.search_query);
    else url.searchParams.delete("search");

    if (filters.evaluation_status && filters.evaluation_status !== "all")
      url.searchParams.set("evaluationStatus", filters.evaluation_status);
    else url.searchParams.delete("evaluationStatus");

    // Update sorting parameters
    url.searchParams.set("sortBy", sortBy);
    url.searchParams.set("sortOrder", sortOrder);

    router.push(url.toString());
  };

  // Load calls data
  const loadCalls = async (page: number, filters: FilterParams) => {
    try {
      setLoading(true);
      const url = new URL("/api/calls", window.location.origin);

      // Add pagination params
      url.searchParams.set("page", page.toString());
      url.searchParams.set("pageSize", pageSize.toString());

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
      if (filters.evaluation_status && filters.evaluation_status !== "all")
        url.searchParams.set("evaluationStatus", filters.evaluation_status);

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

      // Update URL after successful data load
      updateURL(page, filters);
    } catch (error) {
      console.error("Error loading calls:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (filters: FilterParams) => {
    setCurrentFilters(filters);
    const newPage = 1; // Reset to first page on filter change
    setCurrentPage(newPage);
    await loadCalls(newPage, filters);
  };

  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage);
    await loadCalls(newPage, currentFilters);
  };

  // Initial load
  useEffect(() => {
    const initialPage = parseInt(searchParams.get("page") || "1");
    setCurrentPage(initialPage);
    loadCalls(initialPage, currentFilters);
  }, [sortBy, sortOrder]);

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

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  if (loading) {
    return <div>Loading calls...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <CallsFilter onFilter={handleFilter} initialFilters={currentFilters} />

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
                onClick={() => handleSort("call_start_time")}
              >
                Date{" "}
                {sortBy === "call_start_time" &&
                  (sortOrder === "asc" ? "↑" : "↓")}
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
                  {format(new Date(call.call_start_time), "PPP")}
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
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-3">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

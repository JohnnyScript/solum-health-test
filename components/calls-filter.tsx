"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type FilterParams = {
  clinic_id?: string;
  assistant_id?: string;
  start_date?: string;
  end_date?: string;
  search_query?: string;
  evaluation_status?: "pending" | "evaluated" | "all";
};

type Clinic = {
  id: string;
  name: string;
};

type Assistant = {
  id: string;
  name: string;
};

interface CallsFilterProps {
  onFilter: (params: FilterParams) => void;
  initialFilters?: FilterParams;
  showStatusCallFilter?: boolean;
}

export function CallsFilter({
  onFilter,
  initialFilters = {},
  showStatusCallFilter = true,
}: CallsFilterProps) {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedClinic, setSelectedClinic] = useState<string | null>(
    initialFilters.clinic_id || null
  );
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(
    initialFilters.assistant_id || null
  );
  const [startDate, setStartDate] = useState<string>(
    initialFilters.start_date || ""
  );
  const [endDate, setEndDate] = useState<string>(initialFilters.end_date || "");
  const [searchQuery, setSearchQuery] = useState<string>(
    initialFilters.search_query || ""
  );
  const [evaluationStatus, setEvaluationStatus] = useState<
    "pending" | "evaluated" | "all"
  >(initialFilters.evaluation_status || "all");

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);

        const { data: clinicsData, error: clinicsError } = await supabase
          .from("clinics")
          .select("id, name")
          .order("name");

        if (clinicsError) throw clinicsError;
        setClinics(clinicsData || []);

        const { data: assistantsData, error: assistantsError } = await supabase
          .from("assistants")
          .select("id, name")
          .order("name");

        if (assistantsError) throw assistantsError;
        setAssistants(assistantsData || []);
      } catch (error) {
        console.error("Error loading filter options:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

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

  const handleFilter = () => {
    const filters: FilterParams = {
      ...(selectedClinic && { clinic_id: selectedClinic }),
      ...(selectedAssistant && { assistant_id: selectedAssistant }),
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
      // ...(searchQuery && { search_query: searchQuery }),
      ...(evaluationStatus !== "all" && {
        evaluation_status: evaluationStatus,
      }),
    };

    onFilter(filters);
  };

  const handleReset = () => {
    setSelectedClinic(null);
    setSelectedAssistant(null);
    setStartDate("");
    setEndDate("");
    // setSearchQuery("");
    setEvaluationStatus("all");
    onFilter({});
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Select
                value={selectedClinic || "all"}
                onValueChange={(value) =>
                  setSelectedClinic(value === "all" ? null : value)
                }
                disabled={loading}
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
                disabled={loading}
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

            {showStatusCallFilter && (
              <div>
                <Select
                  value={evaluationStatus}
                  onValueChange={(value: "pending" | "evaluated" | "all") =>
                    setEvaluationStatus(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Evaluation Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Calls</SelectItem>
                    <SelectItem value="pending">Pending Evaluation</SelectItem>
                    <SelectItem value="evaluated">Evaluated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 items-center">
            {/* <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID or number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div> */}
            <div className="flex gap-2 justify-end">
              <Button onClick={handleFilter} className="w-20">
                Filter
              </Button>
              <Button onClick={handleReset} variant="outline" className="w-20">
                Clear
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

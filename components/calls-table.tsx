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
import { Badge } from "@/components/ui/badge";
import { Eye, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { formatDuration, formatDate } from "@/lib/utils";
import { supabase, type Call } from "@/lib/supabase";
import { CallsFilter, type FilterParams } from "@/components/calls-filter";

const ITEMS_PER_PAGE = 10;

type SortField =
  | "call_start_time"
  | "assistant.name"
  | "clinic.name"
  | "duration"
  | "evaluation_score_human"
  | "evaluation_score_llm"
  | "agent_type";
type SortOrder = "asc" | "desc";

export function CallsTable() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("call_start_time");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filters, setFilters] = useState<FilterParams>({});

  const fetchCalls = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir la consulta base
      let query = supabase.from("calls").select(
        `
          *,
          clinic:clinics(name),
          assistant:assistants(name)
        `
      );

      // Aplicar filtros
      if (filters.clinic_id) {
        query = query.eq("clinic_id", filters.clinic_id);
      }
      if (filters.assistant_id) {
        query = query.eq("assistant_id", filters.assistant_id);
      }
      if (filters.start_date) {
        query = query.gte("call_start_time", filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte("call_start_time", filters.end_date);
      }
      if (filters.search_query) {
        query = query.or(
          `call_id.ilike.%${filters.search_query}%,phone_number.ilike.%${filters.search_query}%`
        );
      }

      // Obtener el conteo total con los filtros aplicados
      const countQuery = supabase
        .from("calls")
        .select("*", { count: "exact", head: true });

      // Aplicar los mismos filtros a la consulta de conteo
      if (filters.clinic_id) {
        countQuery.eq("clinic_id", filters.clinic_id);
      }
      if (filters.assistant_id) {
        countQuery.eq("assistant_id", filters.assistant_id);
      }
      if (filters.start_date) {
        countQuery.gte("call_start_time", filters.start_date);
      }
      if (filters.end_date) {
        countQuery.lte("call_start_time", filters.end_date);
      }
      if (filters.search_query) {
        countQuery.or(
          `call_id.ilike.%${filters.search_query}%,phone_number.ilike.%${filters.search_query}%`
        );
      }

      const { count } = await countQuery;
      setTotalCount(count || 0);

      // Obtener los datos paginados y ordenados
      const { data, error } = await query
        .order(sortField, { ascending: sortOrder === "asc" })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      setCalls(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, [page, sortField, sortOrder, filters]);

  const handleFilter = (newFilters: FilterParams) => {
    setPage(1); // Resetear la página al aplicar nuevos filtros
    setFilters(newFilters);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const getScoreColor = (score: number | null) => {
    if (!score) return "secondary";
    if (score > 80) return "default";
    if (score < 50) return "destructive";
    return "secondary";
  };

  const getEvaluationStatus = (call: Call) => {
    if (call.evaluation_score_human && call.evaluation_score_llm) {
      return {
        label: "Evaluado",
        color: "default" as const,
        textColor: "text-green-600",
      };
    }
    if (call.evaluation_score_human) {
      return {
        label: "En Proceso",
        color: "secondary" as const,
        textColor: "text-blue-600",
      };
    }
    return {
      label: "Pendiente",
      color: "destructive" as const,
      textColor: "text-red-600",
    };
  };

  const getCallTypeColor = (type: Call["agent_type"]) => {
    return type === "inbound" ? "default" : "secondary";
  };

  if (error) {
    return (
      <div className="rounded-md border p-4 text-red-600">Error: {error}</div>
    );
  }

  return (
    <div className="space-y-4">
      <CallsFilter onFilter={handleFilter} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("call_start_time")}
                  className="flex items-center gap-1"
                >
                  Fecha
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("assistant.name")}
                  className="flex items-center gap-1"
                >
                  Asistente
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("clinic.name")}
                  className="flex items-center gap-1"
                >
                  Clínica
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("agent_type")}
                  className="flex items-center gap-1"
                >
                  Tipo
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("duration")}
                  className="flex items-center gap-1"
                >
                  Duración
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("evaluation_score_human")}
                  className="flex items-center gap-1"
                >
                  Score QA
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("evaluation_score_llm")}
                  className="flex items-center gap-1"
                >
                  Score LLM
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : calls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No hay llamadas para mostrar
                </TableCell>
              </TableRow>
            ) : (
              calls.map((call) => (
                <TableRow key={call.id}>
                  <TableCell>
                    <div className="font-medium">
                      {call.call_start_time
                        ? formatDate(call.call_start_time)
                        : "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {call.call_start_time
                        ? new Date(call.call_start_time).toLocaleTimeString()
                        : ""}
                    </div>
                  </TableCell>
                  <TableCell>{call.assistant?.name || "N/A"}</TableCell>
                  <TableCell>{call.clinic?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={getCallTypeColor(call.agent_type)}>
                      {call.agent_type === "inbound" ? "Entrante" : "Saliente"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {call.duration ? formatDuration(call.duration) : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className={getEvaluationStatus(call).textColor}>
                      <Badge variant={getEvaluationStatus(call).color}>
                        {getEvaluationStatus(call).label}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {call.evaluation_score_human && (
                      <Badge
                        variant={getScoreColor(call.evaluation_score_human)}
                      >
                        {`${call.evaluation_score_human}%`}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {call.evaluation_score_llm && (
                      <Badge variant={getScoreColor(call.evaluation_score_llm)}>
                        {`${call.evaluation_score_llm}%`}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <a href={`/calls/${call.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver detalles</span>
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {calls.length} de {totalCount} llamadas
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

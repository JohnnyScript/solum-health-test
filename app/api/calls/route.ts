import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get pagination params
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // Get filter params
    const clinicId = searchParams.get("clinicId");
    const assistantId = searchParams.get("assistantId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const searchTerm = searchParams.get("search");
    const evaluationStatus = searchParams.get("evaluationStatus");
    const sortBy = searchParams.get("sortBy") || "call_start_time";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // Build base query
    let query = supabase.from("calls").select(
      `
        *,
        assistant:assistant_id(id, name),
        clinic:clinic_id(id, name)
      `,
      { count: "exact" }
    );

    // Apply filters
    if (clinicId) {
      query = query.eq("clinic_id", clinicId);
    }
    if (assistantId) {
      query = query.eq("assistant_id", assistantId);
    }
    if (startDate) {
      query = query.gte("call_start_time", startDate);
    }
    if (endDate) {
      query = query.lte("call_start_time", endDate);
    }
    if (searchTerm) {
      query = query.or(`
        transcript.ilike.%${searchTerm}%,
        call_id.ilike.%${searchTerm}%,
        assistant.name.ilike.%${searchTerm}%,
        clinic.name.ilike.%${searchTerm}%
      `);
    }
    if (evaluationStatus === "pending") {
      query = query.is("evaluation_score_human", null);
    } else if (evaluationStatus === "evaluated") {
      query = query.not("evaluation_score_human", "is", null);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Execute query
    const { data: calls, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      calls: calls || [],
      totalCalls: count || 0,
      page,
      pageSize,
      totalPages: count ? Math.ceil(count / pageSize) : 0,
    });
  } catch (error) {
    console.error("Error fetching calls:", error);
    return NextResponse.json(
      { error: "Failed to fetch calls" },
      { status: 500 }
    );
  }
}

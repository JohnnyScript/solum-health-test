import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");
    const assistantId = searchParams.get("assistantId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build the query with filters
    let query = supabase.from("calls").select(`
      *,
      assistant:assistant_id(name),
      clinic:clinic_id(name)
    `);

    // Apply filters
    if (clinicId) {
      query = query.eq("clinic_id", clinicId);
    }
    if (assistantId) {
      query = query.eq("assistant_id", assistantId);
    }
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data: calls, error } = await query;

    if (error) {
      throw error;
    }

    if (!calls || calls.length === 0) {
      return NextResponse.json({
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
    }

    // Calculate basic metrics
    const totalCalls = calls.length;
    const evaluatedCalls = calls.filter((call) => call.evaluated);
    const callsWithBothScores = calls.filter(
      (call) => call.evaluation_score_human && call.evaluation_score_llm
    );

    // Calculate KPIs
    const successRate =
      calls.filter((call) => (call.evaluation_score_human || 0) >= 3).length /
      totalCalls;
    const avgHumanScore =
      calls.reduce((acc, call) => acc + (call.evaluation_score_human || 0), 0) /
      totalCalls;
    const avgLLMScore =
      calls.reduce((acc, call) => acc + (call.evaluation_score_llm || 0), 0) /
      totalCalls;
    const evaluatedRate = evaluatedCalls.length / totalCalls;

    // Calculate discrepancy metrics
    const scoreDifferences = callsWithBothScores.map((call) =>
      Math.abs(
        (call.evaluation_score_human || 0) - (call.evaluation_score_llm || 0)
      )
    );
    const avgScoreDifference =
      scoreDifferences.length > 0
        ? scoreDifferences.reduce((acc, diff) => acc + diff, 0) /
          scoreDifferences.length
        : 0;
    const highDiscrepancyRate =
      callsWithBothScores.length > 0
        ? callsWithBothScores.filter(
            (call) =>
              Math.abs(
                (call.evaluation_score_human || 0) -
                  (call.evaluation_score_llm || 0)
              ) >= 2
          ).length / callsWithBothScores.length
        : 0;

    // Process scores over time
    const scoresOverTime = Array.from(
      new Set(
        calls.map(
          (call) => new Date(call.created_at || "").toISOString().split("T")[0]
        )
      )
    )
      .map((date) => {
        const daysCalls = calls.filter(
          (call) =>
            new Date(call.created_at || "").toISOString().split("T")[0] === date
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
    const assistantScores = new Map<string, { total: number; count: number }>();
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
    const clinicScores = new Map<string, { total: number; count: number }>();
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

    return NextResponse.json({
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
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}

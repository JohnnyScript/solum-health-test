import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");

    // Fetch clinics
    const { data: clinics, error: clinicsError } = await supabase
      .from("clinics")
      .select("id, name")
      .order("name");

    if (clinicsError) {
      throw clinicsError;
    }

    // Fetch assistants
    let assistantsQuery = supabase
      .from("assistants")
      .select("id, name")
      .order("name");

    if (clinicId) {
      assistantsQuery = assistantsQuery.eq("clinic_id", clinicId);
    }

    const { data: assistants, error: assistantsError } = await assistantsQuery;

    if (assistantsError) {
      throw assistantsError;
    }

    return NextResponse.json({
      clinics: clinics || [],
      assistants: assistants || [],
    });
  } catch (error) {
    console.error("Error fetching options:", error);
    return NextResponse.json(
      { error: "Failed to fetch options" },
      { status: 500 }
    );
  }
}

import { createClient } from "@supabase/supabase-js";

// Ensure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// in your .env.local file or environment variables.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Clinic = {
  id: string;
  name: string;
};

export type Assistant = {
  id: string;
  name: string;
  clinic_id: string;
};

export type Call = {
  id: string;
  clinic_id: string;
  call_id: string;
  agent_type: "inbound" | "outbound";
  audio_url: string | null;
  duration: number | null;
  call_reason: string | null;
  summary: string | null;
  call_ended_time: string | null;
  evaluated: boolean;
  qa_check: boolean;
  reviewer: string | null;
  comments_engineer: string | null;
  evaluation_score_human: number | null;
  evaluation_comment_human: string | null;
  evaluation_score_llm: number | null;
  evaluation_comment_llm: string | null;
  call_start_time: string;
  call_start_time: string | null;
  // Relaciones
  clinic?: Clinic;
  assistant?: Assistant;
};

import { CallDetails } from "@/components/call-details";
import { CallEvaluation } from "@/components/call-evaluation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Call } from "@/app/interface/call.interface";

async function getCallData(id: string): Promise<Call | null> {
  const { data: call, error } = await supabase
    .from("calls")
    .select(
      `
      *,
      clinic:clinic_id (
        id,
        name
      ),
      assistant:assistant_id (
        id,
        name
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching call:", error);
    return null;
  }

  return call;
}

export default async function CallPage({ params }: { params: { id: string } }) {
  const call = await getCallData(params.id);

  if (!call) {
    notFound();
  }

  // Transform the data to match the expected format for the components
  const transformedCall = {
    id: call.id,
    date: new Date(
      call.call_start_time || call.created_at
    ).toLocaleDateString(),
    time: new Date(
      call.call_start_time || call.created_at
    ).toLocaleTimeString(),
    assistant: call.assistant?.name || "Unknown",
    clinic: call.clinic?.name || "Unknown",
    duration: call.duration || 0,
    outcome: call.call_reason || "Unknown",
    outcome_score: 0, // This field might need to be added to the schema if needed
    audioUrl: call.audio_url || "",
    summary: call.summary || "No summary available",
    humanEvaluation: {
      score: call.evaluation_score_human || 0,
      comments: call.evaluation_comment_human || "",
    },
    comments_engineer: call.comments_engineer || "",
    llmEvaluation: {
      score: call.evaluation_score_llm || 0,
      comments: call.evaluation_comment_llm || "",
    },
  };

  console.log(transformedCall);
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/calls">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Call Details: {params.id}</h1>
        </div>
      </div>

      <CallDetails call={transformedCall} />

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Call Summary</h2>
          <p className="text-gray-700">{transformedCall.summary}</p>
        </CardContent>
      </Card>

      <CallEvaluation
        callId={call.id}
        humanEvaluation={transformedCall.humanEvaluation}
        llmEvaluation={transformedCall.llmEvaluation}
        comments_engineer={transformedCall.comments_engineer}
      />
    </div>
  );
}

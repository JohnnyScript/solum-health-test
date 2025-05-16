import { CallDetails } from "@/components/call-details";
import { CallEvaluation } from "@/components/call-evaluation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Example data for a specific call
const callData = {
  id: "CALL-001",
  date: "2024-05-10",
  time: "09:15",
  assistant: "Assistant 1",
  clinic: "San Jose Clinic",
  duration: 185,
  outcome: "Appointment scheduled",
  outcome_score: 0.92,
  audioUrl: "/sample-audio.mp3",
  summary:
    "The patient called to schedule an appointment with Dr. Garcia. Availability was verified and scheduled for May 15th at 10:00 am. The patient was reminded to arrive 15 minutes early and bring their ID and insurance card.",
  humanEvaluation: {
    protocol: {
      score: 0.9,
      explanation:
        "The assistant correctly followed the greeting protocol, identity verification, and farewell.",
    },
    sentiment: {
      label: "Positive",
      explanation:
        "The tone was friendly and professional throughout the call.",
    },
    comments: "Excellent call handling. The assistant was clear and concise.",
  },
  llmEvaluation: {
    protocol: {
      score: 0.85,
      explanation:
        "The protocol was followed correctly, although there was a slight delay in identity verification.",
    },
    sentiment: {
      label: "Positive",
      explanation: "Friendly and helpful tone throughout the interaction.",
    },
    comments:
      "Good interaction, with opportunities for improvement in verification efficiency.",
  },
};

export default function CallPage({ params }: { params: { id: string } }) {
  // In a real implementation, the call would be looked up by ID
  const call = callData;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/calls">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Call Details: {params.id}</h1>
        </div>
        <Button>Save Evaluation</Button>
      </div>

      <CallDetails call={call} />

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Call Summary</h2>
          <p className="text-gray-700">{call.summary}</p>
        </CardContent>
      </Card>

      <CallEvaluation
        humanEvaluation={call.humanEvaluation}
        llmEvaluation={call.llmEvaluation}
      />
    </div>
  );
}

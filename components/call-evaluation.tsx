"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getScoreColor, isDifferenceSignificant } from "@/lib/utils";
import { useState } from "react";
import { updateCallEvaluation } from "@/app/actions/calls";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EvaluationData {
  score: number;

  comments: string;
}

interface CallEvaluationProps {
  callId: string;
  humanEvaluation: EvaluationData;
  llmEvaluation: EvaluationData;
  comments_engineer: string;
}

export function CallEvaluation({
  callId,
  humanEvaluation,
  llmEvaluation,
  comments_engineer,
}: CallEvaluationProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [comments, setComments] = useState(humanEvaluation.comments);
  const [humanScore, setHumanScore] = useState(humanEvaluation.score);
  const [comments_engineer_text, setCommentsEngineerText] = useState(
    comments_engineer || ""
  );
  const formatScore = (score: number) => {
    return Math.round(score).toFixed(0) + "%";
  };

  const hasSignificantDifference = isDifferenceSignificant(
    humanEvaluation.score,
    llmEvaluation.score
  );

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      const result = await updateCallEvaluation({
        id: callId,
        evaluation_score_human: humanScore,
        evaluation_comment_human: comments,
        comments_engineer: comments_engineer_text,
      });

      if (result.success) {
        toast.success("Evaluation saved successfully");
        router.refresh();
      } else {
        throw new Error("Failed to save evaluation");
      }
    } catch (error) {
      console.error("Error saving evaluation:", error);
      toast.error("Failed to save evaluation");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Call Evaluation</h2>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Evaluation"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Human Evaluation</h3>

            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Protocol Score</p>
                <p className={`text-sm font-bold ${getScoreColor(humanScore)}`}>
                  {formatScore(humanScore)}
                </p>
              </div>
              <Slider
                value={[humanScore]}
                onValueChange={(value) => setHumanScore(value[0])}
                max={100}
                step={1}
                className="my-4"
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Comments</p>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add comments..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">LLM Evaluation</h3>

            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Protocol</p>
                <p
                  className={`text-sm font-bold ${getScoreColor(
                    llmEvaluation.score
                  )}`}
                >
                  {formatScore(llmEvaluation.score)}
                </p>
              </div>
            </div>

            {/* <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Sentiment</p>
                <p className="text-sm font-medium">
                  {llmEvaluation.sentiment.label}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {llmEvaluation.sentiment.explanation}
              </p>
            </div> */}

            <div>
              <p className="text-sm font-medium mb-1">Comments</p>
              <p className="text-sm text-muted-foreground">
                {llmEvaluation.comments}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-md">
          <p className="text-sm font-medium mb-1">Engineer Comments</p>
          <Textarea
            value={comments_engineer_text}
            onChange={(e) => setCommentsEngineerText(e.target.value)}
            placeholder="Add comments..."
            className="min-h-[100px]"
          />
        </div>

        {hasSignificantDifference && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ There is a significant difference between human and LLM
              evaluation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

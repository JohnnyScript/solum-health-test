"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export type UpdateCallEvaluationData = {
  id: string;
  evaluation_score_human: number;
  evaluation_comment_human: string;
  comments_engineer: string;
};

export async function updateCallEvaluation(data: UpdateCallEvaluationData) {
  try {
    const { error } = await supabase
      .from("calls")
      .update({
        evaluation_score_human: data.evaluation_score_human,
        evaluation_comment_human: data.evaluation_comment_human,
        comments_engineer: data.comments_engineer,
        evaluated: true,
      })
      .eq("id", data.id);

    if (error) throw error;

    // Revalidate the calls page and the specific call page
    revalidatePath("/calls");
    revalidatePath(`/calls/${data.id}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating call evaluation:", error);
    return { success: false, error };
  }
}

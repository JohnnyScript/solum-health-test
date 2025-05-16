export interface Call {
  id: string;
  call_start_time: string;
  call_end_time: string;
  assistant: {
    id: string;
    name: string;
  };
  clinic: {
    id: string;
    name: string;
  };
  call_reason: string;
  reviewer?: string;
  comments_engineer?: string;
  evaluation_score_human?: number;
  evaluation_comment_human?: string;
  evaluation_score_llm?: number;
  evaluation_comment_llm?: string;
  audio_url?: string;
  summary?: string;
  created_at: string;
  duration: number;
}

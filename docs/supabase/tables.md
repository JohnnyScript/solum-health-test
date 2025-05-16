# Tables supabase

### calls

```SQL
(
    id uuid not null default gen_random_uuid (),
    clinic_id uuid not null, // related to clinics table
    call_id text null,
    agent_type text null,
    audio_url text null,
    duration integer null,
    call_reason text null,
    summary text null,
    assistant_id uuid null,
    call_ended_time timestamp with time zone null,
    evaluated boolean null default false,
    qa_check boolean null default false,
    reviewer text null,
    comments_engineer text null,
    evaluation_score_human integer null,
    evaluation_comment_human text null,
    evaluation_score_llm integer null,
    evaluation_comment_llm text null,
    created_at timestamp with time zone null default now(),
    call_start_time timestamp without time zone null,
    constraint calls_pkey primary key (id),
    constraint calls_agent_type_check check (
      (
        agent_type = any (array['inbound'::text, 'outbound'::text])
      )
    )
  )
```

### clinics

```SQL
(
    id uuid not null default gen_random_uuid (),
    name text not null,
  )
```

### assistant

```SQL
(
    id uuid not null default gen_random_uuid (),
    name text not null,
    clinic_id uuid not null, // related to clinics table
  )
```

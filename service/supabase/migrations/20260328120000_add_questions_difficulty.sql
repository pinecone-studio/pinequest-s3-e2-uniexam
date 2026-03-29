-- Run on Supabase (SQL editor or CLI) so manual exam questions can store difficulty.
alter table public.questions
  add column if not exists difficulty text;

comment on column public.questions.difficulty is 'easy | medium | hard (manual / multiple-choice builder)';

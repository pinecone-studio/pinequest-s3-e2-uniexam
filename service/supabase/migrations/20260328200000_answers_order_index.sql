alter table public.answers
  add column if not exists order_index int not null default 0;

comment on column public.answers.order_index is '0-based display order for multiple-choice options';

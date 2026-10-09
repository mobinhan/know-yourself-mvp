-- Prevent clients from forging deterministic chart artifacts, AI outputs, or transit calculations.
revoke insert, update on public.ky_charts from authenticated;
grant select, delete on public.ky_charts to authenticated;
revoke update, delete on public.ky_conversation_turns from authenticated;
grant select, insert on public.ky_conversation_turns to authenticated;
revoke insert, update on public.ky_saved_insights from authenticated;
grant select, delete on public.ky_saved_insights to authenticated;
revoke insert, update on public.ky_transit_snapshots from authenticated;
grant select, delete on public.ky_transit_snapshots to authenticated;

alter table public.ky_user_memories
  drop constraint if exists ky_user_memories_source_turn_fkey;
alter table public.ky_user_memories alter column source_turn_id set not null;
alter table public.ky_user_memories
  add constraint ky_user_memories_source_turn_fkey
  foreign key (user_id, source_turn_id) references public.ky_conversation_turns(user_id, id)
  on delete cascade;

create or replace function public.ky_guard_client_turn_insert()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if (select auth.uid()) is not null then
    if new.user_id <> (select auth.uid()) then
      raise exception 'turn_owner_mismatch' using errcode = '42501';
    end if;
    if new.role <> 'user' then
      raise exception 'client_may_only_append_user_turns' using errcode = '42501';
    end if;
    if new.answer is not null
       or new.factual_basis <> '[]'::jsonb
       or new.knowledge_basis <> '[]'::jsonb
       or new.relationship_basis <> '[]'::jsonb
       or new.critic_result is not null then
      raise exception 'client_cannot_supply_assistant_evidence' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists ky_guard_client_turn_insert_trigger on public.ky_conversation_turns;
create trigger ky_guard_client_turn_insert_trigger
before insert on public.ky_conversation_turns
for each row execute function public.ky_guard_client_turn_insert();

create or replace function public.ky_append_user_turn(p_conversation_id uuid, p_question text)
returns public.ky_conversation_turns
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_next_sequence integer;
  v_turn public.ky_conversation_turns;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;
  if p_question is null or length(trim(p_question)) < 1 or length(p_question) > 12000 then
    raise exception 'invalid_question_length' using errcode = '22023';
  end if;
  perform 1
  from public.ky_conversations c
  where c.id = p_conversation_id and c.user_id = v_user_id and c.status = 'active'
  for update;
  if not found then
    raise exception 'conversation_not_found_or_inactive' using errcode = 'P0002';
  end if;
  select coalesce(max(t.sequence_number), 0) + 1 into v_next_sequence
  from public.ky_conversation_turns t
  where t.user_id = v_user_id and t.conversation_id = p_conversation_id;
  insert into public.ky_conversation_turns
    (user_id, conversation_id, sequence_number, role, question)
  values (v_user_id, p_conversation_id, v_next_sequence, 'user', trim(p_question))
  returning * into v_turn;
  update public.ky_conversations set updated_at = now()
  where id = p_conversation_id and user_id = v_user_id;
  return v_turn;
end;
$$;

revoke all on function public.ky_append_user_turn(uuid, text) from public, anon;
grant execute on function public.ky_append_user_turn(uuid, text) to authenticated;

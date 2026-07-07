-- Run this in Supabase SQL Editor.
-- Normalizes stage pump codes and keeps only valid pressure/efficiency combinations.

begin;

-- Temporarily drop foreign keys so pump codes can be renamed consistently.
alter table public.efficiency
  drop constraint if exists efficiency_pump_code_fkey;

alter table public.rpm_formula
  drop constraint if exists rpm_formula_pump_code_fkey;

-- Normalize single-stage pump codes. These are 6 bar only.
update public.pump_limits
set pump_code = case
  when pump_code in ('7032', '7052', '7082', '7112', '50L', '350L') then pump_code || '.1'
  else pump_code
end
where pump_code in ('7032', '7052', '7082', '7112', '50L', '350L');

update public.rpm_formula
set pump_code = case
  when pump_code in ('7032', '7052', '7082', '7112', '50L', '350L') then pump_code || '.1'
  else pump_code
end
where pump_code in ('7032', '7052', '7082', '7112', '50L', '350L');

update public.efficiency
set pump_code = case
  when pump_code in ('7032', '7052', '7082', '7112', '50L', '350L') then pump_code || '.1'
  else pump_code
end
where pump_code in ('7032', '7052', '7082', '7112', '50L', '350L');

-- Keep only selectable pressure levels globally.
delete from public.efficiency
where pressure_bar not in (6, 12, 24);

-- Keep only the pressure level allowed by pump stage suffix.
delete from public.efficiency
where (pump_code like '%.1' and pressure_bar <> 6)
   or (pump_code like '%.2' and pressure_bar <> 12)
   or (pump_code like '%.4' and pressure_bar <> 24);

-- These single-stage pumps use the first available abrasion/viscosity section.
update public.pump_limits
set section_number = 15
where pump_code in ('7032.1', '7052.1', '7082.1', '7112.1');

-- Recreate relations after all affected tables use the new codes.
alter table public.efficiency
  add constraint efficiency_pump_code_fkey
  foreign key (pump_code)
  references public.pump_limits(pump_code)
  on update cascade
  on delete cascade;

alter table public.rpm_formula
  add constraint rpm_formula_pump_code_fkey
  foreign key (pump_code)
  references public.pump_limits(pump_code)
  on update cascade
  on delete cascade;

-- Keep the custom display order after code rename.
with desired_order(pump_code, sort_order) as (
  values
    ('12.1', 1),
    ('12.2', 2),
    ('25.1', 3),
    ('25.2', 4),
    ('50.1', 5),
    ('50.2', 6),
    ('50L.1', 7),
    ('80.1', 8),
    ('80.2', 9),
    ('200.1', 10),
    ('200.2', 11),
    ('300.1', 12),
    ('300.2', 13),
    ('350.1', 14),
    ('350.2', 15),
    ('350L.1', 16),
    ('7032.1', 17),
    ('7052.1', 18),
    ('7082.1', 19),
    ('7112.1', 20),
    ('7115.1', 21),
    ('7115.2', 22),
    ('7115.4', 23),
    ('7120.1', 24),
    ('7120.2', 25),
    ('7120.4', 26)
)
update public.pump_limits pl
set sort_order = desired_order.sort_order
from desired_order
where pl.pump_code = desired_order.pump_code;

with desired_order(pump_code, sort_order) as (
  values
    ('12.1', 1), ('12.2', 2), ('25.1', 3), ('25.2', 4), ('50.1', 5), ('50.2', 6),
    ('50L.1', 7), ('80.1', 8), ('80.2', 9), ('200.1', 10), ('200.2', 11),
    ('300.1', 12), ('300.2', 13), ('350.1', 14), ('350.2', 15), ('350L.1', 16),
    ('7032.1', 17), ('7052.1', 18), ('7082.1', 19), ('7112.1', 20),
    ('7115.1', 21), ('7115.2', 22), ('7115.4', 23), ('7120.1', 24), ('7120.2', 25), ('7120.4', 26)
)
update public.efficiency ef
set sort_order = desired_order.sort_order
from desired_order
where ef.pump_code = desired_order.pump_code;

with desired_order(pump_code, sort_order) as (
  values
    ('12.1', 1), ('12.2', 2), ('25.1', 3), ('25.2', 4), ('50.1', 5), ('50.2', 6),
    ('50L.1', 7), ('80.1', 8), ('80.2', 9), ('200.1', 10), ('200.2', 11),
    ('300.1', 12), ('300.2', 13), ('350.1', 14), ('350.2', 15), ('350L.1', 16),
    ('7032.1', 17), ('7052.1', 18), ('7082.1', 19), ('7112.1', 20),
    ('7115.1', 21), ('7115.2', 22), ('7115.4', 23), ('7120.1', 24), ('7120.2', 25), ('7120.4', 26)
)
update public.rpm_formula rf
set sort_order = desired_order.sort_order
from desired_order
where rf.pump_code = desired_order.pump_code;

commit;

notify pgrst, 'reload schema';

-- Diagnostic: this should return no rows. If it returns rows, those pumps still miss calculation data.
select
  pl.pump_code,
  pl.section_number,
  case when rf.pump_code is null then 'missing rpm_formula' else 'ok' end as rpm_formula_status,
  case when ef.pump_code is null then 'missing 6 bar efficiency' else 'ok' end as efficiency_status,
  case when av.section is null then 'missing abb_vis section' else 'ok' end as abb_vis_status
from public.pump_limits pl
left join public.rpm_formula rf on rf.pump_code = pl.pump_code
left join public.efficiency ef on ef.pump_code = pl.pump_code and ef.pressure_bar = 6
left join public.abb_vis av on av.section = pl.section_number
where pl.pump_code in ('50L.1', '350L.1', '7032.1', '7052.1', '7082.1', '7112.1')
  and (rf.pump_code is null or ef.pump_code is null or av.section is null);

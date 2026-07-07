-- Run this in Supabase SQL Editor before/after the RPC function update.
-- Keeps only the selected pressure levels and normalizes single-stage pump codes.

begin;

-- Keep only selectable pressure levels in efficiency.
delete from public.efficiency
where pressure_bar not in (6, 12, 24);

-- Temporarily drop foreign keys so pump codes can be renamed consistently.
alter table public.efficiency
drop constraint if exists efficiency_pump_code_fkey;

alter table public.rpm_formula
drop constraint if exists rpm_formula_pump_code_fkey;

-- Rename single-stage pumps to explicit 6-bar stage codes.
update public.pump_limits
set pump_code = pump_code || '.1'
where pump_code in ('7032', '7052', '7082', '7112');

update public.rpm_formula
set pump_code = pump_code || '.1'
where pump_code in ('7032', '7052', '7082', '7112');

update public.efficiency
set pump_code = pump_code || '.1'
where pump_code in ('7032', '7052', '7082', '7112');

-- Recreate the relation after all affected tables use the new codes.
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

-- Single-stage pumps work at 6 bar only.
delete from public.efficiency
where pump_code in ('7032.1', '7052.1', '7082.1', '7112.1')
  and pressure_bar <> 6;

-- Keep the custom display order after the code rename.
with desired_order(pump_code, sort_order) as (
  values
    ('12.1', 1),
    ('12.2', 2),
    ('25.1', 3),
    ('25.2', 4),
    ('50.1', 5),
    ('50.2', 6),
    ('50L', 7),
    ('80.1', 8),
    ('80.2', 9),
    ('200.1', 10),
    ('200.2', 11),
    ('300.1', 12),
    ('300.2', 13),
    ('350.1', 14),
    ('350.2', 15),
    ('350L', 16),
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
    ('50L', 7), ('80.1', 8), ('80.2', 9), ('200.1', 10), ('200.2', 11),
    ('300.1', 12), ('300.2', 13), ('350.1', 14), ('350.2', 15), ('350L', 16),
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
    ('50L', 7), ('80.1', 8), ('80.2', 9), ('200.1', 10), ('200.2', 11),
    ('300.1', 12), ('300.2', 13), ('350.1', 14), ('350.2', 15), ('350L', 16),
    ('7032.1', 17), ('7052.1', 18), ('7082.1', 19), ('7112.1', 20),
    ('7115.1', 21), ('7115.2', 22), ('7115.4', 23), ('7120.1', 24), ('7120.2', 25), ('7120.4', 26)
)
update public.rpm_formula rf
set sort_order = desired_order.sort_order
from desired_order
where rf.pump_code = desired_order.pump_code;

commit;

notify pgrst, 'reload schema';

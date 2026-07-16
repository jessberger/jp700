-- Run this in Supabase SQL Editor.
-- It lets every active authenticated user calculate pump results without opening dataset tables to non_viewer users.

drop function if exists public.calculate_pump_results(numeric, integer, text, integer, integer);

create or replace function public.calculate_pump_results(
  flow_lmin numeric,
  pressure_bar integer,
  orientation text,
  abrasivity_group integer,
  viscosity_group integer
)
returns table (
  pump_code text,
  is_selectable boolean,
  required_rpm numeric,
  rpm_abrasivity numeric,
  rpm_viscosity numeric,
  maximum_rpm numeric,
  maximum_source text,
  maximum_percent integer,
  matches_pressure_stage boolean,
  rpm_interval text,
  is_in_rpm_range boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  p_flow_lmin numeric := calculate_pump_results.flow_lmin;
  p_pressure_bar integer := calculate_pump_results.pressure_bar;
  p_orientation text := calculate_pump_results.orientation;
  p_abrasivity_group integer := calculate_pump_results.abrasivity_group;
  p_viscosity_group integer := calculate_pump_results.viscosity_group;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from public.profiles pr
    where pr.id = auth.uid()
      and coalesce(pr.is_active, true) = true
  ) then
    raise exception 'User is not active';
  end if;

  if p_abrasivity_group not between 1 and 4 or p_viscosity_group not between 1 and 4 then
    raise exception 'Invalid abrasivity or viscosity group';
  end if;

  return query
  with base as (
    select
      pl.pump_code::text as calc_pump_code,
      coalesce(pl.sort_order, 999999) as calc_sort_order,
      pl.rpm_interval::text as calc_rpm_interval,
      nullif(split_part(pl.rpm_interval, '-', 1), '')::numeric as calc_rpm_min,
      nullif(split_part(pl.rpm_interval, '-', 2), '')::numeric as calc_rpm_max,
      case
        when p_pressure_bar = 6 then pl.pump_code::text like '%.1'
        when p_pressure_bar = 12 then pl.pump_code::text like '%.2'
        when p_pressure_bar = 24 then pl.pump_code::text like '%.4'
        else false
      end as calc_matches_pressure_stage,
      case
        when lower(coalesce(p_orientation, '')) = 'vertical'
          then lower(coalesce(pl.installation, '')) like '%vertikal%'
            or lower(coalesce(pl.installation, '')) like '%vertical%'
        else lower(coalesce(pl.installation, '')) like '%horizontal%'
      end as calc_is_selectable,
      case p_abrasivity_group
        when 1 then av.abr_1
        when 2 then av.abr_2
        when 3 then av.abr_3
        when 4 then av.abr_4
      end::numeric as calc_rpm_abrasivity,
      case p_viscosity_group
        when 1 then av.vis_1
        when 2 then av.vis_2
        when 3 then av.vis_3
        when 4 then av.vis_4
      end::numeric as calc_rpm_viscosity,
      (
        p_flow_lmin
        / nullif((rf.constant * rf.eccentricity * rf.rotor_diameter * rf.stator_pitch * ef.efficiency), 0)
        / 1000
      )::numeric as calc_required_rpm
    from public.pump_limits pl
    left join public.rpm_formula rf on rf.pump_code = pl.pump_code
    left join public.efficiency ef
      on ef.pump_code = pl.pump_code
      and ef.pressure_bar = case
        when pl.pump_code::text like '%.1' then 6
        when pl.pump_code::text like '%.2' then 12
        when pl.pump_code::text like '%.4' then 24
        else p_pressure_bar
      end
    left join public.abb_vis av on av.section = pl.section_number
  ), max_base as (
    select
      b.*,
      case
        when b.calc_rpm_abrasivity is null or b.calc_rpm_viscosity is null then null
        when b.calc_rpm_abrasivity <= b.calc_rpm_viscosity then b.calc_rpm_abrasivity
        else b.calc_rpm_viscosity
      end as calc_max_source_value,
      case
        when b.calc_rpm_abrasivity is null or b.calc_rpm_viscosity is null then null
        when b.calc_rpm_abrasivity <= b.calc_rpm_viscosity then 'Abr'
        else 'Vis'
      end as calc_max_source
    from base b
  ), percent_base as (
    select
      mb.*,
      case
        when mb.calc_max_source_value is null then null
        when mb.calc_max_source_value <= 100 then 50
        when mb.calc_max_source_value <= 250 then 30
        when mb.calc_max_source_value <= 500 then 20
        when mb.calc_max_source_value <= 1000 then 10
        else 5
      end as calc_max_percent
    from max_base mb
  )
  select
    pb.calc_pump_code as pump_code,
    pb.calc_is_selectable as is_selectable,
    pb.calc_required_rpm as required_rpm,
    pb.calc_rpm_abrasivity as rpm_abrasivity,
    pb.calc_rpm_viscosity as rpm_viscosity,
    case
      when pb.calc_max_source_value is null or pb.calc_max_percent is null then null
      else pb.calc_max_source_value * (1 + pb.calc_max_percent::numeric / 100)
    end as maximum_rpm,
    pb.calc_max_source as maximum_source,
    pb.calc_max_percent as maximum_percent,
    pb.calc_matches_pressure_stage as matches_pressure_stage,
    pb.calc_rpm_interval as rpm_interval,
    case
      when pb.calc_required_rpm is null or pb.calc_rpm_min is null or pb.calc_rpm_max is null then false
      else pb.calc_required_rpm between pb.calc_rpm_min and pb.calc_rpm_max
    end as is_in_rpm_range
  from percent_base pb
  order by pb.calc_sort_order, pb.calc_pump_code;
end;
$$;

revoke all on function public.calculate_pump_results(numeric, integer, text, integer, integer) from public;
grant execute on function public.calculate_pump_results(numeric, integer, text, integer, integer) to authenticated;

notify pgrst, 'reload schema';


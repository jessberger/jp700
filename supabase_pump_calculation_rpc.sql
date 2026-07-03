-- Run this in Supabase SQL Editor.
-- It lets every active authenticated user calculate pump results without opening dataset tables to non_viewer users.

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
  maximum_percent integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and coalesce(is_active, true) = true
  ) then
    raise exception 'User is not active';
  end if;

  if abrasivity_group not between 1 and 4 or viscosity_group not between 1 and 4 then
    raise exception 'Invalid abrasivity or viscosity group';
  end if;

  return query
  with base as (
    select
      pl.pump_code::text as pump_code,
      coalesce(pl.sort_order, 999999) as sort_order,
      case
        when lower(coalesce(orientation, '')) = 'vertical'
          then lower(coalesce(pl.installation, '')) like '%vertikal%'
            or lower(coalesce(pl.installation, '')) like '%vertical%'
        else lower(coalesce(pl.installation, '')) like '%horizontal%'
      end as is_selectable,
      case abrasivity_group
        when 1 then av.abr_1
        when 2 then av.abr_2
        when 3 then av.abr_3
        when 4 then av.abr_4
      end::numeric as rpm_abrasivity,
      case viscosity_group
        when 1 then av.vis_1
        when 2 then av.vis_2
        when 3 then av.vis_3
        when 4 then av.vis_4
      end::numeric as rpm_viscosity,
      (
        flow_lmin
        / nullif((rf.constant * rf.eccentricity * rf.rotor_diameter * rf.stator_pitch * ef.efficiency), 0)
        / 1000
      )::numeric as required_rpm
    from public.pump_limits pl
    left join public.rpm_formula rf on rf.pump_code = pl.pump_code
    left join public.efficiency ef on ef.pump_code = pl.pump_code and ef.pressure_bar = calculate_pump_results.pressure_bar
    left join public.abb_vis av on av.section = pl.section_number
  ), max_base as (
    select
      base.*,
      case
        when rpm_abrasivity is null or rpm_viscosity is null then null
        when rpm_abrasivity <= rpm_viscosity then rpm_abrasivity
        else rpm_viscosity
      end as max_source_value,
      case
        when rpm_abrasivity is null or rpm_viscosity is null then null
        when rpm_abrasivity <= rpm_viscosity then 'Abr'
        else 'Vis'
      end as max_source
    from base
  ), percent_base as (
    select
      max_base.*,
      case
        when max_source_value is null then null
        when max_source_value <= 100 then 50
        when max_source_value <= 250 then 30
        when max_source_value <= 500 then 20
        when max_source_value <= 1000 then 10
        else 5
      end as max_percent
    from max_base
  )
  select
    percent_base.pump_code,
    percent_base.is_selectable,
    percent_base.required_rpm,
    percent_base.rpm_abrasivity,
    percent_base.rpm_viscosity,
    case
      when percent_base.max_source_value is null or percent_base.max_percent is null then null
      else percent_base.max_source_value * (1 + percent_base.max_percent::numeric / 100)
    end as maximum_rpm,
    percent_base.max_source as maximum_source,
    percent_base.max_percent as maximum_percent
  from percent_base
  order by percent_base.sort_order, percent_base.pump_code;
end;
$$;

revoke all on function public.calculate_pump_results(numeric, integer, text, integer, integer) from public;
grant execute on function public.calculate_pump_results(numeric, integer, text, integer, integer) to authenticated;

alter table public.sr_codes
add column if not exists model_code text,
add column if not exists model_name text;

update public.sr_codes
set
  model_code = trim(split_part(pump_model, ' - ', 1)),
  model_name = case
    when position(' - ' in pump_model) > 0 then nullif(trim(substring(pump_model from position(' - ' in pump_model) + 3)), '')
    else model_name
  end
where model_code is null
   or model_name is null;

update public.sr_codes
set
  model_code = 'DR',
  model_name = 'Direktantrieb'
where pump_model = 'DR - Direktantrieb'
   or model_code = 'DR';

update public.jp_codes
set pump_family = regexp_replace(pump_family, '\.+$', '')
where pump_family ~ '\.+$';

select pump_model, model_code, model_name, phase, rotation
from public.sr_codes
order by pump_model;

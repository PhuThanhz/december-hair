"use client";

import type { SpecialDay, WeeklyHours } from "../cms";
import { useAdminT } from "../Providers";
import { Button, Input } from "../ui";

const time = "w-[5.5rem] sm:w-28 !px-2 sm:!px-3.5 tabular-nums";

/** All seven weekdays, in order, whatever the stored list holds */
export function fullWeek(hours: WeeklyHours[]): WeeklyHours[] {
  return Array.from({ length: 7 }, (_, weekday) => {
    const h = hours.find((x) => x.weekday === weekday);
    return h ?? { weekday, opens: "09:00", closes: "20:00", closed: false };
  });
}

/** The weekly hours: one row per day, closed or open from–to */
export function WeeklyHoursEditor({ value, onChange }: { value: WeeklyHours[]; onChange: (v: WeeklyHours[]) => void }) {
  const { t } = useAdminT();
  const set = (i: number, patch: Partial<WeeklyHours>) => onChange(value.map((h, j) => (j === i ? { ...h, ...patch } : h)));
  return (
    <div className="space-y-2">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-ink/5">
          {value.map((h, i) => (
            <tr key={h.weekday}>
              <th scope="row" className="py-2 pr-2 sm:pr-3 text-left font-normal w-20 sm:w-28">
                {t.cms.branches.days[h.weekday]}
              </th>
              <td className="py-2 pr-2 sm:pr-3">
                <label className="flex items-center gap-2" title={t.cms.branches.closed}>
                  <input type="checkbox" className="h-4 w-4 accent-moss" checked={h.closed} onChange={(e) => set(i, { closed: e.target.checked })} />
                  <span className="sr-only sm:not-sr-only">{t.cms.branches.closed}</span>
                </label>
              </td>
              <td className="py-2">
                {!h.closed && (
                  <span className="flex items-center gap-1 sm:gap-2">
                    <Input
                      type="time"
                      aria-label={`${t.cms.branches.days[h.weekday]} ${t.cms.branches.opens}`}
                      className={time}
                      required
                      value={h.opens ?? ""}
                      onChange={(e) => set(i, { opens: e.target.value || null })}
                    />
                    –
                    <Input
                      type="time"
                      aria-label={`${t.cms.branches.days[h.weekday]} ${t.cms.branches.closes}`}
                      className={time}
                      required
                      value={h.closes ?? ""}
                      onChange={(e) => set(i, { closes: e.target.value || null })}
                    />
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button type="button" variant="ghost" onClick={() => onChange(value.map((h) => ({ ...value[0], weekday: h.weekday })))}>
        {t.cms.branches.copyMonday}
      </Button>
    </div>
  );
}

/** Dates that override the week (holidays, short days) */
export function SpecialDaysEditor({ value, onChange }: { value: SpecialDay[]; onChange: (v: SpecialDay[]) => void }) {
  const { t } = useAdminT();
  const set = (i: number, patch: Partial<SpecialDay>) => onChange(value.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  const add = () =>
    onChange([...value, { date: new Date().toISOString().slice(0, 10), opens: null, closes: null, closed: true, labelCs: "", labelEn: "" }]);
  return (
    <div className="space-y-3">
      {value.map((d, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-ink/10 p-3 text-sm">
          <Input type="date" aria-label={t.cms.branches.date} className="w-40" required value={d.date} onChange={(e) => set(i, { date: e.target.value })} />
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 accent-moss" checked={d.closed} onChange={(e) => set(i, { closed: e.target.checked })} />
            {t.cms.branches.closed}
          </label>
          {!d.closed && (
            <span className="flex items-center gap-2">
              <Input type="time" aria-label={t.cms.branches.opens} className={time} required value={d.opens ?? ""} onChange={(e) => set(i, { opens: e.target.value || null })} />
              –
              <Input type="time" aria-label={t.cms.branches.closes} className={time} required value={d.closes ?? ""} onChange={(e) => set(i, { closes: e.target.value || null })} />
            </span>
          )}
          <Input
            aria-label={`${t.cms.branches.label} · ${t.cms.cs}`}
            placeholder={`${t.cms.branches.label} (${t.cms.cs})`}
            className="min-w-[8rem] flex-1"
            value={d.labelCs ?? ""}
            onChange={(e) => set(i, { labelCs: e.target.value })}
          />
          <Input
            aria-label={`${t.cms.branches.label} · ${t.cms.en}`}
            placeholder={`${t.cms.branches.label} (${t.cms.en})`}
            className="min-w-[8rem] flex-1"
            value={d.labelEn ?? ""}
            onChange={(e) => set(i, { labelEn: e.target.value })}
          />
          <Button type="button" variant="ghost" onClick={() => onChange(value.filter((_, j) => j !== i))}>
            {t.cms.branches.removeDay}
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={add}>
        + {t.cms.branches.addSpecial}
      </Button>
    </div>
  );
}

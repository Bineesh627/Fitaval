import React, { useEffect, useMemo, useState, useCallback } from "react";
import { client } from "@/api/client";
import { format, addDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, CheckCheck, Clock, Search, CalendarDays, Dumbbell, Briefcase } from "lucide-react";
import { Badge, EmptyState } from "@/components/ui-shared";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getImageUrl } from "@/utils/imageUrl";
import { ATTENDANCE_STATUSES, ATTENDANCE_VIEW_TABS, STAFF_ROLE_FILTERS } from "@/data";

const ymd = (d) => format(d, "yyyy-MM-dd");
const statusMeta = (v) => ATTENDANCE_STATUSES.find((s) => s.value === v);

function Avatar({ person }) {
  return (
    <div className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold overflow-hidden shrink-0 border border-border/70">
      {person.photo_url ? (
        <img src={getImageUrl(person.photo_url)} alt={person.name} className="w-full h-full object-cover block" />
      ) : (
        person.name?.charAt(0).toUpperCase()
      )}
    </div>
  );
}

/**
 * Attendance for trainers & staff.
 * Daily: mark status + check-in/out per person for a chosen date.
 * Monthly: per-person counts and attendance % for a chosen month.
 */
export default function StaffAttendance({ people }) {
  const { toast } = useToast();
  const [records, setRecords] = useState(() => client.entities.Attendance.listSync?.("-date", 5000) || []);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("daily");
  const [date, setDate] = useState(new Date());
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setRecords(await client.entities.Attendance.list("-date", 5000));
      } catch (e) {
        console.error(e);
        toast({ title: "Failed to load attendance", description: e.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const roster = useMemo(
    () =>
      people
        .filter((p) => p.status !== "inactive")
        .filter((p) => roleFilter === "all" || (p.role === "staff" ? "staff" : "trainer") === roleFilter)
        .filter((p) => !search || p.name?.toLowerCase().includes(search.toLowerCase())),
    [people, roleFilter, search]
  );

  const dateKey = ymd(date);
  const dayMap = useMemo(() => {
    const m = {};
    records.filter((r) => r.date === dateKey).forEach((r) => (m[r.person_id] = r));
    return m;
  }, [records, dateKey]);

  const upsert = useCallback(
    async (person, patch) => {
      setBusyId(person.id);
      try {
        const existing = records.find((r) => r.person_id === person.id && r.date === dateKey);
        if (existing) {
          const updated = await client.entities.Attendance.update(existing.id, patch);
          setRecords((prev) => prev.map((r) => (r.id === existing.id ? updated : r)));
        } else {
          const created = await client.entities.Attendance.create({
            person_id: person.id,
            person_name: person.name,
            role: person.role === "staff" ? "staff" : "trainer",
            date: dateKey,
            status: "present",
            check_in: "",
            check_out: "",
            note: "",
            ...patch,
          });
          setRecords((prev) => [created, ...prev]);
        }
      } catch (e) {
        toast({ title: "Could not save attendance", description: e.message, variant: "destructive" });
      } finally {
        setBusyId(null);
      }
    },
    [records, dateKey, toast]
  );

  const setStatus = (person, status) => {
    const worked = ["present", "late", "half_day"].includes(status);
    const existing = dayMap[person.id];
    const patch = { status };
    if (!worked) {
      patch.check_in = "";
      patch.check_out = "";
    } else if (!existing?.check_in && isSameDay(date, new Date())) {
      patch.check_in = format(new Date(), "HH:mm");
    }
    upsert(person, patch);
  };

  const markAllPresent = async () => {
    const pending = roster.filter((p) => !dayMap[p.id]);
    if (!pending.length) {
      toast({ title: "Everyone is already marked", description: "No pending entries for this day." });
      return;
    }
    for (const p of pending) {
      await upsert(p, { status: "present" });
    }
    toast({ title: "Marked present", description: `${pending.length} pending ${pending.length === 1 ? "person" : "people"} marked present.` });
  };

  const counts = useMemo(() => {
    const c = { present: 0, late: 0, half_day: 0, absent: 0, leave: 0, unmarked: 0 };
    roster.forEach((p) => {
      const r = dayMap[p.id];
      if (r) c[r.status] = (c[r.status] || 0) + 1;
      else c.unmarked += 1;
    });
    return c;
  }, [roster, dayMap]);

  // ----- Monthly summary
  const monthly = useMemo(() => {
    const from = ymd(startOfMonth(month));
    const to = ymd(endOfMonth(month));
    return roster.map((p) => {
      const mine = records.filter((r) => r.person_id === p.id && r.date >= from && r.date <= to);
      const c = { present: 0, late: 0, half_day: 0, absent: 0, leave: 0 };
      mine.forEach((r) => (c[r.status] = (c[r.status] || 0) + 1));
      const counted = mine.length - c.leave;
      const credit = c.present + c.late + c.half_day * 0.5;
      return { person: p, ...c, recorded: mine.length, pct: counted > 0 ? Math.round((credit / counted) * 100) : null, days: mine };
    });
  }, [roster, records, month]);

  if (loading && records.length === 0) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isToday = isSameDay(date, new Date());

  return (
    <div className="space-y-3.5">
      {/* Daily / Monthly switch */}
      <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border">
        {ATTENDANCE_VIEW_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setView(t.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              view === t.id ? "bg-card text-foreground shadow-xs border border-border/80" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + role filter */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input aria-label="Search trainer or staff..." id="staff-attendance-search-trainer-or-staff" name="search"
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trainer or staff..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-card border border-border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground text-foreground"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {STAFF_ROLE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setRoleFilter(f.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border shrink-0 transition-all ${
                roleFilter === f.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {view === "daily" ? (
        <>
          {/* Date navigator */}
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-card border border-border p-2">
            <button type="button" aria-label="Previous day" onClick={() => setDate((d) => addDays(d, -1))} className="w-10 h-10 rounded-xl hover:bg-muted flex items-center justify-center">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center min-w-0">
              <p className="font-bold text-sm text-foreground flex items-center justify-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-primary" />
                {format(date, "EEE, dd MMM yyyy")}
              </p>
              <div className="flex items-center justify-center gap-2 mt-0.5">
                {isToday ? (
                  <span className="text-[11px] font-semibold text-primary">Today</span>
                ) : (
                  <button type="button" onClick={() => setDate(new Date())} className="text-[11px] font-semibold text-primary underline-offset-2 hover:underline">
                    Jump to today
                  </button>
                )}
                <input id="staff-attendance-dateKey" name="dateKey"
                  autoComplete="off"
                  type="date"
                  value={dateKey}
                  max={ymd(addDays(new Date(), 0))}
                  onChange={(e) => e.target.value && setDate(new Date(e.target.value + "T00:00:00"))}
                  className="text-[11px] bg-transparent border border-border rounded-md px-1.5 py-0.5 text-foreground"
                  aria-label="Pick date"
                />
              </div>
            </div>
            <button
              type="button"
              aria-label="Next day"
              disabled={isToday}
              onClick={() => setDate((d) => addDays(d, 1))}
              className="w-10 h-10 rounded-xl hover:bg-muted flex items-center justify-center disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Summary tiles */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[...ATTENDANCE_STATUSES, { value: "unmarked", label: "Pending", dot: "bg-muted-foreground/40" }].map((s) => (
              <div key={s.value} className="rounded-2xl border border-border bg-card px-2 py-2.5 text-center">
                <p className="font-extrabold text-base text-foreground">{counts[s.value] || 0}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <Button onClick={markAllPresent} variant="outline" className="w-full h-11 rounded-xl text-xs font-bold gap-1.5">
            <CheckCheck className="w-4 h-4 text-primary" /> Mark all pending as present
          </Button>

          {roster.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No one to show" description="Add active trainers or staff in the Roster tab, or change the filter." />
          ) : (
            <div className="space-y-3">
              {roster.map((p) => {
                const rec = dayMap[p.id];
                const meta = rec ? statusMeta(rec.status) : null;
                const worked = rec && ["present", "late", "half_day"].includes(rec.status);
                const isStaff = p.role === "staff";
                return (
                  <div key={p.id} className="rounded-2xl bg-card border border-border p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar person={p} />
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-foreground truncate">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                            {isStaff ? <Briefcase className="w-3 h-3" /> : <Dumbbell className="w-3 h-3" />}
                            {isStaff ? p.bio || "Staff" : "Trainer"} • {p.working_hours || "Shift not set"}
                          </p>
                        </div>
                      </div>
                      {meta ? (
                        <Badge variant={meta.badge} className="shrink-0">{meta.label}</Badge>
                      ) : (
                        <Badge className="shrink-0">Not marked</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {ATTENDANCE_STATUSES.map((s) => {
                        const active = rec?.status === s.value;
                        return (
                          <button
                            key={s.value}
                            type="button"
                            disabled={busyId === p.id}
                            onClick={() => setStatus(p, s.value)}
                            aria-pressed={active}
                            className={`py-2 rounded-xl border-2 text-[10.5px] font-bold leading-tight transition-all touch-manipulation active:scale-95 ${
                              active ? s.chip : "border-border text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {s.label}
                          </button>
                        );
                      })}
                    </div>

                    {worked && (
                      <div className="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-border/60">
                        <label className="text-[11px] text-muted-foreground font-semibold flex flex-col gap-1">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Check-in</span>
                          <input
                            type="time"
                            id={`check-in-${p.id}`}
                            name={`check_in_${p.id}`}
                            autoComplete="off"
                            defaultValue={rec.check_in || ""}
                            key={`in-${rec.id}-${rec.check_in}`}
                            onBlur={(e) => e.target.value !== (rec.check_in || "") && upsert(p, { check_in: e.target.value })}
                            className="h-10 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground"
                          />
                        </label>
                        <label className="text-[11px] text-muted-foreground font-semibold flex flex-col gap-1">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Check-out</span>
                          <input
                            type="time"
                            id={`check-out-${p.id}`}
                            name={`check_out_${p.id}`}
                            autoComplete="off"
                            defaultValue={rec.check_out || ""}
                            key={`out-${rec.id}-${rec.check_out}`}
                            onBlur={(e) => e.target.value !== (rec.check_out || "") && upsert(p, { check_out: e.target.value })}
                            className="h-10 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Month navigator */}
          <div className="flex items-center justify-between rounded-2xl bg-card border border-border p-2">
            <button type="button" aria-label="Previous month" onClick={() => setMonth((m) => addMonths(m, -1))} className="w-10 h-10 rounded-xl hover:bg-muted flex items-center justify-center">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <p className="font-bold text-sm text-foreground">{format(month, "MMMM yyyy")}</p>
            <button
              type="button"
              aria-label="Next month"
              disabled={startOfMonth(addMonths(month, 1)) > new Date()}
              onClick={() => setMonth((m) => addMonths(m, 1))}
              className="w-10 h-10 rounded-xl hover:bg-muted flex items-center justify-center disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {monthly.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No one to show" description="Add active trainers or staff in the Roster tab." />
          ) : (
            <div className="space-y-3">
              {monthly.map((m) => (
                <div key={m.person.id} className="rounded-2xl bg-card border border-border p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar person={m.person} />
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{m.person.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {m.person.role === "staff" ? "Staff" : "Trainer"} • {m.recorded} day{m.recorded === 1 ? "" : "s"} recorded
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-extrabold text-lg ${m.pct === null ? "text-muted-foreground" : m.pct >= 90 ? "text-emerald-600 dark:text-emerald-400" : m.pct >= 75 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                        {m.pct === null ? "—" : `${m.pct}%`}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Attendance</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    {ATTENDANCE_STATUSES.map((s) => (
                      <div key={s.value} className="rounded-xl bg-muted/50 py-2">
                        <p className="font-bold text-sm text-foreground">{m[s.value]}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Day strip */}
                  <div className="flex flex-wrap gap-1">
                    {eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }).map((d) => {
                      const rec = m.days.find((r) => r.date === ymd(d));
                      const meta = rec ? statusMeta(rec.status) : null;
                      return (
                        <span
                          key={ymd(d)}
                          title={`${format(d, "dd MMM")}: ${meta ? meta.label : "No record"}`}
                          className={`w-[22px] h-[22px] rounded-md text-[9px] font-bold flex items-center justify-center ${
                            meta ? `${meta.dot} text-white` : "bg-muted text-muted-foreground/70"
                          }`}
                        >
                          {format(d, "d")}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

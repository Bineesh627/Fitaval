import React, { useState } from "react";
import { Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import CircularTimePickerModal from "./CircularTimePickerModal";
import { DAYS_OF_WEEK } from "@/data";

/**
 * Shared weekday list + circular time picker used by both the gym
 * Operating Hours manager and the Trainer shift picker.
 *
 * Props:
 * - schedule: { [dayKey]: { enabled, open, close } }
 * - onChange(nextSchedule)
 * - defaults: { open, close } fallback times
 * - labels: { open, close } captions for the two time buttons / picker titles
 * - idPrefix: unique prefix for the switch ids/names
 */
export default function WeeklyScheduleEditor({
  schedule,
  onChange,
  defaults = { open: "06:00 AM", close: "10:00 PM" },
  labels = { open: "Opening", close: "Closing" },
  idPrefix = "schedule",
}) {
  const [pickerState, setPickerState] = useState({
    open: false,
    dayKey: null,
    field: null, // 'open' | 'close'
    currentTime: defaults.open,
    title: "",
  });

  const updateDay = (dayKey, patch) =>
    onChange?.({ ...schedule, [dayKey]: { ...schedule[dayKey], ...patch } });

  const handleToggle = (dayKey) =>
    updateDay(dayKey, { enabled: !schedule[dayKey]?.enabled });

  const openPicker = (dayKey, field, dayLabel) => {
    setPickerState({
      open: true,
      dayKey,
      field,
      currentTime: schedule[dayKey]?.[field] || defaults[field],
      title: `${dayLabel} (${labels[field]})`,
    });
  };

  const handleSaveTime = (newTime) => {
    if (!pickerState.dayKey || !pickerState.field) return;
    updateDay(pickerState.dayKey, { [pickerState.field]: newTime });
  };

  return (
    <>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        {DAYS_OF_WEEK.map(({ key, label }) => {
          const day = schedule[key] || { enabled: false, ...defaults };
          const isOpen = day.enabled;

          return (
            <div
              key={key}
              className={`p-3.5 sm:p-4 flex flex-col gap-2.5 transition-colors ${
                isOpen ? "bg-card" : "bg-muted/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isOpen ? "bg-primary animate-pulse" : "bg-muted-foreground/30"
                    }`}
                  />
                  <span className="font-bold text-sm text-foreground">{label}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-xs font-semibold ${
                      isOpen ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {isOpen ? "Open" : "Closed"}
                  </span>
                  <Switch
                    id={`${idPrefix}-${key}-toggle`}
                    name={`${idPrefix}_${key}_enabled`}
                    aria-label={`Toggle ${label}`}
                    checked={isOpen}
                    onCheckedChange={() => handleToggle(key)}
                    className="touch-manipulation"
                  />
                </div>
              </div>

              {isOpen ? (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {["open", "close"].map((field) => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => openPicker(key, field, label)}
                      className="flex flex-col items-start p-2.5 rounded-xl bg-secondary/80 hover:bg-primary/10 hover:border-primary/40 border border-border transition-colors text-left min-h-[48px] cursor-pointer"
                    >
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        {labels[field]} Time
                      </span>
                      <span className="text-xs font-bold text-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        {day[field] || defaults[field]}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs font-medium text-muted-foreground bg-muted/60 p-2 rounded-xl text-center">
                  Closed all day
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CircularTimePickerModal
        open={pickerState.open}
        onClose={() => setPickerState((prev) => ({ ...prev, open: false }))}
        initialTime={pickerState.currentTime}
        title={pickerState.title}
        onSave={handleSaveTime}
      />
    </>
  );
}

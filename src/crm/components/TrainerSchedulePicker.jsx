import React, { useState } from "react";
import WeeklyScheduleEditor from "./WeeklyScheduleEditor";
import { DAYS_OF_WEEK, DEFAULT_TRAINER_SCHEDULE } from "@/data";

export { DAYS_OF_WEEK, DEFAULT_TRAINER_SCHEDULE };

function parseInitialSchedule(workingDays = "", workingHours = "") {
  let start = "06:00 AM";
  let end = "02:00 PM";
  if (workingHours) {
    const parts = workingHours.split(/–|-|to/);
    if (parts.length >= 2) {
      start = parts[0].trim() || "06:00 AM";
      end = parts[1].trim() || "02:00 PM";
    }
  }

  const s = (workingDays || "").toLowerCase();
  const schedule = {};

  DAYS_OF_WEEK.forEach(({ key }) => {
    let enabled = false;
    if (!workingDays || s.includes("mon – fri") || s.includes("monday – friday") || s.includes("monday - friday")) {
      enabled = ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(key);
    } else if (s.includes("mon – sat") || s.includes("monday – saturday") || s.includes("monday - saturday")) {
      enabled = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].includes(key);
    } else if (s.includes("all week") || s.includes("monday – sunday") || s.includes("monday - sunday")) {
      enabled = true;
    } else if (s.includes("weekend") || s.includes("sat – sun") || s.includes("saturday – sunday")) {
      enabled = ["saturday", "sunday"].includes(key);
    } else {
      enabled = s.includes(key) || s.includes(key.slice(0, 3));
    }

    schedule[key] = {
      enabled,
      open: start,
      close: end,
    };
  });

  return schedule;
}

function deriveDaysString(schedule) {
  const activeKeys = DAYS_OF_WEEK.filter((d) => schedule[d.key]?.enabled).map((d) => d.key);
  if (activeKeys.length === 0) return "None";
  if (activeKeys.length === 7) return "Monday – Sunday";

  const isWeekdays =
    ["monday", "tuesday", "wednesday", "thursday", "friday"].every((d) => activeKeys.includes(d)) &&
    activeKeys.length === 5;
  if (isWeekdays) return "Monday – Friday";

  const isSixDays =
    ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].every((d) => activeKeys.includes(d)) &&
    activeKeys.length === 6;
  if (isSixDays) return "Monday – Saturday";

  const isWeekend =
    activeKeys.length === 2 && activeKeys.includes("saturday") && activeKeys.includes("sunday");
  if (isWeekend) return "Saturday – Sunday";

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  return activeKeys.map((k) => capitalize(k.slice(0, 3))).join(", ");
}

function deriveHoursString(schedule) {
  const firstActive = DAYS_OF_WEEK.find((d) => schedule[d.key]?.enabled);
  if (firstActive && schedule[firstActive.key]) {
    return `${schedule[firstActive.key].open || "06:00 AM"} – ${schedule[firstActive.key].close || "02:00 PM"}`;
  }
  return "06:00 AM – 02:00 PM";
}

/**
 * Exact Operating Hours Design from Gym Profile applied to Trainer Add/Edit
 */
export default function TrainerSchedulePicker({
  workingDays = "Monday – Friday",
  workingHours = "06:00 AM – 02:00 PM",
  onChangeDays,
  onChangeHours,
  onChangeSchedule,
}) {
  const [schedule, setSchedule] = useState(() =>
    parseInitialSchedule(workingDays, workingHours)
  );

  const notifyChange = (newSchedule) => {
    setSchedule(newSchedule);
    onChangeDays?.(deriveDaysString(newSchedule));
    onChangeHours?.(deriveHoursString(newSchedule));
    onChangeSchedule?.(newSchedule);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">
          Operating Hours & Shift
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">
          {deriveDaysString(schedule)} ({deriveHoursString(schedule)})
        </span>
      </div>

      <WeeklyScheduleEditor
        schedule={schedule}
        onChange={notifyChange}
        defaults={{ open: "06:00 AM", close: "02:00 PM" }}
        labels={{ open: "Shift Start", close: "Shift End" }}
        idPrefix="trainer-shift"
      />
    </div>
  );
}

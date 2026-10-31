import React from "react";
import WeeklyScheduleEditor from "./WeeklyScheduleEditor";
import {
  DAYS_OF_WEEK,
  DEFAULT_WEEK_SCHEDULE,
  formatWeeklyScheduleSummary,
} from "@/data";

export { DAYS_OF_WEEK, DEFAULT_WEEK_SCHEDULE, formatWeeklyScheduleSummary };

/**
 * Mobile-First Operating Hours Manager
 * Touch-friendly rows with WhatsApp business toggles
 */
export function OperatingHoursManager({ value, onChange }) {
  return (
    <div className="space-y-3">
      <WeeklyScheduleEditor
        schedule={value || DEFAULT_WEEK_SCHEDULE}
        onChange={onChange}
        defaults={{ open: "5:30 AM", close: "10:30 PM" }}
        labels={{ open: "Opening", close: "Closing" }}
        idPrefix="gym-hours"
      />
    </div>
  );
}

export default OperatingHoursManager;

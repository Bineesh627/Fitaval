import React, { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Mobile-First Circular Clock Time Picker
 * WhatsApp Business / Material Mobile Clock Style
 * Renders cleanly as a touch-friendly bottom sheet on mobile and modal dialog on desktop
 */
export function CircularTimePickerModal({
  open,
  onClose,
  initialTime = "06:00 AM",
  title = "Select Time",
  onSave,
}) {
  const parseTime = (str) => {
    try {
      const match = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        let h = parseInt(match[1], 10);
        let m = parseInt(match[2], 10);
        let period = match[3].toUpperCase();
        if (h === 0) h = 12;
        if (h > 12) h = 12;
        return { hour: h, minute: m, period };
      }
    } catch {
      // fallback
    }
    return { hour: 6, minute: 0, period: "AM" };
  };

  const [mode, setMode] = useState("hour"); // 'hour' | 'minute'
  const parsed = parseTime(initialTime);
  const [selectedHour, setSelectedHour] = useState(parsed.hour);
  const [selectedMinute, setSelectedMinute] = useState(parsed.minute);
  const [period, setPeriod] = useState(parsed.period);

  React.useEffect(() => {
    if (open) {
      const p = parseTime(initialTime);
      setSelectedHour(p.hour);
      setSelectedMinute(p.minute);
      setPeriod(p.period);
      setMode("hour");
    }
  }, [open, initialTime]);

  if (!open) return null;

  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const handleHourClick = (h) => {
    setSelectedHour(h);
    // WhatsApp auto-transition to minute selection
    setMode("minute");
  };

  const handleMinuteClick = (m) => {
    setSelectedMinute(m);
  };

  const handleConfirm = () => {
    const formattedHour = selectedHour.toString();
    const formattedMin = selectedMinute.toString().padStart(2, "0");
    const result = `${formattedHour}:${formattedMin} ${period}`;
    onSave?.(result);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet on Mobile / Modal on Desktop */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[92vh] border border-border animate-in slide-in-from-bottom-5 duration-200">
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Header */}
        <div className="px-5 pt-3 pb-2 text-center border-b border-border/70">
          <div className="flex items-center justify-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>{title}</span>
          </div>
          <p className="text-sm font-bold text-foreground mt-0.5">Select Operating Time</p>
        </div>

        {/* Digital display & AM/PM toggle */}
        <div className="px-5 pt-3 pb-2">
          <div className="flex items-center justify-center gap-3 bg-muted/50 p-2.5 rounded-2xl border border-border">
            <div className="flex items-baseline gap-1 font-mono text-3xl font-extrabold">
              <button
                type="button"
                onClick={() => setMode("hour")}
                className={`min-w-[50px] py-1 px-2 rounded-xl transition-all ${
                  mode === "hour"
                    ? "bg-primary text-white shadow-sm ring-2 ring-primary/30 scale-105"
                    : "bg-card text-foreground hover:bg-muted"
                }`}
              >
                {selectedHour}
              </button>
              <span className="text-muted-foreground font-bold text-2xl">:</span>
              <button
                type="button"
                onClick={() => setMode("minute")}
                className={`min-w-[50px] py-1 px-2 rounded-xl transition-all ${
                  mode === "minute"
                    ? "bg-primary text-white shadow-sm ring-2 ring-primary/30 scale-105"
                    : "bg-card text-foreground hover:bg-muted"
                }`}
              >
                {selectedMinute.toString().padStart(2, "0")}
              </button>
            </div>

            {/* AM / PM switcher (min 44px touch) */}
            <div className="flex flex-col gap-1 border-l border-border/80 pl-3">
              <button
                type="button"
                onClick={() => setPeriod("AM")}
                className={`min-h-[32px] px-3 rounded-lg text-xs font-bold uppercase transition-colors ${
                  period === "AM"
                    ? "bg-primary text-white shadow-xs"
                    : "bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setPeriod("PM")}
                className={`min-h-[32px] px-3 rounded-lg text-xs font-bold uppercase transition-colors ${
                  period === "PM"
                    ? "bg-primary text-white shadow-xs"
                    : "bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Mode switch helper */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 px-1">
            <span className="font-medium">
              Picking: <strong className="text-foreground capitalize">{mode}s</strong>
            </span>
            <button
              type="button"
              onClick={() => setMode(mode === "hour" ? "minute" : "hour")}
              className="text-primary font-bold hover:underline"
            >
              Switch to {mode === "hour" ? "minutes" : "hours"}
            </button>
          </div>
        </div>

        {/* Circular Clock Dial (Touch-sized 240px) */}
        <div className="relative w-60 h-60 mx-auto my-2 rounded-full bg-muted/40 border border-border flex items-center justify-center select-none shadow-inner shrink-0">
          {/* Center Pivot */}
          <div className="absolute w-3 h-3 rounded-full bg-primary z-20 shadow-sm" />

          {/* Clock Hand */}
          {(() => {
            const angle =
              mode === "hour"
                ? (selectedHour % 12) * 30
                : (selectedMinute / 60) * 360;
            return (
              <div
                className="absolute w-0.5 bg-primary origin-bottom pointer-events-none transition-transform duration-200 z-10"
                style={{
                  height: "82px",
                  bottom: "50%",
                  transform: `rotate(${angle}deg)`,
                }}
              >
                {/* Hand target circle */}
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-primary/25 border-2 border-primary" />
              </div>
            );
          })()}

          {/* Numbers arranged around circular dial */}
          {(mode === "hour" ? hours : minutes).map((val, index) => {
            const angle = (index * 30 - 90) * (Math.PI / 180);
            const radius = 86;
            const x = Math.round(Math.cos(angle) * radius);
            const y = Math.round(Math.sin(angle) * radius);

            const isSelected =
              mode === "hour" ? selectedHour === val : selectedMinute === val;

            return (
              <button
                key={val}
                type="button"
                onClick={() =>
                  mode === "hour" ? handleHourClick(val) : handleMinuteClick(val)
                }
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 touch-manipulation ${
                  isSelected
                    ? "bg-primary text-white font-extrabold shadow-md scale-110"
                    : "text-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {mode === "minute" ? val.toString().padStart(2, "0") : val}
              </button>
            );
          })}
        </div>

        {/* Quick presets chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 px-4 pb-2">
          {["05:30 AM", "06:00 AM", "08:00 PM", "10:00 PM", "10:30 PM"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                const p = parseTime(t);
                setSelectedHour(p.hour);
                setSelectedMinute(p.minute);
                setPeriod(p.period);
              }}
              className="px-2.5 py-1 rounded-lg text-xs bg-secondary hover:bg-primary/10 hover:text-primary text-foreground font-medium transition-colors border border-border/60"
            >
              {t}
            </button>
          ))}
        </div>

        {/* Sticky Actions in safe area */}
        <div className="px-5 py-3 border-t border-border bg-card flex items-center gap-2 safe-bottom">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl h-11 border-border text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-xl h-11 bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90"
          >
            Save Time
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CircularTimePickerModal;

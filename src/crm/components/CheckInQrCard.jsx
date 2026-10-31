import React, { useEffect, useState } from "react";
import { ScanLine, Users } from "lucide-react";
import { format } from "date-fns";
import { client } from "@/api/client";
import QrCodeSvg from "@/components/QrCodeSvg";
import QrScannerDialog from "@/components/QrScannerDialog";
import { memberQr } from "@/lib/qr";

/**
 * Dashboard card: shows the QR code of the last member scanned (or of the
 * first member as a sample) and opens the scanner.
 */
export default function CheckInQrCard({ members }) {
  const [open, setOpen] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [last, setLast] = useState(null);

  const refresh = async () => {
    const list = await client.entities.MemberCheckin.list("-created_at", 500);
    const today = format(new Date(), "yyyy-MM-dd");
    setTodayCount(list.filter((c) => c.date === today).length);
    const latest = list[0];
    setLast(latest ? members.find((m) => m.id === latest.member_id) || null : null);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members]);

  const shown = last || members[0];
  const code = shown ? memberQr(shown) : "";

  return (
    <div className="mb-5 rounded-2xl border border-border bg-card p-4 shadow-sm sm:mb-6 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-foreground sm:text-base">Digital check-in QR code</h3>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
          Live in app
        </span>
      </div>

      <div className="rounded-xl border border-border bg-white px-4 py-4 sm:px-8 sm:py-5">
        {code ? (
          <>
            <QrCodeSvg value={code} className="mx-auto h-40 w-40 sm:h-44 sm:w-44" />
            <p className="mt-3 text-center font-mono text-sm tracking-[0.18em] text-slate-900 sm:text-base">{code}</p>
          </>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">Add a member to generate a check-in QR code</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold text-foreground transition-colors hover:bg-accent"
      >
        <ScanLine className="h-4 w-4" /> Scan QR Code
      </button>

      <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        {todayCount} checked in today{shown ? ` · showing ${shown.name}` : ""}
      </p>

      <QrScannerDialog open={open} onOpenChange={setOpen} members={members} onCheckedIn={refresh} />
    </div>
  );
}

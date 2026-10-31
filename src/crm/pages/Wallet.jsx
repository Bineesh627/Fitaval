import React, { useEffect, useState, useMemo } from "react";
import { client } from "@/api/client";
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Download, TrendingUp } from "lucide-react";
import { EmptyState, PageHeader, Badge } from "@/components/ui-shared";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Wallet() {
  const [transactions, setTransactions] = useState(() => client.entities.WalletTransaction.listSync?.("-date", 100) || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const t = await client.entities.WalletTransaction.list("-date", 100);
        setTransactions(t);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const balance = useMemo(() => {
    return transactions.reduce((sum, t) => {
      if (t.type === "credit") return sum + (t.amount || 0);
      if (t.type === "debit" || t.type === "withdrawal") return sum - (t.amount || 0);
      return sum;
    }, 0);
  }, [transactions]);

  const totalEarnings = useMemo(() => transactions.filter((t) => t.type === "credit").reduce((s, t) => s + (t.amount || 0), 0), [transactions]);
  const totalWithdrawn = useMemo(() => transactions.filter((t) => t.type === "withdrawal").reduce((s, t) => s + (t.amount || 0), 0), [transactions]);

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Fitaval Wallet"
        subtitle="B2C revenue & settlements"
        backTo="/settings"
      />

      {/* Balance card */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-6 mb-4 relative overflow-hidden border border-slate-800/80 shadow-xl">
        {/* Decorative glows */}
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-primary/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-10 -bottom-12 w-36 h-36 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          {/* Top row: icon + badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                <WalletIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white/45 text-[11px] uppercase tracking-widest font-semibold">Fitaval Wallet</p>
                <p className="text-white/80 text-sm font-medium">Available Balance</p>
              </div>
            </div>
            <Badge variant="green">Active</Badge>
          </div>

          {/* Balance amount */}
          <p className="text-5xl font-extrabold tracking-tight leading-none tabular-nums">
            ₹{balance.toLocaleString("en-IN")}
          </p>
          <p className="text-white/40 text-xs mt-2">
            Last updated {format(new Date(), "dd MMM yyyy · hh:mm a")}
          </p>

          {/* Divider */}
          <div className="my-5 border-t border-white/10" />

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-11 border-0 font-semibold rounded-xl">
              <Download className="w-4 h-4 mr-1.5" />Withdraw
            </Button>
            <Button variant="outline" className="flex-1 bg-white/8 text-white border-white/20 hover:bg-white/20 h-11 font-semibold rounded-xl">
              <ArrowUpRight className="w-4 h-4 mr-1.5" />Settlements
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl bg-card border border-border p-4 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-emerald-950/40 flex items-center justify-center mb-1.5">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-emerald-400" />
          </div>
          <p className="text-xs text-muted-foreground">Total Earned</p>
          <p className="font-bold text-foreground text-sm">₹{totalEarnings.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center mb-1.5">
            <Download className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-xs text-muted-foreground">Withdrawn</p>
          <p className="font-bold text-foreground text-sm">₹{totalWithdrawn.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Transaction history */}
      <div className="rounded-2xl bg-card border border-border p-5 shadow-xs">
        <h3 className="font-bold text-foreground mb-3">Transaction History</h3>
        {transactions.length === 0 ? (
          <EmptyState icon={WalletIcon} title="No transactions yet" description="B2C membership purchases will appear here" />
        ) : (
          <div className="space-y-1">
            {transactions.map((t) => {
              const isCredit = t.type === "credit";
              return (
                <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCredit ? "bg-green-100 dark:bg-emerald-950/40 text-green-600 dark:text-emerald-400" : "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400"}`}>
                    {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{t.description || (isCredit ? "B2C Membership" : "Withdrawal")}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{format(new Date(t.date), "dd MMM yyyy")}</span>
                      <Badge variant={t.status === "completed" ? "green" : t.status === "pending" ? "amber" : "red"}>{t.status}</Badge>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-sm ${isCredit ? "text-green-600" : "text-red-600"}`}>
                      {isCredit ? "+" : "-"}₹{(t.amount || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

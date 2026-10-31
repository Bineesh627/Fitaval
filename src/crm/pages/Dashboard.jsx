import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { client } from "@/api/client";
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  ArrowRight,
  Calendar,
  ScanLine,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import QrScannerDialog from "@/components/QrScannerDialog";
import { EmptyState, Badge } from "@/components/ui-shared";
import { CASH_FLOW_RANGES } from "@/data";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { format, subDays, isAfter, isBefore, addDays } from "date-fns";

export default function Dashboard() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [cashFlowRange, setCashFlowRange] = useState("week"); // 'week' | 'monthly' | 'yearly'
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [m, t, p, wt] = await Promise.all([
          client.entities.Member.list("-created_date", 200),
          client.entities.Transaction.list("-date", 200),
          client.entities.MembershipPlan.list("-created_date", 50),
          client.entities.WalletTransaction.list("-date", 100),
        ]);
        setMembers(m);
        setTransactions(t);
        setPlans(p);
        setWalletTransactions(wt || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    const soon = addDays(today, 7);
    const active = members.filter(
      (m) => m.status === "active" && isAfter(new Date(m.expiry_date || today), today)
    );
    const expiring = members.filter((m) => {
      const exp = new Date(m.expiry_date || today);
      return isAfter(exp, today) && isBefore(exp, soon);
    });
    const inactive = members.filter(
      (m) =>
        m.status === "inactive" ||
        (m.expiry_date && isBefore(new Date(m.expiry_date), today))
    );
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthTx = transactions.filter((t) => new Date(t.date) >= monthStart);
    const income = monthTx
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + (t.amount || 0), 0);
    const expense = monthTx
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + (t.amount || 0), 0);
    const todayTx = transactions.filter(
      (t) =>
        format(new Date(t.date), "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
    );
    const dailyIncome = todayTx
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + (t.amount || 0), 0);

    return {
      total: members.length,
      active: active.length,
      expiring: expiring.length,
      inactive: inactive.length,
      income,
      expense,
      net: income - expense,
      dailyIncome,
    };
  }, [members, transactions]);

  const walletBalance = useMemo(() => {
    return walletTransactions.reduce((sum, t) => {
      if (t.type === "credit") return sum + (t.amount || 0);
      if (t.type === "debit" || t.type === "withdrawal")
        return sum - (t.amount || 0);
      return sum;
    }, 0);
  }, [walletTransactions]);

  const chartData = useMemo(() => {
    const today = new Date();

    if (cashFlowRange === "week") {
      // Last 7 days breakdown
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = subDays(today, i);
        const dayStr = format(d, "yyyy-MM-dd");
        const dayTx = transactions.filter(
          (t) => format(new Date(t.date), "yyyy-MM-dd") === dayStr
        );
        days.push({
          label: format(d, "EEE"),
          fullDate: format(d, "EEE, dd MMM yyyy"),
          income: dayTx
            .filter((t) => t.type === "income")
            .reduce((s, t) => s + (t.amount || 0), 0),
          expense: dayTx
            .filter((t) => t.type === "expense")
            .reduce((s, t) => s + (t.amount || 0), 0),
        });
      }
      return days;
    }

    if (cashFlowRange === "monthly") {
      // 4 weekly buckets spanning the current month / past 4 weeks
      const weeks = [];
      for (let i = 3; i >= 0; i--) {
        const end = subDays(today, i * 7);
        const start = subDays(end, 6);
        const startStr = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endStr = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59);

        const weekTx = transactions.filter((t) => {
          const d = new Date(t.date);
          return d >= startStr && d <= endStr;
        });

        weeks.push({
          label: `Wk ${4 - i}`,
          fullDate: `${format(start, "d MMM")} – ${format(end, "d MMM")}`,
          income: weekTx
            .filter((t) => t.type === "income")
            .reduce((s, t) => s + (t.amount || 0), 0),
          expense: weekTx
            .filter((t) => t.type === "expense")
            .reduce((s, t) => s + (t.amount || 0), 0),
        });
      }
      return weeks;
    }

    if (cashFlowRange === "yearly") {
      // 12 months annual breakdown
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const y = targetDate.getFullYear();
        const m = targetDate.getMonth();

        const monthTx = transactions.filter((t) => {
          const d = new Date(t.date);
          return d.getFullYear() === y && d.getMonth() === m;
        });

        months.push({
          label: format(targetDate, "MMM"),
          fullDate: format(targetDate, "MMMM yyyy"),
          income: monthTx
            .filter((t) => t.type === "income")
            .reduce((s, t) => s + (t.amount || 0), 0),
          expense: monthTx
            .filter((t) => t.type === "expense")
            .reduce((s, t) => s + (t.amount || 0), 0),
        });
      }
      return months;
    }

    return [];
  }, [transactions, cashFlowRange]);

  const chartTotals = useMemo(() => {
    const income = chartData.reduce((s, d) => s + (d.income || 0), 0);
    const expense = chartData.reduce((s, d) => s + (d.expense || 0), 0);
    return { income, expense, net: income - expense };
  }, [chartData]);

  const recentMembers = [...members].slice(0, 5);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Greeting */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-5 sm:p-7 mb-5 sm:mb-6 relative overflow-hidden border border-slate-800/80 shadow-md">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/25 rounded-full blur-2xl" />
        <div className="absolute right-10 bottom-0 w-24 h-24 bg-primary/35 rounded-full blur-2xl" />
        <button
          type="button"
          onClick={() => setScannerOpen(true)}
          aria-label="Scan member QR code"
          className="absolute right-4 sm:right-7 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center gap-1.5 w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/25 backdrop-blur text-sm sm:text-base font-semibold text-white shadow-lg transition-all"
        >
          <ScanLine className="w-7 h-7 sm:w-10 sm:h-10" strokeWidth={1.75} />
          <span className="text-[11px] sm:text-sm leading-none">Scan</span>
        </button>
        <div className="relative">
          <p className="text-white/60 text-xs sm:text-sm">
            {format(new Date(), "EEEE, dd MMM")}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-1 text-white tracking-tight">{greeting} 👋</h2>
          <p className="text-white/70 text-xs sm:text-sm mt-1">
            Here's your gym overview for this month
          </p>
          <div className="flex items-center gap-5 sm:gap-8 mt-5">
            <div>
              <p className="text-white/60 text-xs">Monthly Income</p>
              <p className="text-xl sm:text-2xl font-bold text-white tabular tracking-tight">
                ₹{stats.income.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div>
              <p className="text-white/60 text-xs">Net Profit</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-400 tabular tracking-tight">
                ₹{stats.net.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Financial Overview Grid: Income, Expense, Today, Total Wallet */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
        <StatCard
          title="Income"
          value={`₹${stats.income.toLocaleString("en-IN")}`}
          subtitle="This month"
          icon={TrendingUp}
          accent="green"
        />
        <StatCard
          title="Expense"
          value={`₹${stats.expense.toLocaleString("en-IN")}`}
          subtitle="This month"
          icon={TrendingDown}
          accent="red"
        />
        <StatCard
          title="Today"
          value={`₹${stats.dailyIncome.toLocaleString("en-IN")}`}
          subtitle="Daily collection"
          icon={Calendar}
          accent="primary"
        />
        <div
          onClick={() => navigate("/wallet")}
          className="cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              navigate("/wallet");
            }
          }}
        >
          <StatCard
            title="Total Wallet"
            value={`₹${walletBalance.toLocaleString("en-IN")}`}
            subtitle="Current balance · Tap to open →"
            icon={Wallet}
            accent="amber"
            className="border-amber-500/20 group-hover:border-amber-500/60 transition-all bg-gradient-to-br from-card via-card to-amber-500/5 shadow-xs"
          />
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
        <Link
          to="/members"
          className="rounded-2xl bg-primary text-primary-foreground p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-semibold text-sm">Add Member</p>
            <p className="text-xs text-primary-foreground/70">New or existing</p>
          </div>
        </Link>
        <Link
          to="/finance"
          className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3 hover:shadow-sm transition-shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <Wallet className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">Add Transaction</p>
            <p className="text-xs text-muted-foreground">Income or expense</p>
          </div>
        </Link>
      </div>

      {/* Member Statistics KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
        <StatCard title="Total Members" value={stats.total} icon={Users} accent="dark" />
        <StatCard title="Active" value={stats.active} icon={UserCheck} accent="green" />
        <StatCard title="Expiring" value={stats.expiring} icon={Clock} accent="amber" />
        <StatCard title="Inactive" value={stats.inactive} icon={UserX} accent="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-5 sm:mb-6 items-start">
      {/* Cash Flow Chart with Week, Monthly, Yearly filters */}
      <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground">Cash Flow</h3>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full capitalize">
                {cashFlowRange === "week"
                  ? "Weekly"
                  : cashFlowRange === "monthly"
                  ? "Monthly"
                  : "Yearly"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {cashFlowRange === "week"
                ? "Last 7 days daily breakdown"
                : cashFlowRange === "monthly"
                ? "Monthly breakdown by week"
                : "Yearly 12-month annual overview"}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Filter pills: Week / Monthly / Yearly */}
            <div className="inline-flex items-center p-1 rounded-xl bg-muted/60 border border-border">
              {CASH_FLOW_RANGES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCashFlowRange(f.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    cashFlowRange === f.id
                      ? "bg-card text-foreground shadow-xs font-bold border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-3 text-xs pl-1">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />Income
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />Expense
              </span>
            </div>
          </div>
        </div>

        {/* Period Totals Summary Strip */}
        <div className="flex items-center gap-4 text-xs font-medium pb-3 mb-3 border-b border-border/60 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-muted-foreground">In:</span>
            <span className="font-bold text-primary">
              ₹{chartTotals.income.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="w-px h-3.5 bg-border shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-muted-foreground">Out:</span>
            <span className="font-bold text-red-500">
              ₹{chartTotals.expense.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="w-px h-3.5 bg-border shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-muted-foreground">Net:</span>
            <span
              className={`font-bold ${
                chartTotals.net >= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {chartTotals.net >= 0 ? "+" : ""}₹{chartTotals.net.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-xl bg-card border border-border p-2.5 shadow-lg text-xs space-y-1">
                      <p className="font-bold text-foreground">{data.fullDate || data.label}</p>
                      <div className="flex items-center justify-between gap-4 text-primary">
                        <span>Income:</span>
                        <span className="font-bold">₹{(data.income || 0).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-red-500">
                        <span>Expense:</span>
                        <span className="font-bold">₹{(data.expense || 0).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              fill="url(#gInc)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#gExp)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent members */}
      <div className="rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground">Recent Members</h3>
          <Link
            to="/members"
            className="text-xs font-semibold text-primary flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentMembers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No members yet"
            description="Add your first member to get started"
          />
        ) : (
          <div className="space-y-1">
            {recentMembers.map((m) => (
              <div key={m.id} className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-sm font-semibold text-accent-foreground shrink-0">
                  {m.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground text-sm truncate">{m.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {m.plan_name || "No plan"}
                  </p>
                </div>
                <Badge
                  variant={
                    m.status === "active"
                      ? "green"
                      : m.status === "expiring"
                      ? "amber"
                      : "red"
                  }
                >
                  {m.status || "active"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
      <QrScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        members={members}
      />
    </div>
  );
}
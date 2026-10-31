import React, { useEffect, useState, useMemo } from "react";
import { client } from "@/api/client";
import { Plus, TrendingUp, TrendingDown, Wallet, Calendar, CreditCard, Users, Dumbbell, FileSpreadsheet, Loader2 } from "lucide-react";
import { EmptyState, PageHeader, Sheet, Badge } from "@/components/ui-shared";
import { exportTransactionsToExcel } from "@/utils/exportExcel";

import { format, startOfMonth, endOfMonth, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useToast } from "@/components/ui/use-toast";
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  SALARY_TYPES,
} from "@/data";

const incomeCategories = INCOME_CATEGORIES;
const expenseCategories = EXPENSE_CATEGORIES;
const paymentMethods = PAYMENT_METHODS;

export const formatPaymentMethod = (method) => {
  if (!method) return "Cash";
  const m = String(method).toLowerCase();
  if (m === "upi") return "UPI";
  if (m === "bank_transfer") return "Bank Transfer";
  return m.charAt(0).toUpperCase() + m.slice(1);
};

export default function Finance() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState(() => client.entities.Transaction.listSync?.("-date", 500) || []);
  const [trainers, setTrainers] = useState(() => client.entities.Trainer.listSync?.("-created_date", 100) || []);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [range, setRange] = useState("month");
  const [exporting, setExporting] = useState(false);

  const [form, setForm] = useState({
    type: "income",
    amount: "",
    category: "Membership",
    payment_method: "cash",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    salary_type: "staff", // 'staff' | 'trainer'
    recipient_name: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const [t, trns] = await Promise.all([
          client.entities.Transaction.list("-date", 500),
          client.entities.Trainer.list("-created_date", 100),
        ]);
        setTransactions(t);
        setTrainers(trns || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredTx = useMemo(() => {
    const now = new Date();
    let start, end;
    if (range === "today") {
      start = end = now;
    } else if (range === "week") {
      start = subDays(now, 7);
      end = now;
    } else if (range === "month") {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else {
      return transactions;
    }
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
  }, [transactions, range]);

  const summary = useMemo(() => {
    const income = filteredTx.filter((t) => t.type === "income").reduce((s, t) => s + (t.amount || 0), 0);
    const expense = filteredTx.filter((t) => t.type === "expense").reduce((s, t) => s + (t.amount || 0), 0);
    return { income, expense, net: income - expense };
  }, [filteredTx]);

  const displayTx = useMemo(() => {
    if (tab === "all") return filteredTx;
    return filteredTx.filter((t) => t.type === tab);
  }, [filteredTx, tab]);

  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dayTx = transactions.filter((t) => format(new Date(t.date), "yyyy-MM-dd") === format(d, "yyyy-MM-dd"));
      days.push({
        day: format(d, "EEE"),
        income: dayTx.filter((t) => t.type === "income").reduce((s, t) => s + (t.amount || 0), 0),
        expense: dayTx.filter((t) => t.type === "expense").reduce((s, t) => s + (t.amount || 0), 0),
      });
    }
    return days;
  }, [transactions]);

  const emptyForm = () => ({
    type: "income",
    amount: "",
    category: "Membership",
    payment_method: "cash",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    salary_type: "staff",
    recipient_name: "",
  });

  const openAdd = () => {
    setForm(emptyForm());
    setSheetOpen(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isSalary = form.type === "expense" && form.category === "Salary";
      const payload = {
        type: form.type,
        amount: parseFloat(form.amount),
        category: form.category,
        payment_method: form.payment_method,
        date: form.date,
        description:
          form.description ||
          (isSalary && form.recipient_name
            ? `${form.salary_type === "trainer" ? "Trainer" : "Staff"} salary - ${form.recipient_name}`
            : ""),
        ...(isSalary && {
          salary_type: form.salary_type || "staff",
          recipient_name: form.recipient_name || "",
        }),
      };

      const created = await client.entities.Transaction.create(payload);
      setTransactions((prev) => [created, ...prev]);
      setSheetOpen(false);
      setForm(emptyForm());
      toast({
        title: "Transaction added",
        description: isSalary
          ? `${form.salary_type === "trainer" ? "Trainer" : "Staff"} salary payout recorded.`
          : `Recorded ${form.type} of ₹${parseFloat(form.amount).toLocaleString("en-IN")}.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to add transaction",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const rangeLabels = { today: "Today", week: "Last 7 days", month: "This Month", all: "All Time" };

  const handleExportExcel = async () => {
    const dataToExport = displayTx;
    if (!dataToExport.length) {
      toast({
        title: "Nothing to export",
        description: "There are no transactions in the current view.",
        variant: "destructive",
      });
      return;
    }
    setExporting(true);
    try {
      const n = await exportTransactionsToExcel(dataToExport, {
        rangeLabel: `${rangeLabels[range]}${tab !== "all" ? ` (${tab})` : ""}`,
      });
      toast({
        title: "Excel exported",
        description: `${n} transaction${n === 1 ? "" : "s"} saved to an .xlsx file.`,
      });
    } catch (err) {
      console.error("Export error:", err);
      toast({
        title: "Export failed",
        description: "Could not generate the Excel file.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

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
        title="Finance"
        subtitle="Income & Expenses"
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={exporting}
              className="h-10 px-3 rounded-xl gap-1.5 text-xs font-semibold shadow-xs hover:bg-muted"
              title="Export to Excel (.xlsx)"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              )}
              <span>Export Excel</span>
            </Button>
            <button
              type="button"
              onClick={openAdd}
              className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs shrink-0 hover:bg-primary/90 transition-colors"
              title="Add Transaction"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-2xl bg-card border border-border p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-emerald-950/40 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs text-muted-foreground">Income</p>
          </div>
          <p className="font-bold text-green-600 dark:text-emerald-400">₹{summary.income.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-xs text-muted-foreground">Expense</p>
          </div>
          <p className="font-bold text-red-600 dark:text-red-400">₹{summary.expense.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-4 border border-slate-800/80 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-white/70">Net</p>
          </div>
          <p className="font-bold text-white text-base">₹{summary.net.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Date range filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {[
          { key: "today", label: "Today" },
          { key: "week", label: "This Week" },
          { key: "month", label: "This Month" },
          { key: "all", label: "All Time" },
        ].map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              range === r.key ? "bg-primary text-primary-foreground font-bold shadow-xs" : "bg-card border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-2xl bg-card border border-border p-4 mb-4 shadow-xs">
        <h3 className="font-semibold text-foreground text-sm mb-3">7-Day Overview</h3>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: 12,
                fontSize: 12,
                color: "hsl(var(--card-foreground))",
              }}
              formatter={(v) => `₹${v.toLocaleString("en-IN")}`}
            />
            <Bar dataKey="income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 mb-3">
        {[
          { key: "all", label: "All" },
          { key: "income", label: "Income" },
          { key: "expense", label: "Expense" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              tab === t.key ? "bg-primary text-primary-foreground shadow-xs" : "bg-card border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Transaction list header */}
      <div className="flex items-center justify-between mb-2.5 mt-4">
        <h3 className="font-bold text-sm text-foreground">
          Transactions ({displayTx.length})
        </h3>
      </div>

      {/* Transaction list */}
      {displayTx.length === 0 ? (
        <EmptyState icon={Wallet} title="No transactions" description="Record your first income or expense" />
      ) : (
        <div className="space-y-2.5">
          {displayTx.map((t) => {
            const isSalary = t.category === "Salary";
            const isTrainerSalary =
              t.salary_type === "trainer" ||
              (isSalary && t.description?.toLowerCase().includes("trainer"));
            const isStaffSalary = isSalary && !isTrainerSalary;

            return (
              <div
                key={t.id}
                className="flex items-start sm:items-center gap-3 rounded-2xl bg-card border border-border p-3.5 shadow-xs transition-colors hover:border-primary/30"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                    t.type === "income"
                      ? "bg-green-100 dark:bg-emerald-950/40 text-green-600 dark:text-emerald-400"
                      : isTrainerSalary
                      ? "bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400"
                      : isStaffSalary
                      ? "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                      : "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                  }`}
                >
                  {t.type === "income" ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : isTrainerSalary ? (
                    <Dumbbell className="w-5 h-5" />
                  ) : isStaffSalary ? (
                    <Users className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4 className="font-bold text-foreground text-sm truncate">
                        {isSalary
                          ? isTrainerSalary
                            ? "Salary • Trainer"
                            : "Salary • Staff"
                          : t.category}
                      </h4>
                      {isSalary && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 border ${
                            isTrainerSalary
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          }`}
                        >
                          {isTrainerSalary ? (
                            <Dumbbell className="w-2.5 h-2.5" />
                          ) : (
                            <Users className="w-2.5 h-2.5" />
                          )}
                          <span>{isTrainerSalary ? "Trainer" : "Staff"}</span>
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-black text-sm sm:text-base shrink-0 ${
                        t.type === "income" ? "text-green-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}₹{(t.amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Recipient name if present */}
                  {t.recipient_name && (
                    <p className="text-xs font-semibold text-foreground/90 mt-0.5 flex items-center gap-1">
                      <span className="text-muted-foreground font-normal">Recipient:</span>
                      <span>{t.recipient_name}</span>
                    </p>
                  )}

                  {/* Description clearly visible */}
                  {t.description ? (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  ) : (
                    !t.recipient_name && (
                      <p className="text-[11px] text-muted-foreground/60 italic mt-0.5">
                        No description
                      </p>
                    )
                  )}

                  {/* Badges: Payment Method & Type & Date */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                    {/* Payment Method Badge */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/90 text-[11px] font-semibold text-foreground border border-border/60">
                      <CreditCard className="w-3 h-3 text-muted-foreground" />
                      <span>{formatPaymentMethod(t.payment_method)}</span>
                    </span>

                    {/* Type badge */}
                    <Badge variant={t.type === "income" ? "green" : "red"}>
                      {t.type === "income" ? "Income" : "Expense"}
                    </Badge>

                    {/* Date */}
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium ml-auto sm:ml-0">
                      <Calendar className="w-3 h-3 text-muted-foreground/80" />
                      {format(new Date(t.date), "dd MMM yyyy")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add transaction sheet */}
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Add Transaction">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "income", category: "Membership" })}
              className={`py-3 rounded-xl font-semibold text-sm border-2 transition-colors ${
                form.type === "income"
                  ? "border-green-500 bg-green-50 dark:bg-emerald-950/40 text-green-600 dark:text-emerald-400 font-bold"
                  : "border-border text-muted-foreground"
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-1" />Income
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "expense", category: "Rent" })}
              className={`py-3 rounded-xl font-semibold text-sm border-2 transition-colors ${
                form.type === "expense"
                  ? "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold"
                  : "border-border text-muted-foreground"
              }`}
            >
              <TrendingDown className="w-4 h-4 inline mr-1" />Expense
            </button>
          </div>
          <div>
            <Label htmlFor="finance-amount">Amount (₹) *</Label>
            <Input id="finance-amount" name="amount" autoComplete="off" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required className="mt-1.5" placeholder="0" />
          </div>
          <div>
            <Label htmlFor="finance-category">Category</Label>
            <Select name="category" value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger id="finance-category" className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(form.type === "income" ? incomeCategories : expenseCategories).map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* New Staff or Trainer selector when Salary category is selected */}
          {form.type === "expense" && form.category === "Salary" && (
            <div className="p-3.5 rounded-2xl bg-muted/50 border border-border space-y-3 animate-in fade-in">
              <div>
                <span className="text-xs font-bold text-foreground mb-1.5 block">
                  Select Salary Option *
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {SALARY_TYPES.map((st) => {
                    const isSelected = form.salary_type === st.id;
                    const Icon = st.id === "trainer" ? Dumbbell : Users;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            salary_type: st.id,
                            recipient_name: prev.salary_type !== st.id ? "" : prev.recipient_name,
                          }))
                        }
                        className={`py-2.5 px-3 rounded-xl font-bold text-xs border-2 flex items-center justify-center gap-2 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-xs"
                            : "border-border bg-card text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{st.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {form.salary_type === "trainer" ? "Select Trainer" : "Staff Member Name / Designation"}
                </span>
                {form.salary_type === "trainer" ? (
                  trainers.filter((t) => t.role !== "staff").length > 0 ? (
                    <Select
                      name="recipient_name"
                      value={form.recipient_name}
                      onValueChange={(v) => {
                        setForm((prev) => ({
                          ...prev,
                          recipient_name: v,
                        }));
                      }}
                    >
                      <SelectTrigger id="finance-recipient-trainer" aria-label="Choose trainer from roster" className="mt-1.5 h-10 text-xs">
                        <SelectValue placeholder="Choose trainer from roster" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainers
                          .filter((t) => t.role !== "staff")
                          .map((t) => (
                            <SelectItem key={t.id} value={t.name}>
                              {t.name} {t.specialization ? `(${t.specialization})` : ""}
                            </SelectItem>
                          ))}
                        <SelectItem value="Other Trainer">Other / Freelance Coach</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input aria-label="e.g. Alex Carter" id="finance-e-g-alex-carter" name="recipient_name"
                      autoComplete="off"
                      value={form.recipient_name}
                      onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
                      placeholder="e.g. Alex Carter"
                      className="mt-1.5 h-10 text-xs"
                    />
                  )
                ) : trainers.filter((t) => t.role === "staff").length > 0 ? (
                  <div className="space-y-1.5 mt-1.5">
                    <Select
                      name="recipient_staff"
                      value={
                        trainers.filter((t) => t.role === "staff").some((s) => s.name === form.recipient_name)
                          ? form.recipient_name
                          : ""
                      }
                      onValueChange={(v) => {
                        if (v && v !== "custom") {
                           setForm((prev) => ({ ...prev, recipient_name: v }));
                        }
                      }}
                    >
                      <SelectTrigger id="finance-recipient-staff" aria-label="Choose registered staff member" className="h-10 text-xs">
                        <SelectValue placeholder="Choose registered staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainers
                          .filter((t) => t.role === "staff")
                          .map((t) => (
                            <SelectItem key={t.id} value={t.name}>
                              {t.name} {t.bio ? `(${t.bio.slice(0, 20)})` : "(Staff)"}
                            </SelectItem>
                          ))}
                        <SelectItem value="custom">Other / Manual Designation</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input aria-label="Or enter designation: Front Desk, Housekeeping, Manager" id="finance-or-enter-designation-front-desk-housekeeping-manager" name="recipient_name"
                      autoComplete="off"
                      value={form.recipient_name}
                      onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
                      placeholder="Or enter designation: Front Desk, Housekeeping, Manager"
                      className="h-10 text-xs"
                    />
                  </div>
                ) : (
                  <Input aria-label="e.g. Front Desk, Housekeeping, Floor Manager" id="finance-e-g-front-desk-housekeeping-floor-manager" name="recipient_name"
                    autoComplete="off"
                    value={form.recipient_name}
                    onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
                    placeholder="e.g. Front Desk, Housekeeping, Floor Manager"
                    className="mt-1.5 h-10 text-xs"
                  />
                )}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="finance-payment-method">Payment Method</Label>
            <Select name="payment_method" value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
              <SelectTrigger id="finance-payment-method" className="mt-1.5 capitalize"><SelectValue /></SelectTrigger>
              <SelectContent>
                {paymentMethods.map((m) => (
                  <SelectItem key={m} value={m} className="capitalize">{m.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="finance-date">Date</Label>
            <Input id="finance-date" name="date" autoComplete="off" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="finance-description">Description</Label>
            <Input id="finance-description" name="description" autoComplete="off" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5" placeholder="Optional note" />
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-primary text-primary-foreground h-11">
            {saving ? "Saving..." : "Add Transaction"}
          </Button>
        </form>
      </Sheet>
    </div>
  );
}
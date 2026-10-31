import React, { useEffect, useMemo, useState } from "react";
import { client } from "@/api/client";
import { format, addMonths, differenceInDays } from "date-fns";
import { Check, Crown, CreditCard, Receipt, AlertTriangle, RefreshCw, Users, Dumbbell, CalendarClock } from "lucide-react";
import { PageHeader, Badge, EmptyState, MobileBottomSheet } from "@/components/ui-shared";
import { DetailSection, DetailRow } from "@/components/record-ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  BILLING_CYCLES,
  CRM_PLANS,
  SUBSCRIPTION_STATUS_META,
  SUBSCRIPTION_PAYMENT_METHODS,
  getCrmPlan,
  planPrice,
} from "@/data";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmt = (d) => {
  const dt = d ? new Date(d) : null;
  return dt && !Number.isNaN(dt.getTime()) ? format(dt, "dd MMM yyyy") : "—";
};

function UsageMeter({ icon: Icon, label, used, limit }) {
  const unlimited = limit === null || limit === undefined;
  const pct = unlimited ? 8 : Math.min(100, Math.round((used / limit) * 100));
  const tone = unlimited ? "bg-primary" : pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-primary";
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="flex items-center gap-1.5 font-semibold text-foreground">
          <Icon className="w-3.5 h-3.5 text-primary" /> {label}
        </span>
        <span className="font-bold text-foreground">
          {used} <span className="text-muted-foreground font-medium">/ {unlimited ? "Unlimited" : limit}</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      {!unlimited && used > limit && (
        <p className="text-[11px] text-red-600 dark:text-red-400 mt-1.5 font-medium">Over limit — upgrade to add more.</p>
      )}
    </div>
  );
}

export default function Subscription() {
  const { toast } = useToast();
  const [sub, setSub] = useState(null);
  const [usage, setUsage] = useState({ members: 0, staff: 0 });
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState("monthly");
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [payMethod, setPayMethod] = useState("upi");
  const [payLabel, setPayLabel] = useState("");
  const [paying, setPaying] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [subs, members, team] = await Promise.all([
          client.entities.Subscription.list("-created_date", 5),
          client.entities.Member.list("-created_date", 2000),
          client.entities.Trainer.list("-created_date", 500),
        ]);
        const current = subs[0] || null;
        setSub(current);
        if (current) setCycle(current.billing_cycle || "monthly");
        setUsage({ members: members.length, staff: team.length });
      } catch (e) {
        console.error(e);
        toast({ title: "Failed to load subscription", description: e.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currentPlan = sub ? getCrmPlan(sub.plan_id) : null;
  const daysLeft = sub?.renews_on ? differenceInDays(new Date(sub.renews_on), new Date()) : null;
  const meta = SUBSCRIPTION_STATUS_META[sub?.status] || SUBSCRIPTION_STATUS_META.active;
  const invoices = useMemo(() => [...(sub?.invoices || [])].sort((a, b) => String(b.date).localeCompare(String(a.date))), [sub]);

  const openCheckout = (plan) => {
    setCheckoutPlan(plan);
    setPayMethod(sub?.payment_method || "upi");
    setPayLabel(sub?.payment_label || "");
  };

  const handleCheckout = async () => {
    if (!checkoutPlan) return;
    setPaying(true);
    try {
      const amount = planPrice(checkoutPlan, cycle);
      const months = BILLING_CYCLES.find((c) => c.id === cycle)?.months || 1;
      const now = new Date();
      const invoice = {
        id: `INV-${now.getFullYear()}-${String((sub?.invoices?.length || 0) + 1).padStart(4, "0")}`,
        date: format(now, "yyyy-MM-dd"),
        plan_name: checkoutPlan.name,
        cycle,
        amount,
        status: "paid",
        method: payMethod,
      };
      const patch = {
        plan_id: checkoutPlan.id,
        billing_cycle: cycle,
        status: "active",
        auto_renew: true,
        started_on: sub?.started_on || format(now, "yyyy-MM-dd"),
        renews_on: format(addMonths(now, months), "yyyy-MM-dd"),
        payment_method: payMethod,
        payment_label: payLabel.trim(),
        invoices: [invoice, ...(sub?.invoices || [])],
      };
      const saved = sub
        ? await client.entities.Subscription.update(sub.id, patch)
        : await client.entities.Subscription.create(patch);
      setSub(saved);
      setCheckoutPlan(null);
      toast({ title: `${checkoutPlan.name} plan activated`, description: `${inr(amount)} paid • renews on ${fmt(patch.renews_on)}.` });
    } catch (e) {
      toast({ title: "Payment failed", description: e.message, variant: "destructive" });
    } finally {
      setPaying(false);
    }
  };

  const updateSub = async (patch, title, description) => {
    try {
      const saved = await client.entities.Subscription.update(sub.id, patch);
      setSub(saved);
      toast({ title, description });
    } catch (e) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };

  const handleCancel = async () => {
    await updateSub(
      { status: "cancelled", auto_renew: false },
      "Subscription cancelled",
      `You can keep using Fitaval CRM until ${fmt(sub.renews_on)}.`
    );
    setCancelOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const checkoutAmount = checkoutPlan ? planPrice(checkoutPlan, cycle) : 0;
  const isChange = (p) => sub && p.id !== sub.plan_id;
  const planRank = (id) => CRM_PLANS.findIndex((p) => p.id === id);

  return (
    <div className="space-y-4">
      <PageHeader title="Subscription" subtitle="Your Fitaval CRM plan & billing" backTo="/settings" />

      {/* Current plan */}
      {sub && currentPlan ? (
        <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-5 shadow-sm border border-slate-800/80 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-primary/90 flex items-center justify-center shrink-0">
                <Crown className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-white/60 font-semibold">Current plan</p>
                <p className="font-extrabold text-xl leading-tight">{currentPlan.name}</p>
              </div>
            </div>
            <Badge variant={meta.badge} className="shrink-0">{meta.label}</Badge>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-2xl font-black">
                {inr(planPrice(currentPlan, sub.billing_cycle))}
                <span className="text-xs font-medium text-white/60"> / {sub.billing_cycle === "yearly" ? "year" : "month"}</span>
              </p>
              <p className="text-xs text-white/70 mt-0.5 flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5" />
                {sub.status === "cancelled" ? "Access ends" : "Renews"} on {fmt(sub.renews_on)}
                {daysLeft !== null && daysLeft >= 0 && ` (${daysLeft} day${daysLeft === 1 ? "" : "s"})`}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            {sub.status === "cancelled" ? (
              <Button
                onClick={() => updateSub({ status: "active", auto_renew: true }, "Subscription resumed", "Auto-renewal is back on.")}
                className="flex-1 h-10 rounded-xl text-xs font-bold bg-primary text-primary-foreground"
              >
                <RefreshCw className="w-4 h-4 mr-1.5" /> Resume subscription
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => updateSub({ auto_renew: !sub.auto_renew }, sub.auto_renew ? "Auto-renew off" : "Auto-renew on", sub.auto_renew ? "Your plan won't renew automatically." : "Your plan will renew automatically.")}
                  className="flex-1 h-10 rounded-xl text-xs font-bold"
                >
                  Auto-renew: {sub.auto_renew ? "On" : "Off"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCancelOpen(true)}
                  className="h-10 rounded-xl text-xs font-bold bg-transparent border-white/25 text-white hover:bg-white/10 hover:text-white"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <EmptyState icon={Crown} title="No active subscription" description="Choose a plan below to unlock Fitaval CRM for your gym." />
      )}

      {/* Usage */}
      {currentPlan && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <UsageMeter icon={Users} label="Members" used={usage.members} limit={currentPlan.limits.members} />
          <UsageMeter icon={Dumbbell} label="Trainers & Staff" used={usage.staff} limit={currentPlan.limits.staff} />
        </div>
      )}

      {/* Billing cycle toggle */}
      <div className="space-y-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Choose a plan</p>
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border">
          {BILLING_CYCLES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCycle(c.id)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                cycle === c.id ? "bg-card text-foreground shadow-xs border border-border/80" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
              {c.note && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">{c.note}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="space-y-3">
        {CRM_PLANS.map((p) => {
          const isCurrent = sub?.plan_id === p.id && sub?.billing_cycle === cycle && sub?.status !== "cancelled";
          const price = planPrice(p, cycle);
          const label = isCurrent
            ? "Current plan"
            : !sub
            ? "Subscribe"
            : sub.plan_id === p.id
            ? `Switch to ${cycle}`
            : planRank(p.id) > planRank(sub.plan_id)
            ? "Upgrade"
            : "Downgrade";
          return (
            <div
              key={p.id}
              className={`rounded-2xl bg-card border p-4 shadow-xs space-y-3 ${p.popular ? "border-primary/60 ring-1 ring-primary/30" : "border-border"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    {p.name}
                    {p.popular && <Badge variant="primary">Most popular</Badge>}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.tagline}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-black text-foreground">{inr(price)}</p>
                  <p className="text-[11px] text-muted-foreground">/ {cycle === "yearly" ? "year" : "month"}</p>
                </div>
              </div>
              <div className="space-y-1.5 pt-1 border-t border-border/60">
                {p.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-xs text-foreground/90">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Button
                disabled={isCurrent}
                onClick={() => openCheckout(p)}
                variant={isCurrent ? "outline" : "default"}
                className={`w-full h-11 rounded-xl text-xs font-bold ${isCurrent ? "" : "bg-primary text-primary-foreground"}`}
              >
                {isCurrent && <Check className="w-4 h-4 mr-1.5" />}
                {label}
              </Button>
              {isChange(p) && (p.limits.members !== null && usage.members > p.limits.members) && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  You currently have {usage.members} members, above this plan's limit of {p.limits.members}.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment method */}
      {sub && (
        <DetailSection title="Payment method" icon={CreditCard}>
          <DetailRow label="Method" value={SUBSCRIPTION_PAYMENT_METHODS.find((m) => m.value === sub.payment_method)?.label || sub.payment_method} />
          <DetailRow label="Details" value={sub.payment_label} />
          <DetailRow label="Subscribed since" value={fmt(sub.started_on)} />
          <DetailRow label="Auto-renew" value={sub.auto_renew ? "On" : "Off"} />
        </DetailSection>
      )}

      {/* Billing history */}
      <DetailSection title="Billing history" icon={Receipt}>
        {invoices.length === 0 ? (
          <p className="text-xs text-muted-foreground">No invoices yet.</p>
        ) : (
          invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0 text-xs">
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{inv.id}</p>
                <p className="text-[11px] text-muted-foreground">
                  {fmt(inv.date)} • {inv.plan_name} ({inv.cycle})
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-foreground">{inr(inv.amount)}</p>
                <Badge variant={inv.status === "paid" ? "green" : "amber"} className="capitalize mt-0.5">{inv.status}</Badge>
              </div>
            </div>
          ))
        )}
      </DetailSection>

      <p className="text-center text-[11px] text-muted-foreground">
        Demo billing — no real payment is taken.
      </p>

      {/* Checkout */}
      <MobileBottomSheet open={Boolean(checkoutPlan)} onClose={() => !paying && setCheckoutPlan(null)} title={checkoutPlan ? `${sub ? "Change to" : "Subscribe to"} ${checkoutPlan.name}` : ""}>
        {checkoutPlan && (
          <div className="space-y-4 pb-2">
            <div className="rounded-2xl bg-muted/50 border border-border p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="font-semibold">{checkoutPlan.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Billing</span><span className="font-semibold capitalize">{cycle}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Renews on</span><span className="font-semibold">{fmt(addMonths(new Date(), BILLING_CYCLES.find((c) => c.id === cycle)?.months || 1))}</span></div>
              <div className="flex justify-between pt-1.5 border-t border-border text-sm"><span className="font-bold">Total today</span><span className="font-black text-primary">{inr(checkoutAmount)}</span></div>
            </div>
            <div>
              <Label htmlFor="subscription-payment-method" className="text-xs font-semibold">Payment method</Label>
              <Select name="payment_method" value={payMethod} onValueChange={setPayMethod}>
                <SelectTrigger id="subscription-payment-method" className="mt-1 rounded-xl h-11 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subscription-payLabel" className="text-xs font-semibold">
                {payMethod === "upi" ? "UPI ID" : payMethod === "card" ? "Card (last 4 digits)" : "Bank name"}
              </Label>
              <Input id="subscription-payLabel" name="payLabel"
                autoComplete="off"
                value={payLabel}
                onChange={(e) => setPayLabel(e.target.value)}
                placeholder={payMethod === "upi" ? "name@bank" : payMethod === "card" ? "•••• 4242" : "HDFC Bank"}
                className="mt-1 rounded-xl h-11 text-xs"
              />
            </div>
            <Button onClick={handleCheckout} disabled={paying} className="w-full h-12 rounded-xl text-sm font-bold bg-primary text-primary-foreground">
              {paying ? "Processing..." : `Pay ${inr(checkoutAmount)}`}
            </Button>
          </div>
        )}
      </MobileBottomSheet>

      {/* Cancel */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent className="rounded-3xl bg-card border border-border max-w-sm">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-1">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-foreground">Cancel subscription?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Your plan stays active until <strong className="text-foreground">{fmt(sub?.renews_on)}</strong> and will not renew after that.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-3 gap-2">
            <AlertDialogCancel className="rounded-xl h-11 border-border text-xs font-semibold">Keep plan</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="rounded-xl h-11 bg-red-600 text-white text-xs font-bold">
              Cancel subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

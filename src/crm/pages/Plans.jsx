import React, { useEffect, useState, useMemo } from "react";
import { client } from "@/api/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Tag,
  Plus,
  IndianRupee,
  Check,
  Edit2,
  Trash2,
  AlertTriangle,
  Users,
  X,
} from "lucide-react";
import {
  EmptyState,
  PageHeader,
  MobileBottomSheet,
  MobileFullFormPanel,
} from "@/components/ui-shared";
import {
  RecordMoreButton,
  clickableCardProps,
  ActionSheetItem,
  DetailPanel,
  DetailSection,
  DetailRow,
  InfoTile,
} from "@/components/record-ui";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { DURATION_UNITS, POPULAR_PLAN_BENEFITS } from "@/data";

/**
 * Safely parse plan benefits from JSON string, array, or newline-delimited text.
 * Each benefit is normalized to { title: string, description: string }.
 */
export function parseBenefits(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((b) =>
      typeof b === "string"
        ? { title: b, description: "" }
        : { title: b?.title || "", description: b?.description || "" }
    );
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((b) =>
          typeof b === "string"
            ? { title: b, description: "" }
            : { title: b?.title || "", description: b?.description || "" }
        );
      }
    } catch {
      return raw
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const dashIdx = line.indexOf(" - ");
          if (dashIdx !== -1) {
            return {
              title: line.substring(0, dashIdx).trim(),
              description: line.substring(dashIdx + 3).trim(),
            };
          }
          const colonIdx = line.indexOf(": ");
          if (colonIdx !== -1) {
            return {
              title: line.substring(0, colonIdx).trim(),
              description: line.substring(colonIdx + 2).trim(),
            };
          }
          return { title: line, description: "" };
        });
    }
  }
  return [];
}

/**
 * Tactile Toggle Switch component matching visual reference:
 * - Green recessed track with green-ringed knob when ON (Active)
 * - Grey recessed track with grey-ringed knob when OFF (Inactive)
 * - Knob protrudes vertically above and below track with soft shadow
 */
export function PlanStatusRadioToggle({
  active = true,
  onChange,
  disabled = false,
  size = "sm",
}) {
  const isLarge = size === "md";

  const trackWidth = isLarge ? "w-[60px]" : "w-[52px]";
  const trackHeight = isLarge ? "h-[28px]" : "h-[24px]";
  const knobSize = isLarge ? "w-[36px] h-[36px]" : "w-[30px] h-[30px]";
  const knobBorder = isLarge ? "border-[3.5px]" : "border-[3px]";
  const knobTranslate = isLarge ? "translate-x-[28px]" : "translate-x-[24px]";

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!disabled && onChange) {
      onChange(!active);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && onChange) {
        onChange(!active);
      }
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={active ? "Plan active (ON)" : "Plan inactive (OFF)"}
      disabled={disabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      title={active ? "Active: Click to turn OFF" : "Inactive: Click to turn ON"}
      className={`relative inline-flex items-center shrink-0 cursor-pointer select-none p-0 bg-transparent border-0 outline-hidden focus-visible:ring-2 focus-visible:ring-primary/60 rounded-full transition-opacity touch-manipulation ${
        disabled ? "opacity-60 pointer-events-none cursor-not-allowed" : ""
      }`}
    >
      {/* Recessed Pill Track */}
      <span
        className={`block rounded-full transition-colors duration-200 ease-in-out ${trackWidth} ${trackHeight} ${
          active
            ? "bg-[#38b54a] dark:bg-emerald-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.32)]"
            : "bg-[#d8dcdf] dark:bg-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
        }`}
      />

      {/* Tactile Circular Knob with colored ring matching image */}
      <span
        aria-hidden="true"
        className={`absolute left-[-2px] top-1/2 -translate-y-1/2 rounded-full bg-[#e3e6e8] dark:bg-slate-200 shadow-[0_2px_5px_rgba(0,0,0,0.25)] transition-all duration-200 ease-in-out ${knobSize} ${knobBorder} ${
          active
            ? `${knobTranslate} border-[#38b54a] dark:border-emerald-500`
            : "translate-x-0 border-[#9ba1a6] dark:border-slate-400"
        }`}
      />
    </button>
  );
}

export default function Plans() {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'on' | 'off'

  // Mobile Bottom Action Sheet for "⋮"
  const [actionSheetPlan, setActionSheetPlan] = useState(null);

  // Full Screen Mobile Panels
  const [formPanelOpen, setFormPanelOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewPanelOpen, setViewPanelOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [benefitTitle, setBenefitTitle] = useState("");
  const [benefitDesc, setBenefitDesc] = useState("");

  const initialForm = {
    id: null,
    name: "",
    price: "",
    duration_value: "30",
    duration_unit: "Days",
    duration_days: 30,
    benefitsList: [],
    is_active: true,
  };
  const [form, setForm] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [p, m] = await Promise.all([
        client.entities.MembershipPlan.list("-created_date", 100),
        client.entities.Member.list("-created_date", 500),
      ]);
      setPlans(p);
      setMembers(m);
    } catch (e) {
      console.error(e);
      toast({
        title: "Failed to load plans",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const memberCountByPlan = useMemo(() => {
    const counts = {};
    members.forEach((m) => {
      if (m.plan_id) {
        counts[m.plan_id] = (counts[m.plan_id] || 0) + 1;
      }
    });
    return counts;
  }, [members]);

  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      if (filterStatus === "on") return p.is_active;
      if (filterStatus === "off") return !p.is_active;
      return true;
    });
  }, [plans, filterStatus]);

  const calculateDays = (value, unit) => {
    const val = parseInt(value, 10) || 1;
    switch (unit) {
      case "Weeks":
        return val * 7;
      case "Months":
        return val * 30;
      case "Years":
        return val * 365;
      case "Days":
      default:
        return val;
    }
  };

  const openAddForm = () => {
    setForm({
      ...initialForm,
      benefitsList: [
        {
          title: "Unlimited Gym Access",
          description: "Full daily access to cardio and strength training equipment",
        },
        {
          title: "Locker & Shower Facilities",
          description: "Complimentary day locker and clean shower room access",
        },
        {
          title: "Free Body Assessment",
          description: "1 initial body composition and fitness assessment with trainer",
        },
      ],
    });
    setBenefitTitle("");
    setBenefitDesc("");
    setIsEditMode(false);
    setFormPanelOpen(true);
  };

  const openEditForm = (plan) => {
    const list = parseBenefits(plan.benefits);

    setForm({
      id: plan.id,
      name: plan.name || "",
      price: plan.price?.toString() || "",
      duration_value: plan.duration_value?.toString() || plan.duration_days?.toString() || "30",
      duration_unit: plan.duration_unit || "Days",
      duration_days: plan.duration_days || 30,
      benefitsList: list,
      is_active: plan.is_active ?? true,
    });
    setBenefitTitle("");
    setBenefitDesc("");
    setIsEditMode(true);
    setActionSheetPlan(null);
    setFormPanelOpen(true);
    if (viewPanelOpen) setViewPanelOpen(false);
  };

  const openViewProfile = (plan) => {
    setSelectedPlan(plan);
    setActionSheetPlan(null);
    setViewPanelOpen(true);
  };

  const handleAddBenefit = () => {
    const trimmedTitle = benefitTitle.trim();
    const trimmedDesc = benefitDesc.trim();
    if (!trimmedTitle) return;

    setForm((prev) => ({
      ...prev,
      benefitsList: [
        ...prev.benefitsList,
        { title: trimmedTitle, description: trimmedDesc },
      ],
    }));
    setBenefitTitle("");
    setBenefitDesc("");
  };

  const handleRemoveBenefit = (index) => {
    setForm((prev) => ({
      ...prev,
      benefitsList: prev.benefitsList.filter((_, i) => i !== index),
    }));
  };

  const handleSavePlan = async (e) => {
    if (e) e.preventDefault();
    if (!form.name.trim() || !form.price) {
      toast({
        title: "Validation error",
        description: "Plan name and price are required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const durationDays = calculateDays(form.duration_value, form.duration_unit);
      const combinedBenefits = JSON.stringify(form.benefitsList);

      const payload = {
        name: form.name.trim(),
        price: parseFloat(form.price) || 0,
        duration_value: parseInt(form.duration_value, 10) || 1,
        duration_unit: form.duration_unit,
        duration_days: durationDays,
        benefits: combinedBenefits,
        is_active: form.is_active,
        updated_date: format(new Date(), "yyyy-MM-dd"),
      };

      if (isEditMode && form.id) {
        const updated = await client.entities.MembershipPlan.update(form.id, payload);
        setPlans((prev) => prev.map((p) => (p.id === form.id ? updated : p)));
        if (selectedPlan?.id === form.id) setSelectedPlan(updated);
        toast({
          title: "Plan updated",
          description: `${updated.name} updated successfully.`,
        });
      } else {
        const created = await client.entities.MembershipPlan.create(payload);
        setPlans((prev) => [created, ...prev]);
        toast({
          title: "Plan created",
          description: `${created.name} is now available.`,
        });
      }

      setFormPanelOpen(false);
    } catch (err) {
      toast({ title: "Failed to save plan", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePlanStatusChange = async (plan, newStatus) => {
    if (Boolean(plan.is_active) === Boolean(newStatus)) return;
    try {
      const updated = await client.entities.MembershipPlan.update(plan.id, {
        is_active: newStatus,
      });
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? updated : p)));
      if (selectedPlan?.id === plan.id) setSelectedPlan(updated);
      toast({
        title: newStatus ? "Plan Toggled ON" : "Plan Toggled OFF",
        description: `${plan.name} is now ${newStatus ? "Active (ON)" : "Inactive (OFF)"}.`,
      });
    } catch (err) {
      toast({
        title: "Status update failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const toggleActive = (plan) => {
    handlePlanStatusChange(plan, !plan.is_active);
    setActionSheetPlan(null);
  };

  const promptDeletePlan = (plan) => {
    setPlanToDelete(plan);
    setActionSheetPlan(null);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    setDeleting(true);
    try {
      await client.entities.MembershipPlan.delete(planToDelete.id);
      setPlans((prev) => prev.filter((p) => p.id !== planToDelete.id));
      if (selectedPlan?.id === planToDelete.id) {
        setViewPanelOpen(false);
        setSelectedPlan(null);
      }
      toast({ title: "Plan deleted", description: `${planToDelete.name} was removed.` });
      setDeleteConfirmOpen(false);
      setPlanToDelete(null);
    } catch (err) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeactivateInstead = async () => {
    if (!planToDelete) return;
    setDeleting(true);
    try {
      const updated = await client.entities.MembershipPlan.update(planToDelete.id, {
        is_active: false,
      });
      setPlans((prev) => prev.map((p) => (p.id === planToDelete.id ? updated : p)));
      if (selectedPlan?.id === planToDelete.id) setSelectedPlan(updated);
      toast({
        title: "Plan deactivated",
        description: `${planToDelete.name} is now marked inactive.`,
      });
      setDeleteConfirmOpen(false);
      setPlanToDelete(null);
    } catch (err) {
      toast({ title: "Error deactivating", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
        <p className="text-xs text-muted-foreground font-medium">Loading Plans...</p>
      </div>
    );
  }

  const assignedMembersCount = planToDelete ? memberCountByPlan[planToDelete.id] || 0 : 0;

  return (
    <div className="space-y-3.5">
      {/* Mobile-First Header: ← Membership Plans     + */}
      <PageHeader
        title="Membership Plans"
        subtitle={`${plans.length} total plans`}
        backTo="/settings"
        action={
          <button
            type="button"
            onClick={openAddForm}
            className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm hover:bg-primary/90 transition-all active:scale-95 touch-manipulation"
            aria-label="Add Plan"
          >
            <Plus className="w-5 h-5" strokeWidth={2.6} />
          </button>
        }
      />

      {/* Quick Status Filter Tabs: [All] [● ON] [○ OFF] */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { key: "all", label: `All (${plans.length})` },
          { key: "on", label: `● ON (${plans.filter((p) => p.is_active).length})` },
          { key: "off", label: `○ OFF (${plans.filter((p) => !p.is_active).length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
              filterStatus === tab.key
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Full-Width Mobile Plan Cards Stack */}
      {filteredPlans.length === 0 ? (
        <EmptyState
          icon={Tag}
          title={plans.length === 0 ? "No membership plans yet" : `No ${filterStatus.toUpperCase()} plans found`}
          description={
            plans.length === 0
              ? "Create membership tiers with custom pricing, durations, and included benefits."
              : `There are currently no plans in the ${filterStatus.toUpperCase()} status.`
          }
          action={
            plans.length === 0 ? (
              <Button onClick={openAddForm} className="bg-primary text-white rounded-xl h-11 px-5 text-xs font-bold">
                <Plus className="w-4 h-4 mr-1.5" />
                Create Plan
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setFilterStatus("all")}
                className="rounded-xl h-10 px-4 text-xs font-semibold"
              >
                Show All Plans
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredPlans.map((p) => {
            const memberCount = memberCountByPlan[p.id] || 0;
            const benefitsList = parseBenefits(p.benefits);

            return (
              <div
                key={p.id}
                {...clickableCardProps(() => openViewProfile(p))}
                className="w-full rounded-2xl bg-card border border-border p-4 shadow-xs flex flex-col gap-3 transition-all cursor-pointer hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                {/* 1. Top row: Name + Radio Toggle Left (OFF) / Right (ON) */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        p.is_active ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"
                      }`}
                    />
                    <h3 className="font-bold text-base text-foreground truncate">
                      {p.name}
                    </h3>
                  </div>

                  {/* Radio button toggle: Left (OFF) and Right (ON) */}
                  <div className="flex items-center gap-3 shrink-0">
                    <PlanStatusRadioToggle
                      active={Boolean(p.is_active)}
                      onChange={(newVal) => handlePlanStatusChange(p, newVal)}
                    />
                    <RecordMoreButton onClick={() => setActionSheetPlan(p)} />
                  </div>
                </div>

                {/* 2. Price and Duration */}
                <div className="flex items-baseline justify-between pt-1 border-t border-border/60">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black text-foreground">
                      ₹{(p.price || 0).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      / {p.duration_days} days
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    {memberCount} active {memberCount === 1 ? "member" : "members"}
                  </span>
                </div>

                {/* 3. Included Benefits List */}
                {benefitsList.length > 0 && (
                  <div className="space-y-1.5 pt-1 text-xs text-foreground/85">
                    {benefitsList.slice(0, 3).map((b, i) => (
                      <div key={i} className="flex items-start gap-1.5 min-w-0">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <div className="min-w-0 truncate">
                          <span className="font-medium text-foreground truncate">{b.title}</span>
                          {b.description && (
                            <span className="text-[11px] text-muted-foreground ml-1.5 truncate hidden sm:inline">
                              • {b.description}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {benefitsList.length > 3 && (
                      <p className="text-[11px] text-primary font-bold pl-5">
                        +{benefitsList.length - 3} more perks
                      </p>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Plan Action Bottom Sheet */}
      <MobileBottomSheet
        open={Boolean(actionSheetPlan)}
        onClose={() => setActionSheetPlan(null)}
        title={actionSheetPlan?.name || "Plan Actions"}
      >
        <div className="space-y-1 pb-2">
          <ActionSheetItem
            icon={Edit2}
            label="Edit Plan"
            onClick={() => actionSheetPlan && openEditForm(actionSheetPlan)}
          />
          <div className="pt-2 mt-1 border-t border-border">
            <ActionSheetItem
              icon={Trash2}
              tone="danger"
              label="Delete Plan"
              onClick={() => actionSheetPlan && promptDeletePlan(actionSheetPlan)}
            />
          </div>
        </div>
      </MobileBottomSheet>

      {/* Full-Screen Add / Edit Plan Panel */}
      <MobileFullFormPanel
        open={formPanelOpen}
        onClose={() => setFormPanelOpen(false)}
        title={isEditMode ? "Edit Membership Plan" : "Add Membership Plan"}
        subtitle="Configure pricing, duration and member perks"
        submitLabel={isEditMode ? "Save Plan" : "Create Plan"}
        onSubmit={handleSavePlan}
        isSubmitting={saving}
      >
        <form onSubmit={handleSavePlan} className="space-y-4">
          <div>
            <Label htmlFor="plans-plan-name" className="text-xs font-semibold">Plan Name *</Label>
            <Input id="plans-plan-name" name="name"
              autoComplete="off"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="e.g. Annual Elite"
              className="mt-1 rounded-xl h-11 text-xs sm:text-sm"
            />
          </div>

          <div>
            <Label htmlFor="plans-price" className="text-xs font-semibold">Price (₹) *</Label>
            <div className="relative mt-1">
              <IndianRupee className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input id="plans-price" name="price"
                autoComplete="off"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                placeholder="11999"
                className="pl-9 rounded-xl h-11 text-xs sm:text-sm font-semibold"
              />
            </div>
          </div>

          {/* Duration Value and Unit */}
          <div>
            <Label htmlFor="plans-duration-length" className="text-xs font-semibold">Duration Length *</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Input id="plans-duration-length" name="duration_value"
                autoComplete="off"
                type="number"
                min="1"
                value={form.duration_value}
                onChange={(e) => setForm({ ...form, duration_value: e.target.value })}
                required
                placeholder="30"
                className="rounded-xl h-11 text-xs"
              />
              <Select name="duration_unit"
                value={form.duration_unit}
                onValueChange={(val) => setForm({ ...form, duration_unit: val })}
              >
                <SelectTrigger id="plans-duration-unit" aria-label="Duration unit" className="rounded-xl h-11 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_UNITS.map((u) => (
                    <SelectItem key={u.unit} value={u.unit}>
                      {u.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">
              Calculates to {calculateDays(form.duration_value, form.duration_unit)} total days.
            </p>
          </div>

          {/* Benefits & Perks with Title and Description */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Benefits & Perks</span>
              <span className="text-[11px] text-muted-foreground font-medium">
                {form.benefitsList.length} {form.benefitsList.length === 1 ? "perk" : "perks"} added
              </span>
            </div>

            {/* Inputs: Title and Perk Description */}
            <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-2">
              <div>
                <Label htmlFor="plans-perk-benefit-title" className="text-[11px] font-semibold text-foreground">
                  Perk / Benefit Title <span className="text-red-500">*</span>
                </Label>
                <Input id="plans-perk-benefit-title" name="benefitTitle"
                  autoComplete="off"
                  value={benefitTitle}
                  onChange={(e) => setBenefitTitle(e.target.value)}
                  placeholder="e.g. Steam & Sauna Recovery"
                  className="rounded-xl h-10 text-xs mt-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddBenefit();
                    }
                  }}
                />
              </div>

              <div>
                <Label htmlFor="plans-perk-description-details" className="text-[11px] font-semibold text-foreground">
                  Perk Description / Details
                </Label>
                <Input id="plans-perk-description-details" name="benefitDesc"
                  autoComplete="off"
                  value={benefitDesc}
                  onChange={(e) => setBenefitDesc(e.target.value)}
                  placeholder="e.g. Unlimited post-workout recovery zone access"
                  className="rounded-xl h-10 text-xs mt-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddBenefit();
                    }
                  }}
                />
              </div>

              <div className="pt-1 flex justify-end">
                <Button
                  type="button"
                  onClick={handleAddBenefit}
                  disabled={!benefitTitle.trim()}
                  className="bg-primary text-white rounded-xl px-4 text-xs font-bold h-9 gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Benefit
                </Button>
              </div>
            </div>

            {/* Popular perks quick suggestion pills */}
            {POPULAR_PLAN_BENEFITS && POPULAR_PLAN_BENEFITS.length > 0 && (
              <div className="pt-1">
                <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                  Popular suggestions:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_PLAN_BENEFITS.map((p, i) => {
                    const title = typeof p === "string" ? p : p.title;
                    const desc = typeof p === "string" ? "" : p.description;
                    const alreadyAdded = form.benefitsList.some(
                      (item) => item.title.toLowerCase() === title.toLowerCase()
                    );
                    if (alreadyAdded) return null;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            benefitsList: [...prev.benefitsList, { title, description: desc }],
                          }));
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-muted hover:bg-primary/10 hover:text-primary transition-colors border border-border"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Added Benefits List */}
            {form.benefitsList.length > 0 && (
              <div className="mt-2 space-y-2">
                {form.benefitsList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-2.5 p-2.5 rounded-xl bg-card border border-border text-xs"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground block truncate">
                          {item.title}
                        </span>
                        {item.description && (
                          <span className="text-[11px] text-muted-foreground block leading-relaxed mt-0.5">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(idx)}
                      className="text-muted-foreground hover:text-red-600 p-1 shrink-0"
                      title="Remove perk"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border">
            <div>
              <span className="text-xs font-bold text-foreground block">
                Plan Availability
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {form.is_active ? "Status: ON (Active)" : "Status: OFF (Inactive)"}
              </p>
            </div>
            <PlanStatusRadioToggle
              active={Boolean(form.is_active)}
              onChange={(val) => setForm((prev) => ({ ...prev, is_active: val }))}
              size="md"
            />
          </div>
        </form>
      </MobileFullFormPanel>

      {/* View Plan Details */}
      {selectedPlan && (() => {
        const pl = selectedPlan;
        const benefits = parseBenefits(pl.benefits);
        const enrolled = memberCountByPlan[pl.id] || 0;
        const durationLabel = pl.duration_value
          ? `${pl.duration_value} ${pl.duration_unit || "Days"}`
          : `${pl.duration_days} Days`;
        return (
          <DetailPanel
            open={viewPanelOpen}
            onClose={() => setViewPanelOpen(false)}
            eyebrow="Membership Plan"
            title={pl.name}
            onEdit={() => openEditForm(pl)}
            onDelete={() => promptDeletePlan(pl)}
            onMore={() => setActionSheetPlan(pl)}
            footer={
              <>
                <Button
                  variant="outline"
                  onClick={() => openEditForm(pl)}
                  className="flex-1 rounded-xl h-11 text-xs font-bold border-border text-foreground hover:bg-muted"
                >
                  <Edit2 className="w-4 h-4 mr-1.5" /> Edit Plan
                </Button>
                <Button
                  onClick={() => handlePlanStatusChange(pl, !pl.is_active)}
                  className={`flex-1 rounded-xl h-11 text-xs font-bold text-white transition-colors ${
                    pl.is_active ? "bg-slate-800 hover:bg-slate-900" : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {pl.is_active ? "Deactivate Plan" : "Activate Plan"}
                </Button>
              </>
            }
          >
            <div className="p-4 bg-card rounded-2xl border border-border flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-extrabold text-2xl text-foreground">
                  ₹{(pl.price || 0).toLocaleString("en-IN")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Valid for {pl.duration_days} days
                </p>
              </div>
              <PlanStatusRadioToggle
                active={Boolean(pl.is_active)}
                onChange={(val) => handlePlanStatusChange(pl, val)}
                size="md"
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <InfoTile label="Duration" value={durationLabel} />
              <InfoTile label="Members" value={enrolled} />
              <InfoTile
                label="Status"
                value={pl.is_active ? "Active" : "Inactive"}
                tone={pl.is_active ? "green" : "red"}
              />
            </div>

            <DetailSection title={`Included Benefits & Perks (${benefits.length})`} icon={Check}>
              {benefits.length > 0 ? (
                benefits.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0 border-b border-border/50 last:border-b-0 text-xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-foreground block">{b.title}</span>
                      {b.description && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          {b.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No benefits listed.</p>
              )}
            </DetailSection>

            <DetailSection title="Plan Info" icon={Users}>
              <DetailRow label="Enrolled members" value={`${enrolled}`} />
              <DetailRow label="Price per cycle" value={`₹${(pl.price || 0).toLocaleString("en-IN")}`} />
              <DetailRow label="Duration" value={durationLabel === `${pl.duration_days} Days` ? durationLabel : `${durationLabel} (${pl.duration_days} days)`} />
              <DetailRow label="Created" value={pl.created_date} />
            </DetailSection>
          </DetailPanel>
        );
      })()}

      {/* Delete / Deactivate Plan Alert Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="rounded-3xl bg-card border border-border max-w-sm">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-1">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              {assignedMembersCount > 0 ? "Plan Has Active Members" : "Delete Membership Plan?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {assignedMembersCount > 0 ? (
                <>
                  This plan is currently assigned to{" "}
                  <strong className="text-foreground">{assignedMembersCount} members</strong>. We
                  recommend deactivating it instead of deleting.
                </>
              ) : (
                <>
                  Are you sure you want to permanently delete{" "}
                  <strong className="text-foreground">{planToDelete?.name}</strong>?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-3 gap-2">
            <AlertDialogCancel
              disabled={deleting}
              className="rounded-xl h-11 border-border text-xs font-semibold"
            >
              Cancel
            </AlertDialogCancel>
            {assignedMembersCount > 0 ? (
              <Button
                type="button"
                disabled={deleting}
                onClick={handleDeactivateInstead}
                className="rounded-xl h-11 bg-amber-600 text-white text-xs font-bold"
              >
                Deactivate Instead
              </Button>
            ) : (
              <AlertDialogAction
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="rounded-xl h-11 bg-red-600 text-white text-xs font-bold"
              >
                {deleting ? "Deleting..." : "Delete Plan"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
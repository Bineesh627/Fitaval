import React, { useEffect, useState, useMemo } from "react";
import { client } from "@/api/client";
import {
  Users,
  Plus,
  Search,
  Phone,
  Calendar,
  Trash2,
  Edit2,
  RefreshCw,
  AlertTriangle,
  User,
  CreditCard,
  Wallet,
} from "lucide-react";
import {
  EmptyState,
  PageHeader,
  Badge,
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
import { format, addDays, differenceInDays } from "date-fns";
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
import { useToast } from "@/components/ui/use-toast";
import {
  STATUS_FILTERS,
  GENDER_OPTIONS,
  MEMBERSHIP_STATUSES,
  PAYMENT_STATUSES,
  MEMBER_PAYMENT_METHODS,
} from "@/data";

export default function Members() {
  const { toast } = useToast();
  const [members, setMembers] = useState(() => client.entities.Member.listSync?.("-created_date", 500) || []);
  const [plans, setPlans] = useState(() => client.entities.MembershipPlan.listSync?.("-created_date", 100) || []);
  const [trainers, setTrainers] = useState(() => client.entities.Trainer.listSync?.("-created_date", 100) || []);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Mobile Action Bottom Sheet State for "⋮"
  const [actionSheetMember, setActionSheetMember] = useState(null);

  // Modals / Full Screen Panels
  const [formPanelOpen, setFormPanelOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewPanelOpen, setViewPanelOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  // Operation state
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initialForm = {
    id: null,
    name: "",
    phone: "",
    email: "",
    date_of_birth: "",
    gender: "Male",
    address: "",
    plan_id: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
    status: "active",
    payment_status: "paid",
    payment_method: "upi",
    paid_amount: "",
    trainer_id: "",
    source: "manual",
  };
  const [form, setForm] = useState(initialForm);

  const fetchData = async () => {
    try {
      if (members.length === 0) setLoading(true);
      const [m, p, t] = await Promise.all([
        client.entities.Member.list("-created_date", 500),
        client.entities.MembershipPlan.list("-created_date", 100),
        client.entities.Trainer.list("-created_date", 100),
      ]);
      setMembers(m);
      setPlans(p);
      setTrainers(t);
    } catch (e) {
      console.error(e);
      toast({
        title: "Failed to load data",
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

  const handlePlanOrDateChange = (newPlanId, newStartDate) => {
    const plan = plans.find((p) => p.id === newPlanId);
    if (plan && newStartDate) {
      try {
        const start = new Date(newStartDate);
        const days = plan.duration_days || 30;
        const computedEnd = addDays(start, days);
        const formattedEnd = format(computedEnd, "yyyy-MM-dd");

        const today = new Date();
        const computedStatus =
          computedEnd < today
            ? "inactive"
            : addDays(computedEnd, -7) < today
            ? "expiring"
            : "active";

        setForm((prev) => ({
          ...prev,
          plan_id: newPlanId,
          start_date: newStartDate,
          end_date: formattedEnd,
          status: computedStatus,
          paid_amount: plan.price ?? prev.paid_amount,
        }));
        return;
      } catch {
        // ignore
      }
    }
    setForm((prev) => ({
      ...prev,
      plan_id: newPlanId,
      start_date: newStartDate,
      paid_amount: plan?.price ?? prev.paid_amount,
    }));
  };

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        !search ||
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.phone?.includes(search) ||
        m.email?.toLowerCase().includes(search.toLowerCase()) ||
        m.plan_name?.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "all" || m.status === filter;
      return matchSearch && matchFilter;
    });
  }, [members, search, filter]);

  const openAddForm = () => {
    const defaultPlanId = plans[0]?.id || "";
    const startDate = format(new Date(), "yyyy-MM-dd");
    const plan = plans[0];
    const initialEnd = plan
      ? format(addDays(new Date(startDate), plan.duration_days || 30), "yyyy-MM-dd")
      : "";

    setForm({
      ...initialForm,
      plan_id: defaultPlanId,
      start_date: startDate,
      end_date: initialEnd,
      payment_method: "upi",
      paid_amount: plan?.price || "",
    });
    setIsEditMode(false);
    setFormPanelOpen(true);
  };

  const openEditForm = (member) => {
    const plan = plans.find((p) => p.id === member.plan_id);
    setForm({
      id: member.id,
      name: member.name || "",
      phone: member.phone || "",
      email: member.email || "",
      date_of_birth: member.date_of_birth || "",
      gender: member.gender || "Male",
      address: member.address || "",
      plan_id: member.plan_id || "",
      start_date: member.start_date || format(new Date(), "yyyy-MM-dd"),
      end_date: member.expiry_date || "",
      status: member.status || "active",
      payment_status: member.payment_status || "paid",
      payment_method: member.payment_method || "cash",
      paid_amount: member.paid_amount || plan?.price || "",
      trainer_id: member.trainer_id || "",
      source: member.source || "manual",
    });
    setIsEditMode(true);
    setActionSheetMember(null);
    setFormPanelOpen(true);
    if (viewPanelOpen) setViewPanelOpen(false);
  };

  const openViewProfile = (member) => {
    setSelectedMember(member);
    setActionSheetMember(null);
    setViewPanelOpen(true);
  };

  const handleSaveMember = async (e) => {
    if (e) e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast({
        title: "Validation error",
        description: "Full name and phone number are required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const selectedPlan = plans.find((p) => p.id === form.plan_id);
      const selectedTrainer = trainers.find((t) => t.id === form.trainer_id);

      const planFee = Number(form.paid_amount || selectedPlan?.price || 0);

      const memberPayload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        address: form.address,
        plan_id: form.plan_id,
        plan_name: selectedPlan ? selectedPlan.name : form.plan_name || "Custom Plan",
        paid_amount: planFee,
        payment_method: form.payment_method || "upi",
        trainer_id: selectedTrainer ? selectedTrainer.id : null,
        trainer_name: selectedTrainer ? selectedTrainer.name : null,
        start_date: form.start_date,
        expiry_date: form.end_date,
        status: form.status,
        payment_status: form.payment_status,
        source: form.source,
      };

      if (isEditMode && form.id) {
        const prevMember = members.find((m) => m.id === form.id);
        const updated = await client.entities.Member.update(form.id, memberPayload);
        setMembers((prev) => prev.map((m) => (m.id === form.id ? updated : m)));
        if (selectedMember?.id === form.id) setSelectedMember(updated);

        // If marked paid from previously unpaid status, record income transaction
        const wasUnpaid = prevMember?.payment_status === "unpaid" && form.payment_status === "paid";
        if (wasUnpaid && planFee > 0) {
          try {
            await client.entities.Transaction.create({
              type: "income",
              amount: planFee,
              category: "Membership",
              payment_method: form.payment_method || "cash",
              date: form.start_date || format(new Date(), "yyyy-MM-dd"),
              description: `${memberPayload.plan_name} plan payment - ${updated.name}`,
              member_id: updated.id,
              member_name: updated.name,
            });
          } catch (txErr) {
            console.error("Failed to auto-record transaction for member update:", txErr);
          }
        }

        toast({
          title: "Member updated",
          description: wasUnpaid && planFee > 0
            ? `${updated.name}'s payment of ₹${planFee.toLocaleString("en-IN")} recorded in Finance & Dashboard income.`
            : `${updated.name}'s profile was saved successfully.`,
        });
      } else {
        const created = await client.entities.Member.create(memberPayload);
        setMembers((prev) => [created, ...prev]);

        // Automatically create income transaction in Finance & Dashboard
        if (form.payment_status === "paid" && planFee > 0) {
          try {
            await client.entities.Transaction.create({
              type: "income",
              amount: planFee,
              category: "Membership",
              payment_method: form.payment_method || "upi",
              date: form.start_date || format(new Date(), "yyyy-MM-dd"),
              description: `${memberPayload.plan_name} membership plan - ${created.name}`,
              member_id: created.id,
              member_name: created.name,
            });
          } catch (txErr) {
            console.error("Failed to auto-create income transaction:", txErr);
          }
        }

        toast({
          title: "Member created & income recorded",
          description: `${created.name} enrolled${
            form.payment_status === "paid" && planFee > 0
              ? ` · ₹${planFee.toLocaleString("en-IN")} automatically added to Finance & Dashboard income`
              : ""
          }!`,
        });
      }

      setFormPanelOpen(false);
    } catch (err) {
      toast({
        title: "Failed to save",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const promptDeleteMember = (member) => {
    setMemberToDelete(member);
    setActionSheetMember(null);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    setDeleting(true);
    try {
      await client.entities.Member.delete(memberToDelete.id);
      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
      if (selectedMember?.id === memberToDelete.id) {
        setViewPanelOpen(false);
        setSelectedMember(null);
      }
      toast({
        title: "Member deleted",
        description: `${memberToDelete.name} was permanently removed.`,
      });
      setDeleteConfirmOpen(false);
      setMemberToDelete(null);
    } catch (err) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleRenewMembership = async (member) => {
    try {
      const plan = plans.find((p) => p.id === member.plan_id) || plans[0];
      if (!plan) return;

      const currentExpiry = member.expiry_date ? new Date(member.expiry_date) : new Date();
      const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
      const newExpiry = addDays(baseDate, plan.duration_days || 30);
      const formatted = format(newExpiry, "yyyy-MM-dd");

      const updated = await client.entities.Member.update(member.id, {
        expiry_date: formatted,
        status: "active",
        payment_status: "paid",
      });

      setMembers((prev) => prev.map((m) => (m.id === member.id ? updated : m)));
      if (selectedMember?.id === member.id) setSelectedMember(updated);
      setActionSheetMember(null);

      toast({
        title: "Membership renewed",
        description: `${member.name} extended until ${format(newExpiry, "dd MMM yyyy")}.`,
      });
    } catch (err) {
      toast({ title: "Renewal failed", description: err.message, variant: "destructive" });
    }
  };

  const fmtDate = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    return Number.isNaN(dt.getTime()) ? null : format(dt, "dd MMM yyyy");
  };
  const formatMethod = (m) =>
    MEMBER_PAYMENT_METHODS.find((pm) => pm.value === m)?.label || (m ? String(m) : null);
  const calcAge = (dob) => {
    if (!dob) return null;
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return null;
    return Math.floor(differenceInDays(new Date(), d) / 365.25);
  };

  if (loading && members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
        <p className="text-xs text-muted-foreground font-medium">Loading Members...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Mobile-First Header: ← Members   + */}
      <PageHeader
        title="Members"
        subtitle={`${members.length} total members`}
        action={
          <button
            type="button"
            onClick={openAddForm}
            className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm hover:bg-primary/90 transition-all active:scale-95 touch-manipulation"
            aria-label="Add Member"
          >
            <Plus className="w-5 h-5" strokeWidth={2.6} />
          </button>
        }
      />

      {/* Full-Width Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input aria-label="Search by name, phone, email..." id="members-search-by-name-phone-email" name="search" autoComplete="off"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, email..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-card border border-border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground text-foreground"
        />
      </div>

      {/* Horizontally scrollable status filter tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
        {STATUS_FILTERS.map((f) => {
          const count =
            f.key === "all"
              ? members.length
              : members.filter((m) => m.status === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0 touch-manipulation ${
                filter === f.key
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label}
              <span className="ml-1 opacity-80 text-[10px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Members List - Mobile Optimized Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search || filter !== "all" ? "No members match filter" : "No members yet"}
          description="Add your first member to start managing gym memberships, attendance, and coach assignments."
          action={
            <Button onClick={openAddForm} className="bg-primary text-white rounded-xl h-11 px-5 text-xs font-bold">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Member
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => {
            const daysLeft = m.expiry_date
              ? differenceInDays(new Date(m.expiry_date), new Date())
              : null;

            return (
              <div
                key={m.id}
                {...clickableCardProps(() => openViewProfile(m))}
                className="rounded-2xl bg-card border border-border p-4 shadow-xs flex flex-col gap-2.5 transition-all cursor-pointer hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                {/* 1. Top row: Status indicator + Name + Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        m.status === "active"
                          ? "bg-emerald-500"
                          : m.status === "expiring"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm sm:text-base text-foreground truncate">
                        {m.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate font-medium">
                        {m.plan_name || "Monthly Basic"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        m.status === "active"
                          ? "green"
                          : m.status === "expiring"
                          ? "amber"
                          : "red"
                      }
                      className="capitalize shrink-0"
                    >
                      {m.status || "active"}
                    </Badge>
                    <RecordMoreButton onClick={() => setActionSheetMember(m)} />
                  </div>
                </div>

                {/* 2. Middle Row: Phone & Expiry Info (Stacked readable) */}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 pt-1 text-xs text-muted-foreground border-t border-border/60">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{m.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">
                      {m.expiry_date
                        ? `Expires ${format(new Date(m.expiry_date), "dd MMM yyyy")}`
                        : "No expiry date"}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Member Action Bottom Sheet (View, Edit, Renew, Delete) */}
      <MobileBottomSheet
        open={Boolean(actionSheetMember)}
        onClose={() => setActionSheetMember(null)}
        title={actionSheetMember?.name || "Member Actions"}
      >
        <div className="space-y-1 pb-2">
          <ActionSheetItem
            icon={Edit2}
            label="Edit Member Details"
            onClick={() => actionSheetMember && openEditForm(actionSheetMember)}
          />
          <ActionSheetItem
            icon={RefreshCw}
            label="Renew Membership Plan"
            hint="Extends expiry by the plan duration"
            onClick={() => actionSheetMember && handleRenewMembership(actionSheetMember)}
          />
          <div className="pt-2 mt-1 border-t border-border">
            <ActionSheetItem
              icon={Trash2}
              tone="danger"
              label="Delete Member"
              onClick={() => actionSheetMember && promptDeleteMember(actionSheetMember)}
            />
          </div>
        </div>
      </MobileBottomSheet>

      {/* Full-Screen Add / Edit Member Panel for Mobile & Desktop */}
      <MobileFullFormPanel
        open={formPanelOpen}
        onClose={() => setFormPanelOpen(false)}
        title={isEditMode ? "Edit Member" : "Add Member"}
        subtitle={isEditMode ? "Update personal info and plan" : "Enroll a new gym member"}
        submitLabel={isEditMode ? "Save Changes" : "Create Member"}
        onSubmit={handleSaveMember}
        isSubmitting={saving}
      >
        <form onSubmit={handleSaveMember} className="space-y-5">
          {/* Section: Personal Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-primary flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Personal Information
            </h4>

            <div>
              <Label htmlFor="members-full-name" className="text-xs font-semibold">Full Name *</Label>
              <Input id="members-full-name" name="name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Karan Mehra"
                className="mt-1 rounded-xl h-11 text-xs sm:text-sm"
              />
            </div>

            <div>
              <Label htmlFor="members-phone-number" className="text-xs font-semibold">Phone Number *</Label>
              <Input id="members-phone-number" name="phone"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                placeholder="+91 98787 66554"
                className="mt-1 rounded-xl h-11 text-xs sm:text-sm"
              />
            </div>

            <div>
              <Label htmlFor="members-email-address" className="text-xs font-semibold">Email Address</Label>
              <Input id="members-email-address" name="email"
                autoComplete="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="karan@example.com"
                className="mt-1 rounded-xl h-11 text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label htmlFor="members-gender" className="text-xs font-semibold">Gender</Label>
                <Select name="gender"
                  value={form.gender}
                  onValueChange={(val) => setForm({ ...form, gender: val })}
                >
                  <SelectTrigger id="members-gender" className="mt-1 rounded-xl h-11 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="members-date-of-birth" className="text-xs font-semibold">Date of Birth</Label>
                <Input id="members-date-of-birth" name="date_of_birth"
                  autoComplete="off"
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                  className="mt-1 rounded-xl h-11 text-xs"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="members-address" className="text-xs font-semibold">Address</Label>
              <Input id="members-address" name="address"
                autoComplete="street-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Apartment, Street address, City"
                className="mt-1 rounded-xl h-11 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Section: Membership */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-primary flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Membership & Dates
            </h4>

            <div>
              <Label htmlFor="members-membership-plan" className="text-xs font-semibold">Membership Plan *</Label>
              <Select name="membership_plan"
                value={form.plan_id}
                onValueChange={(val) => handlePlanOrDateChange(val, form.start_date)}
              >
                <SelectTrigger id="members-membership-plan" className="mt-1 rounded-xl h-11 text-xs">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.duration_days}d) — ₹{(p.price || 0).toLocaleString("en-IN")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label htmlFor="members-start-date" className="text-xs font-semibold">Start Date</Label>
                <Input id="members-start-date" name="start_date"
                  autoComplete="off"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => handlePlanOrDateChange(form.plan_id, e.target.value)}
                  className="mt-1 rounded-xl h-11 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="members-end-date" className="text-xs font-semibold">End Date</Label>
                <Input id="members-end-date" name="end_date"
                  autoComplete="off"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="mt-1 rounded-xl h-11 text-xs bg-muted/40 font-medium"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="members-assigned-trainer" className="text-xs font-semibold">Assigned Trainer</Label>
              <Select name="assigned_trainer"
                value={form.trainer_id}
                onValueChange={(val) => setForm({ ...form, trainer_id: val })}
              >
                <SelectTrigger id="members-assigned-trainer" className="mt-1 rounded-xl h-11 text-xs">
                  <SelectValue placeholder="Select Coach" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Coach</SelectItem>
                  {trainers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.specialization})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label htmlFor="members-membership-status" className="text-xs font-semibold">Membership Status</Label>
                <Select name="membership_status"
                  value={form.status}
                  onValueChange={(val) => setForm({ ...form, status: val })}
                >
                  <SelectTrigger id="members-membership-status" className="mt-1 rounded-xl h-11 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBERSHIP_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="members-payment-status" className="text-xs font-semibold">Payment Status</Label>
                <Select name="payment_status"
                  value={form.payment_status}
                  onValueChange={(val) => setForm({ ...form, payment_status: val })}
                >
                  <SelectTrigger id="members-payment-status" className="mt-1 rounded-xl h-11 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUSES.map((ps) => (
                      <SelectItem key={ps.value} value={ps.value}>
                        {ps.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Method & Auto-Income Recording Details */}
            {form.payment_status === "paid" && (
              <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-2.5 animate-in fade-in">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label htmlFor="members-payment-method" className="text-xs font-semibold">Payment Method</Label>
                    <Select name="payment_method"
                      value={form.payment_method || "upi"}
                      onValueChange={(val) => setForm({ ...form, payment_method: val })}
                    >
                      <SelectTrigger id="members-payment-method" className="mt-1 rounded-xl h-10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEMBER_PAYMENT_METHODS.map((pm) => (
                          <SelectItem key={pm.value} value={pm.value}>
                            {pm.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="members-plan-fee" className="text-xs font-semibold">Plan Fee (₹)</Label>
                    <Input id="members-plan-fee" name="paid_amount"
                      autoComplete="off"
                      type="number"
                      value={form.paid_amount}
                      onChange={(e) => setForm({ ...form, paid_amount: e.target.value })}
                      placeholder="Amount"
                      className="mt-1 rounded-xl h-10 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    Automatically added to Finance & Dashboard income upon saving.
                  </span>
                </div>
              </div>
            )}
          </div>

        </form>
      </MobileFullFormPanel>

      {/* Member Details */}
      {selectedMember && (() => {
        const m = selectedMember;
        const daysLeft = m.expiry_date ? differenceInDays(new Date(m.expiry_date), new Date()) : null;
        const statusTone = m.status === "active" ? "green" : m.status === "expiring" ? "amber" : "red";
        const age = calcAge(m.date_of_birth);
        const plan = plans.find((p) => p.id === m.plan_id);
        const amount = Number(m.paid_amount ?? plan?.price ?? 0);
        return (
          <DetailPanel
            open={viewPanelOpen}
            onClose={() => setViewPanelOpen(false)}
            eyebrow="Member"
            title={m.name}
            onEdit={() => openEditForm(m)}
            onDelete={() => promptDeleteMember(m)}
            onMore={() => setActionSheetMember(m)}
            footer={
              <>
                <Button
                  variant="outline"
                  onClick={() => openEditForm(m)}
                  className="flex-1 rounded-xl h-11 text-xs font-bold border-border text-foreground hover:bg-muted"
                >
                  <Edit2 className="w-4 h-4 mr-1.5" /> Edit Member
                </Button>
                <Button
                  onClick={() => handleRenewMembership(m)}
                  className="flex-1 rounded-xl h-11 text-xs font-bold bg-primary text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-1.5" /> Renew Plan
                </Button>
              </>
            }
          >
            {/* Hero */}
            <div className="flex flex-col items-center text-center py-5 px-4 bg-card rounded-2xl border border-border">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-sm mb-2.5">
                {m.name?.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-bold text-lg text-foreground leading-tight">{m.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {[m.gender, age !== null ? `${age} yrs` : null].filter(Boolean).join(" • ") || "—"}
              </p>
              <div className="flex items-center gap-2 mt-2.5">
                <Badge variant={statusTone} className="capitalize">
                  {m.status || "active"}
                </Badge>
                <Badge variant={m.payment_status === "unpaid" ? "red" : "green"} className="capitalize">
                  {m.payment_status || "paid"}
                </Badge>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2.5">
              <InfoTile
                label="Days Left"
                value={daysLeft === null ? "—" : daysLeft < 0 ? "Expired" : daysLeft}
                tone={daysLeft === null ? "default" : daysLeft < 0 ? "red" : daysLeft <= 7 ? "amber" : "green"}
              />
              <InfoTile label="Plan Fee" value={`₹${amount.toLocaleString("en-IN")}`} />
              <InfoTile label="Source" value={m.source ? String(m.source).replace(/[-_]/g, " ") : "—"} />
            </div>

            <DetailSection title="Contact" icon={Phone}>
              <DetailRow label="Phone" value={m.phone} />
              <DetailRow label="Email" value={m.email} />
              <DetailRow label="Address" value={m.address} />
              <DetailRow label="Date of birth" value={fmtDate(m.date_of_birth)} />
            </DetailSection>

            <DetailSection title="Membership" icon={CreditCard}>
              <DetailRow label="Plan" value={m.plan_name} />
              <DetailRow label="Start date" value={fmtDate(m.start_date)} />
              <DetailRow label="Expiry date" value={fmtDate(m.expiry_date)} />
              <DetailRow label="Joined" value={fmtDate(m.created_date)} />
              <DetailRow label="Assigned trainer" value={m.trainer_name || "No trainer assigned"} />
            </DetailSection>

            <DetailSection title="Payment" icon={Wallet}>
              <DetailRow label="Status">
                <span className={m.payment_status === "unpaid" ? "text-red-600" : "text-emerald-600"}>
                  {(m.payment_status || "paid").replace(/^./, (c) => c.toUpperCase())}
                </span>
              </DetailRow>
              <DetailRow label="Amount" value={`₹${amount.toLocaleString("en-IN")}`} />
              <DetailRow label="Method" value={formatMethod(m.payment_method)} />
            </DetailSection>
          </DetailPanel>
        );
      })()}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="rounded-3xl bg-card border border-border max-w-sm">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-1">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Delete Member?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">{memberToDelete?.name}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-3 gap-2">
            <AlertDialogCancel
              disabled={deleting}
              className="rounded-xl h-11 border-border text-xs font-semibold"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="rounded-xl h-11 bg-red-600 text-white text-xs font-bold"
            >
              {deleting ? "Deleting..." : "Delete Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
import React, { useEffect, useState, useMemo } from "react";
import { client } from "@/api/client";
import { getImageUrl } from "@/utils/imageUrl";
import {
  Dumbbell,
  Plus,
  Search,
  Award,
  Briefcase,
  Camera,
  Trash2,
  Edit2,
  AlertTriangle,
  Phone,
  CalendarClock,
  Users,
  Power,
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
  DetailText,
  InfoTile,
} from "@/components/record-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import TrainerSchedulePicker from "@/components/TrainerSchedulePicker";
import StaffAttendance from "@/components/StaffAttendance";
import { SPECIALIZATION_OPTIONS, STAFF_ROLE_FILTERS, STAFF_PAGE_TABS } from "@/data";

export default function Trainers() {
  const { toast } = useToast();
  const [trainers, setTrainers] = useState(() => client.entities.Trainer.listSync?.("-created_date", 100) || []);
  const [members, setMembers] = useState(() => client.entities.Member.listSync?.("-created_date", 500) || []);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Mobile Bottom Action Sheet for "⋮"
  const [actionSheetTrainer, setActionSheetTrainer] = useState(null);

  // Add Option Selection Sheet (Trainer vs Staff)
  const [roleSelectOpen, setRoleSelectOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all"); // 'all' | 'trainer' | 'staff'
  const [pageTab, setPageTab] = useState("roster"); // 'roster' | 'attendance'

  // Full Screen Mobile Panels
  const [formPanelOpen, setFormPanelOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewPanelOpen, setViewPanelOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState(null);
  const [reassignTrainerId, setReassignTrainerId] = useState("");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initialForm = {
    id: null,
    role: "trainer", // 'trainer' | 'staff'
    name: "",
    photo_url: "",
    phone: "",
    email: "",
    specialization: "Strength Training",
    specializations: ["Strength Training"],
    experience_years: "5",
    certifications: "",
    bio: "",
    availability: "Available",
    working_days: "Monday – Friday",
    working_hours: "06:00 AM – 02:00 PM",
    status: "active",
  };
  const [form, setForm] = useState(initialForm);

  const fetchData = async () => {
    try {
      if (trainers.length === 0) setLoading(true);
      const [t, m] = await Promise.all([
        client.entities.Trainer.list("-created_date", 100),
        client.entities.Member.list("-created_date", 500),
      ]);
      setTrainers(t);
      setMembers(m);
    } catch (e) {
      console.error(e);
      toast({
        title: "Failed to load staff",
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

  const membersByTrainer = useMemo(() => {
    const map = {};
    members.forEach((m) => {
      if (m.trainer_id) {
        if (!map[m.trainer_id]) map[m.trainer_id] = [];
        map[m.trainer_id].push(m);
      }
    });
    return map;
  }, [members]);

  const counts = useMemo(() => {
    let trainerCount = 0;
    let staffCount = 0;
    trainers.forEach((t) => {
      if (t.role === "staff") staffCount++;
      else trainerCount++;
    });
    return { all: trainers.length, trainer: trainerCount, staff: staffCount };
  }, [trainers]);

  const filteredTrainers = useMemo(() => {
    return trainers.filter((t) => {
      const role = t.role === "staff" ? "staff" : "trainer";
      if (roleFilter !== "all" && role !== roleFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        t.name?.toLowerCase().includes(q) ||
        t.specialization?.toLowerCase().includes(q) ||
        t.certifications?.toLowerCase().includes(q) ||
        t.bio?.toLowerCase().includes(q) ||
        t.phone?.includes(q)
      );
    });
  }, [trainers, search, roleFilter]);

  const openAddOptions = () => {
    setRoleSelectOpen(true);
  };

  const openAddFormWithRole = (selectedRole) => {
    setRoleSelectOpen(false);
    setForm({
      ...initialForm,
      role: selectedRole,
      specialization: selectedRole === "staff" ? "Staff Member" : "Strength Training",
      specializations: selectedRole === "staff" ? [] : ["Strength Training"],
      experience_years: selectedRole === "staff" ? "" : "3",
      certifications: "",
      bio: "",
    });
    setIsEditMode(false);
    setFormPanelOpen(true);
  };

  const openAddForm = openAddOptions;

  const openEditForm = (t) => {
    const role = t.role === "staff" ? "staff" : "trainer";
    const specs = Array.isArray(t.specializations)
      ? t.specializations
      : t.specialization
      ? t.specialization.split(",").map((s) => s.trim())
      : role === "staff" ? [] : ["Strength Training"];

    setForm({
      id: t.id,
      role: role,
      name: t.name || "",
      photo_url: t.photo_url || "",
      phone: t.phone || "",
      email: t.email || "",
      specialization: t.specialization || (role === "staff" ? "Staff Member" : "Strength Training"),
      specializations: specs,
      experience_years: t.experience_years !== undefined && t.experience_years !== null ? t.experience_years.toString() : "0",
      certifications: t.certifications || "",
      bio: t.bio || "",
      availability: t.availability || "Available",
      working_days: t.working_days || "Monday – Friday",
      working_hours: t.working_hours || "06:00 AM – 02:00 PM",
      status: t.status || "active",
    });
    setIsEditMode(true);
    setActionSheetTrainer(null);
    setFormPanelOpen(true);
    if (viewPanelOpen) setViewPanelOpen(false);
  };

  const openViewProfile = (t) => {
    setSelectedTrainer(t);
    setActionSheetTrainer(null);
    setViewPanelOpen(true);
  };

  const handleToggleSpecialization = (spec) => {
    let next;
    if (form.specializations.includes(spec)) {
      next = form.specializations.filter((s) => s !== spec);
      if (next.length === 0) next = [spec];
    } else {
      next = [...form.specializations, spec];
    }
    setForm({
      ...form,
      specializations: next,
      specialization: next.join(", "),
    });
  };

  const uploadTrainerPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await client.integrations.Core.UploadPublicFile({ file });
      setForm((prev) => ({ ...prev, photo_url: file_url }));
      toast({ title: "Photo selected", description: "Remember to save changes." });
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  };

  const handleSaveTrainer = async (e) => {
    if (e) e.preventDefault();
    if (!form.name.trim()) {
      toast({
        title: "Validation error",
        description: `${form.role === "staff" ? "Staff" : "Trainer"} name is required.`,
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const isStaff = form.role === "staff";
      const payload = {
        role: form.role,
        name: form.name.trim(),
        photo_url: form.photo_url,
        phone: form.phone.trim(),
        email: form.email.trim(),
        specialization: isStaff ? "Staff Member" : form.specializations.join(", "),
        specializations: isStaff ? [] : form.specializations,
        experience_years: isStaff ? 0 : (parseInt(form.experience_years, 10) || 0),
        certifications: isStaff ? "" : form.certifications.trim(),
        bio: form.bio.trim(),
        availability: form.availability,
        working_days: form.working_days,
        working_hours: form.working_hours,
        status: form.status,
      };

      if (isEditMode && form.id) {
        const updated = await client.entities.Trainer.update(form.id, payload);
        setTrainers((prev) => prev.map((t) => (t.id === form.id ? updated : t)));
        if (selectedTrainer?.id === form.id) setSelectedTrainer(updated);
        toast({
          title: isStaff ? "Staff updated" : "Trainer updated",
          description: `${updated.name}'s profile saved.`,
        });
      } else {
        const created = await client.entities.Trainer.create(payload);
        setTrainers((prev) => [created, ...prev]);
        toast({
          title: isStaff ? "Staff added" : "Trainer added",
          description: `${created.name} added to roster.`,
        });
      }
      setFormPanelOpen(false);
    } catch (err) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (trainer) => {
    try {
      const nextStatus = trainer.status === "inactive" ? "active" : "inactive";
      const updated = await client.entities.Trainer.update(trainer.id, {
        status: nextStatus,
      });
      setTrainers((prev) => prev.map((t) => (t.id === trainer.id ? updated : t)));
      if (selectedTrainer?.id === trainer.id) setSelectedTrainer(updated);
      setActionSheetTrainer(null);
      toast({
        title: nextStatus === "active" ? "Trainer enabled" : "Trainer disabled",
        description: `${trainer.name} is now ${nextStatus}.`,
      });
    } catch (err) {
      toast({ title: "Status update failed", description: err.message, variant: "destructive" });
    }
  };

  const promptDeleteTrainer = (trainer) => {
    setTrainerToDelete(trainer);
    const other = trainers.find((t) => t.id !== trainer.id);
    setReassignTrainerId(other?.id || "none");
    setActionSheetTrainer(null);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!trainerToDelete) return;
    setDeleting(true);
    try {
      await client.entities.Trainer.delete(trainerToDelete.id);
      setTrainers((prev) => prev.filter((t) => t.id !== trainerToDelete.id));
      if (selectedTrainer?.id === trainerToDelete.id) {
        setViewPanelOpen(false);
        setSelectedTrainer(null);
      }
      toast({ title: "Trainer deleted", description: `${trainerToDelete.name} was removed.` });
      setDeleteConfirmOpen(false);
      setTrainerToDelete(null);
    } catch (err) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleReassignAndProceed = async () => {
    if (!trainerToDelete) return;
    setDeleting(true);
    try {
      const targetTrainer = trainers.find((t) => t.id === reassignTrainerId);
      const assigned = membersByTrainer[trainerToDelete.id] || [];

      for (const m of assigned) {
        await client.entities.Member.update(m.id, {
          trainer_id: targetTrainer ? targetTrainer.id : null,
          trainer_name: targetTrainer ? targetTrainer.name : null,
        });
      }

      await client.entities.Trainer.delete(trainerToDelete.id);
      setTrainers((prev) => prev.filter((t) => t.id !== trainerToDelete.id));

      const updatedMembers = await client.entities.Member.list("-created_date", 500);
      setMembers(updatedMembers);

      if (selectedTrainer?.id === trainerToDelete.id) {
        setViewPanelOpen(false);
        setSelectedTrainer(null);
      }

      toast({
        title: "Members reassigned & trainer deleted",
        description: `${assigned.length} members were moved to ${
          targetTrainer ? targetTrainer.name : "unassigned"
        }.`,
      });
      setDeleteConfirmOpen(false);
      setTrainerToDelete(null);
    } catch (err) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  if (loading && trainers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
        <p className="text-xs text-muted-foreground font-medium">Loading Trainers...</p>
      </div>
    );
  }

  const assignedMembers = trainerToDelete ? membersByTrainer[trainerToDelete.id] || [] : [];

  const attendanceTabs = (
    <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border">
      {STAFF_PAGE_TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setPageTab(t.id)}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            pageTab === t.id
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  if (pageTab === "attendance") {
    return (
      <div className="space-y-3.5">
        <PageHeader title="Staff" subtitle="Trainer & staff attendance" />
        {attendanceTabs}
        <StaffAttendance people={trainers} />
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Mobile-First Header: Staff     + */}
      <PageHeader
        title="Staff"
        subtitle={`${trainers.length} registered coaches & staff members`}
        action={
          <button
            type="button"
            onClick={openAddOptions}
            className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm hover:bg-primary/90 transition-all active:scale-95 touch-manipulation"
            aria-label="Add Staff or Trainer"
          >
            <Plus className="w-5 h-5" strokeWidth={2.6} />
          </button>
        }
      />

      {attendanceTabs}

      {/* Full Width Search Field */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input aria-label="Search staff, coaches, specializations..." id="trainers-search-staff-coaches-specializations" name="search" autoComplete="off"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search staff, coaches, specializations..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-card border border-border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground text-foreground"
        />
      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border">
        {STAFF_ROLE_FILTERS.map((tab) => {
          const isSelected = roleFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRoleFilter(tab.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                isSelected
                  ? "bg-card text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.id === "trainer" && (
                <Dumbbell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              )}
              {tab.id === "staff" && (
                <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              )}
              <span>
                {tab.label} ({counts[tab.id]})
              </span>
            </button>
          );
        })}
      </div>

      {/* Stacked Mobile Cards */}
      {filteredTrainers.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title={search ? "No matches found" : "No staff or trainers yet"}
          description="Add trainers, fitness coaches, and gym staff to assign members and track schedules."
          action={
            <Button onClick={openAddOptions} className="bg-primary text-white rounded-xl h-11 px-5 text-xs font-bold">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Member
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredTrainers.map((t) => {
            const isStaff = t.role === "staff";
            const count = (membersByTrainer[t.id] || []).length;

            return (
              <div
                key={t.id}
                {...clickableCardProps(() => openViewProfile(t))}
                className="w-full rounded-2xl bg-card border border-border p-4 shadow-xs flex flex-col gap-3 transition-all cursor-pointer hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                {/* 1. Header with Photo + Name + Role Badge + Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 min-w-[48px] max-w-[48px] h-[48px] rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-base overflow-hidden shrink-0 shadow-xs border border-border/70 aspect-square">
                      {t.photo_url ? (
                        <img
                          src={getImageUrl(t.photo_url)}
                          alt={t.name}
                          className="w-full h-full object-cover shrink-0 block"
                        />
                      ) : (
                        t.name?.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                          {t.name}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isStaff
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                          }`}
                        >
                          {isStaff ? "Staff" : "Trainer"}
                        </span>
                      </div>

                      <p className="text-xs text-primary font-semibold truncate mt-0.5">
                        {isStaff ? (t.bio || "Gym Operations Staff") : t.specialization}
                      </p>

                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {isStaff
                          ? `${t.working_hours || "Scheduled Shift"} • Active`
                          : `${t.experience_years || 0} years exp • ${count} assigned`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={t.status === "inactive" ? "red" : "green"}
                      className="capitalize shrink-0"
                    >
                      {t.status || "active"}
                    </Badge>
                    <RecordMoreButton onClick={() => setActionSheetTrainer(t)} />
                  </div>
                </div>

                {/* 2. Certifications snippet (Only for Trainer) */}
                {!isStaff && t.certifications && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1 border-t border-border/60 truncate">
                    <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{t.certifications}</span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Role Selection Bottom Sheet (Prompt when tapping "+ Add") */}
      <MobileBottomSheet
        open={roleSelectOpen}
        onClose={() => setRoleSelectOpen(false)}
        title="Add New Member"
      >
        <div className="space-y-3 pb-2">
          <p className="text-xs text-muted-foreground">
            Select the role to add to your gym roster:
          </p>

          {/* Option 1: Trainer */}
          <div
            onClick={() => openAddFormWithRole("trainer")}
            className="p-4 rounded-2xl border-2 border-border hover:border-primary bg-card hover:bg-primary/5 cursor-pointer transition-all flex items-start gap-3.5 group active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                  Trainer
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  Fitness Coach
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Fitness coach with specialties, certifications, experience, and assigned member roster.
              </p>
            </div>
          </div>

          {/* Option 2: Staff */}
          <div
            onClick={() => openAddFormWithRole("staff")}
            className="p-4 rounded-2xl border-2 border-border hover:border-blue-500 bg-card hover:bg-blue-500/5 cursor-pointer transition-all flex items-start gap-3.5 group active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm sm:text-base text-foreground group-hover:text-blue-600 transition-colors">
                  Staff
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                  Operations
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Gym receptionists, managers, floor supervisors, customer care, and operations staff.
              </p>
            </div>
          </div>
        </div>
      </MobileBottomSheet>

      {/* Action Bottom Sheet */}
      <MobileBottomSheet
        open={Boolean(actionSheetTrainer)}
        onClose={() => setActionSheetTrainer(null)}
        title={actionSheetTrainer?.name || "Actions"}
      >
        <div className="space-y-1 pb-2">
          <ActionSheetItem
            icon={Edit2}
            label="Edit Profile"
            onClick={() => actionSheetTrainer && openEditForm(actionSheetTrainer)}
          />
          <ActionSheetItem
            icon={Power}
            label={`${actionSheetTrainer?.status === "inactive" ? "Enable" : "Disable"} ${
              actionSheetTrainer?.role === "staff" ? "Staff" : "Trainer"
            }`}
            onClick={() => actionSheetTrainer && toggleStatus(actionSheetTrainer)}
          />
          <div className="pt-2 mt-1 border-t border-border">
            <ActionSheetItem
              icon={Trash2}
              tone="danger"
              label={`Delete ${actionSheetTrainer?.role === "staff" ? "Staff Member" : "Trainer"}`}
              onClick={() => actionSheetTrainer && promptDeleteTrainer(actionSheetTrainer)}
            />
          </div>
        </div>
      </MobileBottomSheet>

      {/* Full-Screen Add / Edit Trainer & Staff Panel */}
      <MobileFullFormPanel
        open={formPanelOpen}
        onClose={() => setFormPanelOpen(false)}
        title={
          isEditMode
            ? form.role === "staff"
              ? "Edit Staff Member"
              : "Edit Trainer"
            : form.role === "staff"
            ? "Add Staff Member"
            : "Add Trainer"
        }
        subtitle={
          form.role === "staff"
            ? "Manage staff details, shift schedule and bio"
            : "Manage coach specialties, certifications and schedule"
        }
        submitLabel={
          isEditMode
            ? "Save Changes"
            : form.role === "staff"
            ? "Add Staff Member"
            : "Add Trainer"
        }
        onSubmit={handleSaveTrainer}
        isSubmitting={saving}
      >
        <form onSubmit={handleSaveTrainer} className="space-y-4">
          {/* Role Switcher Pill */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-muted/60 rounded-2xl border border-border">
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  role: "trainer",
                  specializations: prev.specializations.length ? prev.specializations : ["Strength Training"],
                  specialization: prev.specialization === "Staff Member" ? "Strength Training" : prev.specialization,
                }))
              }
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                form.role === "trainer"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Dumbbell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Trainer</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  role: "staff",
                }))
              }
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                form.role === "staff"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Staff</span>
            </button>
          </div>

          {/* Photo upload: coach photo (trainer) vs staff photo (staff) */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
              {form.photo_url ? (
                <img
                  src={getImageUrl(form.photo_url)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <Label htmlFor="trainer-photo-upload" className="text-xs font-semibold">
                {form.role === "staff" ? "Staff Photo" : "Coach Photo"}
              </Label>
              <label className="cursor-pointer block mt-1">
                <input
                  type="file"
                  id="trainer-photo-upload"
                  name="photo"
                  accept="image/*"
                  onChange={uploadTrainerPhoto}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold">
                  <Camera className="w-3.5 h-3.5" />
                  Choose Photo
                </span>
              </label>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <Label htmlFor="trainers-full-name" className="text-xs font-semibold">Full Name *</Label>
            <Input id="trainers-full-name" name="name"
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder={form.role === "staff" ? "e.g. Ramesh Kumar" : "e.g. Vikram Malhotra"}
              className="mt-1 rounded-xl h-11 text-xs sm:text-sm"
            />
          </div>

          {/* Experience (Years): Only for Trainer (Hidden / 'x' for Staff) */}
          {form.role === "trainer" && (
            <div>
              <Label htmlFor="trainers-experience" className="text-xs font-semibold">Experience (Years)</Label>
              <Input id="trainers-experience" name="experience_years"
                autoComplete="off"
                type="number"
                value={form.experience_years}
                onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
                placeholder="5"
                className="mt-1 rounded-xl h-11 text-xs"
              />
            </div>
          )}

          {/* Phone Number */}
          <div>
            <Label htmlFor="trainers-phone-number" className="text-xs font-semibold">Phone Number</Label>
            <Input id="trainers-phone-number" name="phone"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98555 66773"
              className="mt-1 rounded-xl h-11 text-xs"
            />
          </div>

          {/* Email Address */}
          <div>
            <Label htmlFor="trainers-email-address" className="text-xs font-semibold">Email Address</Label>
            <Input id="trainers-email-address" name="email"
              autoComplete="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={form.role === "staff" ? "staff@fitaval.com" : "coach@fitaval.com"}
              className="mt-1 rounded-xl h-11 text-xs"
            />
          </div>

          {/* Specializations: Only for Trainer (Hidden / 'x' for Staff) */}
          {form.role === "trainer" && (
            <div>
              <span className="text-xs font-semibold">Specializations (Tap to toggle)</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {SPECIALIZATION_OPTIONS.map((spec) => {
                  const isSelected = form.specializations.includes(spec);
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => handleToggleSpecialization(spec)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-card text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {spec}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Certifications: Only for Trainer (Hidden for Staff) */}
          {form.role === "trainer" && (
            <div>
              <Label htmlFor="trainers-certifications" className="text-xs font-semibold">Certifications</Label>
              <Input id="trainers-certifications" name="certifications"
                autoComplete="off"
                value={form.certifications}
                onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                placeholder="RYT 500, ACE CPT, CrossFit L2"
                className="mt-1 rounded-xl h-11 text-xs"
              />
            </div>
          )}

          {/* Working Days & Working Shift Interactive Scheduler */}
          <TrainerSchedulePicker
            workingDays={form.working_days}
            workingHours={form.working_hours}
            onChangeDays={(days) => setForm((prev) => ({ ...prev, working_days: days }))}
            onChangeHours={(hours) => setForm((prev) => ({ ...prev, working_hours: hours }))}
          />

          {/* Bio: coach bio (trainer) vs bio (staff) */}
          <div>
            <Label htmlFor="trainers-bio" className="text-xs font-semibold">
              {form.role === "staff" ? "Bio" : "Coach Bio"}
            </Label>
            <Textarea id="trainers-bio" name="bio"
              autoComplete="off"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder={
                form.role === "staff"
                  ? "Front desk receptionist, customer care, facility management..."
                  : "Postural correction and mobility specialist..."
              }
              rows={3}
              className="mt-1 rounded-xl text-xs"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-border">
            <span className="text-xs font-semibold text-foreground">Active Status</span>
            <Switch
              id="trainers-active-status"
              name="status"
              aria-label="Active status"
              checked={form.status === "active"}
              onCheckedChange={(val) => setForm({ ...form, status: val ? "active" : "inactive" })}
            />
          </div>
        </form>
      </MobileFullFormPanel>

      {/* View Trainer / Staff Profile */}
      {selectedTrainer && (() => {
        const t = selectedTrainer;
        const isStaff = t.role === "staff";
        const label = isStaff ? "Staff" : "Coach";
        const assigned = membersByTrainer[t.id] || [];
        const specs = Array.isArray(t.specializations) ? t.specializations : [];
        return (
          <DetailPanel
            open={viewPanelOpen}
            onClose={() => setViewPanelOpen(false)}
            eyebrow={isStaff ? "Staff" : "Trainer"}
            title={t.name}
            onEdit={() => openEditForm(t)}
            onDelete={() => promptDeleteTrainer(t)}
            onMore={() => setActionSheetTrainer(t)}
            footer={
              <>
                <Button
                  variant="outline"
                  onClick={() => openEditForm(t)}
                  className="flex-1 rounded-xl h-11 text-xs font-bold border-border text-foreground hover:bg-muted"
                >
                  <Edit2 className="w-4 h-4 mr-1.5" /> Edit {label}
                </Button>
                <Button
                  onClick={() => toggleStatus(t)}
                  className="flex-1 rounded-xl h-11 text-xs font-bold bg-primary text-white"
                >
                  <Power className="w-4 h-4 mr-1.5" />
                  {t.status === "inactive" ? "Enable" : "Disable"} {label}
                </Button>
              </>
            }
          >
            <div className="flex flex-col items-center text-center py-5 px-4 bg-card rounded-2xl border border-border">
              <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl overflow-hidden shadow-sm mb-2.5 border-2 border-card shrink-0">
                {t.photo_url ? (
                  <img src={getImageUrl(t.photo_url)} alt={t.name} className="w-full h-full object-cover block" />
                ) : (
                  t.name?.charAt(0).toUpperCase()
                )}
              </div>
              <h3 className="font-bold text-lg text-foreground leading-tight">{t.name}</h3>
              <p className="text-xs font-semibold text-primary mt-0.5">
                {isStaff ? t.bio || "Gym Operations Staff" : t.specialization}
              </p>
              <div className="flex items-center gap-2 mt-2.5">
                <Badge variant={isStaff ? "primary" : "green"}>{isStaff ? "Staff" : "Trainer"}</Badge>
                <Badge variant={t.status === "inactive" ? "red" : "green"} className="capitalize">
                  {t.status || "active"}
                </Badge>
              </div>
            </div>

            {!isStaff && (
              <div className="grid grid-cols-3 gap-2.5">
                <InfoTile label="Experience" value={`${t.experience_years || 0} yrs`} />
                <InfoTile label="Members" value={assigned.length} />
                <InfoTile label="Available" value={t.availability || "—"} tone="green" />
              </div>
            )}

            <DetailSection title="Contact" icon={Phone}>
              <DetailRow label="Phone" value={t.phone} />
              <DetailRow label="Email" value={t.email} />
            </DetailSection>

            <DetailSection title="Working Schedule" icon={CalendarClock}>
              <DetailRow label="Days" value={t.working_days} />
              <DetailRow label="Hours" value={t.working_hours} />
            </DetailSection>

            {!isStaff && (
              <DetailSection title="Expertise" icon={Award}>
                {specs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pb-2.5">
                    {specs.map((sp) => (
                      <Badge key={sp} variant="primary">{sp}</Badge>
                    ))}
                  </div>
                )}
                <DetailText label="Certifications" value={t.certifications} />
              </DetailSection>
            )}

            <DetailSection title={isStaff ? "About" : "Coach Bio"} icon={Briefcase}>
              <DetailText label="Bio" value={t.bio} />
              <DetailRow label="Joined" value={t.created_date} />
            </DetailSection>

            {!isStaff && (
              <DetailSection title={`Assigned Members (${assigned.length})`} icon={Users}>
                {assigned.length > 0 ? (
                  assigned.map((m) => (
                    <div key={m.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{m.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{m.plan_name}</p>
                      </div>
                      <Badge
                        variant={m.status === "active" ? "green" : m.status === "expiring" ? "amber" : "red"}
                        className="capitalize shrink-0"
                      >
                        {m.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No members assigned to this coach.</p>
                )}
              </DetailSection>
            )}
          </DetailPanel>
        );
      })()}

      {/* Delete Confirmation Alert Dialog with Reassignment */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="rounded-3xl bg-card border border-border max-w-sm">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-1">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              {assignedMembers.length > 0 ? "Reassign Assigned Members" : (trainerToDelete?.role === "staff" ? "Delete Staff Member?" : "Delete Trainer?")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {assignedMembers.length > 0 ? (
                <>
                  This trainer currently has{" "}
                  <strong className="text-foreground">{assignedMembers.length} members</strong>.
                  Please select where to reassign them before deletion.
                </>
              ) : (
                <>
                  Are you sure you want to permanently delete{" "}
                  <strong className="text-foreground">{trainerToDelete?.name}</strong>?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {assignedMembers.length > 0 && (
            <div className="my-2 p-3 bg-muted/40 rounded-xl border border-border">
              <Label htmlFor="trainers-reassign-members-to" className="text-xs font-semibold">Reassign members to:</Label>
              <select id="trainers-reassign-members-to" name="reassignTrainerId"
                autoComplete="off"
                value={reassignTrainerId}
                onChange={(e) => setReassignTrainerId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground font-medium mt-1"
              >
                <option value="none">Set to Unassigned</option>
                {trainers
                  .filter((t) => t.id !== trainerToDelete?.id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialization})
                    </option>
                  ))}
              </select>
            </div>
          )}

          <AlertDialogFooter className="mt-3 gap-2">
            <AlertDialogCancel
              disabled={deleting}
              className="rounded-xl h-11 border-border text-xs font-semibold"
            >
              Cancel
            </AlertDialogCancel>
            {assignedMembers.length > 0 ? (
              <Button
                type="button"
                disabled={deleting}
                onClick={handleReassignAndProceed}
                className="rounded-xl h-11 bg-amber-600 text-white text-xs font-bold"
              >
                Reassign & Delete
              </Button>
            ) : (
              <AlertDialogAction
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="rounded-xl h-11 bg-red-600 text-white text-xs font-bold"
              >
                {deleting ? "Deleting..." : (trainerToDelete?.role === "staff" ? "Delete Staff" : "Delete Trainer")}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
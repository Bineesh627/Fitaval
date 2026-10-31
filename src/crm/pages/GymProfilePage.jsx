import React, { useEffect, useState } from "react";
import { client } from "@/api/client";
import { getImageUrl } from "@/utils/imageUrl";
import VerifiedTick from "../../shared/VerifiedTick";
import { useVerified, CRM_GYM_ID } from "../../shared/verified";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Check,
  Camera,
  X,
  ExternalLink,
  Edit2,
  Sparkles,
} from "lucide-react";
import {
  PageHeader,
  MobileFullFormPanel,
} from "@/components/ui-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import OperatingHoursManager from "@/components/OperatingHoursManager";
import GymLocationPicker from "@/components/GymLocationPicker";
import {
  SERVICE_AMENITIES,
  FACILITY_AMENITIES,
  COMMON_AMENITIES,
  isServiceAmenity,
  DEFAULT_WEEK_SCHEDULE,
  formatWeeklyScheduleSummary,
} from "@/data";

export { SERVICE_AMENITIES, FACILITY_AMENITIES, COMMON_AMENITIES, isServiceAmenity };

export default function GymProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const verified = useVerified(CRM_GYM_ID);
  const [loading, setLoading] = useState(true);
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Tab inside mobile edit panel
  const [activeTab, setActiveTab] = useState("basic");
  const [amenityInput, setAmenityInput] = useState("");
  const [amenityEditCategory, setAmenityEditCategory] = useState("services"); // 'services' | 'facilities'
  const [amenityViewFilter, setAmenityViewFilter] = useState("all"); // 'all' | 'services' | 'facilities'

  // Mobile image lightbox viewer
  const [activeGalleryImage, setActiveGalleryImage] = useState(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Collapsible mobile sections
  const [expandedSection, setExpandedSection] = useState({
    hours: true,
    location: true,
    amenities: true,
    gallery: true,
  });

  const toggleSection = (sec) => {
    setExpandedSection((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const [form, setForm] = useState({
    name: "",
    logo_url: "",
    address: "",
    city: "",
    latitude: 28.4815,
    longitude: 77.0818,
    phone: "",
    email: "",
    operating_hours: "",
    weekly_schedule: DEFAULT_WEEK_SCHEDULE,
    description: "",
    amenities: [],
    gallery: [],
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const list = await client.entities.GymProfile.list("-created_date", 10);
      if (list.length > 0) {
        const item = list[0];
        setProfile(item);
        setForm({
          name: item.name || "",
          logo_url: item.logo_url || "",
          address: item.address || "",
          city: item.city || "",
          latitude: item.latitude || 28.4815,
          longitude: item.longitude || 77.0818,
          phone: item.phone || "",
          email: item.email || "",
          operating_hours: item.operating_hours || "",
          weekly_schedule: item.weekly_schedule || DEFAULT_WEEK_SCHEDULE,
          description: item.description || "",
          amenities: item.amenities || [],
          gallery: item.gallery || [],
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Error loading profile",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        operating_hours: formatWeeklyScheduleSummary(form.weekly_schedule),
      };

      let saved;
      if (profile?.id) {
        saved = await client.entities.GymProfile.update(profile.id, payload);
      } else {
        saved = await client.entities.GymProfile.create(payload);
      }
      setProfile(saved);
      setForm((prev) => ({ ...prev, ...saved }));
      setEditPanelOpen(false);

      toast({
        title: "Gym profile updated",
        description: "All details and schedules saved successfully.",
      });
    } catch (err) {
      toast({
        title: "Failed to update profile",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAmenity = (item) => {
    if (form.amenities.includes(item)) {
      setForm({ ...form, amenities: form.amenities.filter((a) => a !== item) });
    } else {
      setForm({ ...form, amenities: [...form.amenities, item] });
    }
  };

  const handleAddCustomAmenity = () => {
    const trimmed = amenityInput.trim();
    if (trimmed && !form.amenities.includes(trimmed)) {
      setForm({ ...form, amenities: [...form.amenities, trimmed] });
      setAmenityInput("");
    }
  };

  const uploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await client.integrations.Core.UploadPublicFile({ file });
      setForm((prev) => ({ ...prev, logo_url: file_url }));
      toast({ title: "Logo uploaded", description: "Save changes to finalize." });
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  };

  const uploadGalleryImage = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    try {
      const uploadPromises = files.map((file) =>
        client.integrations.Core.UploadPublicFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.file_url).filter(Boolean);

      setForm((prev) => ({
        ...prev,
        gallery: [...(prev.gallery || []), ...newUrls],
      }));

      toast({
        title: `${newUrls.length} ${newUrls.length === 1 ? "photo" : "photos"} added`,
        description: `Uploaded to gym gallery. Save profile to confirm changes.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Upload failed",
        description: err.message || "Failed to upload photos",
        variant: "destructive",
      });
    } finally {
      setUploadingGallery(false);
      if (e.target) e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
        <p className="text-xs text-muted-foreground font-medium">Loading Gym Profile...</p>
      </div>
    );
  }

  const gymLat = profile?.latitude || 28.4815;
  const gymLng = profile?.longitude || 77.0818;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${gymLat}&mlon=${gymLng}#map=16/${gymLat}/${gymLng}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${(Number(gymLng) - 0.008).toFixed(4)}%2C${(Number(gymLat) - 0.005).toFixed(4)}%2C${(Number(gymLng) + 0.008).toFixed(4)}%2C${(Number(gymLat) + 0.005).toFixed(4)}&layer=mapnik&marker=${gymLat}%2C${gymLng}`;

  return (
    <div className="space-y-4">
      {/* Mobile-First Header: ← Gym Profile     Edit */}
      <PageHeader
        title="Gym Profile"
        subtitle="Manage brand, hours, amenities & location"
        backTo="/settings"
        action={
          <Button
            onClick={() => {
              setActiveTab("basic");
              setEditPanelOpen(true);
            }}
            className="bg-primary text-primary-foreground rounded-2xl h-11 px-5 text-xs font-bold shadow-sm hover:bg-primary/90 touch-manipulation"
          >
            <Edit2 className="w-4 h-4 mr-1.5" />
            Edit
          </Button>
        }
      />

      {/* 1. Mobile Gym Hero Card */}
      <div className="rounded-3xl bg-card border border-border p-5 text-center flex flex-col items-center shadow-xs">
        <div className="w-16 h-16 min-w-[64px] max-w-[64px] h-[64px] rounded-2xl bg-muted border-2 border-border/70 flex items-center justify-center overflow-hidden mb-3 shadow-xs aspect-square shrink-0">
          {profile?.logo_url ? (
            <img
              src={getImageUrl(profile.logo_url)}
              alt="logo"
              className="w-full h-full object-cover shrink-0 block"
            />
          ) : (
            <Building2 className="w-8 h-8 text-primary" />
          )}
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-foreground inline-flex items-center justify-center gap-1.5">
          {profile?.name || "Fitaval Health & Fitness"}
          {verified && <VerifiedTick size={20} />}
        </h2>
        {verified && (
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
            Verified by Fitaval
          </span>
        )}
        <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>{profile?.city || "Gurugram, Haryana"}</span>
        </p>
      </div>

      {/* 2. Contact Information Card */}
      <div className="rounded-2xl bg-card border border-border p-4 space-y-3 shadow-xs">
        <p className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
          Contact Information
        </p>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold">Address</p>
              <p className="font-semibold text-foreground mt-0.5">
                {profile?.address || "Sector 18, Commercial Plaza, 3rd Floor"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold">Phone</p>
              <p className="font-semibold text-foreground mt-0.5">
                {profile?.phone || "+91 98765 43210"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold">Email</p>
              <p className="font-semibold text-foreground mt-0.5">
                {profile?.email || "info@fitaval.com"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. About Description */}
      {profile?.description && (
        <div className="rounded-2xl bg-card border border-border p-4 space-y-1.5 shadow-xs">
          <p className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
            About
          </p>
          <p className="text-xs text-foreground/85 leading-relaxed whitespace-pre-line">
            {profile.description}
          </p>
        </div>
      )}

      {/* 4. Services & Amenities Section */}
      <div className="rounded-2xl bg-card border border-border p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                Services & Amenities
              </p>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {profile?.amenities?.length || 0} Total
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Available facilities, wellness perks & member service offerings
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab("amenities");
              setEditPanelOpen(true);
            }}
            className="text-xs font-bold text-primary hover:underline shrink-0"
          >
            Edit
          </button>
        </div>

        {/* Filter chips: All / Services / Facilities */}
        {profile?.amenities?.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
            {[
              { id: "all", label: `All (${profile.amenities.length})` },
              {
                id: "services",
                label: `Services (${profile.amenities.filter(isServiceAmenity).length})`,
              },
              {
                id: "facilities",
                label: `Facilities (${profile.amenities.filter((a) => !isServiceAmenity(a)).length})`,
              },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setAmenityViewFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  amenityViewFilter === f.id
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {profile?.amenities?.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {profile.amenities
              .filter((a) => {
                if (amenityViewFilter === "services") return isServiceAmenity(a);
                if (amenityViewFilter === "facilities") return !isServiceAmenity(a);
                return true;
              })
              .map((a) => {
                const isService = isServiceAmenity(a);
                return (
                  <span
                    key={a}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isService
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-accent/60 text-accent-foreground border-border/80"
                    }`}
                  >
                    {isService ? (
                      <Sparkles className="w-3 h-3 text-primary shrink-0" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={3} />
                    )}
                    <span>{a}</span>
                    {isService && (
                      <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded-full bg-primary/15 text-primary ml-0.5">
                        Service
                      </span>
                    )}
                  </span>
                );
              })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No amenities or services configured.</p>
        )}
      </div>

      {/* 5. Mobile Operating Hours Card */}
      <div className="rounded-2xl bg-card border border-border p-4 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <p className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
              Operating Hours
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab("hours");
              setEditPanelOpen(true);
            }}
            className="text-xs font-bold text-primary hover:underline"
          >
            Edit Hours
          </button>
        </div>

        <div className="divide-y divide-border/60 text-xs">
          {[
            { day: "Monday", data: profile?.weekly_schedule?.monday },
            { day: "Tuesday", data: profile?.weekly_schedule?.tuesday },
            { day: "Wednesday", data: profile?.weekly_schedule?.wednesday },
            { day: "Thursday", data: profile?.weekly_schedule?.thursday },
            { day: "Friday", data: profile?.weekly_schedule?.friday },
            { day: "Saturday", data: profile?.weekly_schedule?.saturday },
            { day: "Sunday", data: profile?.weekly_schedule?.sunday },
          ].map(({ day, data }) => (
            <div key={day} className="py-2 flex items-center justify-between">
              <span className="font-semibold text-foreground">{day}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-mono ${
                    data?.enabled ? "text-foreground font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {data?.enabled ? `${data.open || "5:30 AM"} – ${data.close || "10:30 PM"}` : "Closed"}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    data?.enabled ? "bg-emerald-500" : "bg-muted-foreground/30"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Gym Location Mobile Card */}
      <div className="rounded-2xl bg-card border border-border p-4 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            <p className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
              Gym Location
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab("location");
              setEditPanelOpen(true);
            }}
            className="text-xs font-bold text-primary hover:underline"
          >
            Change Location
          </button>
        </div>

        <p className="text-xs font-semibold text-foreground">
          {profile?.address || "Sector 18, Commercial Plaza, 3rd Floor"}
        </p>

        {/* OpenStreetMap Live Embed */}
        <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-border bg-slate-100 shadow-inner">
          <iframe
            key={`${gymLat}-${gymLng}`}
            title="OpenStreetMap Gym Location"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src={osmEmbedUrl}
            className="w-full h-full border-0 rounded-2xl"
          />

          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-card/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-border text-[10px] text-foreground font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>OpenStreetMap</span>
          </div>

          <a
            href={osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-2 right-2 z-10 flex items-center gap-1 bg-card/95 hover:bg-card text-[11px] font-bold text-primary px-3 py-1.5 rounded-xl border border-border shadow-xs transition-colors"
          >
            <span>Open in OpenStreetMap</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 7. Mobile Responsive 2x2 Photo Gallery */}
      <div className="rounded-2xl bg-card border border-border p-4 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
            Photo Gallery
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveTab("gallery");
              setEditPanelOpen(true);
            }}
            className="text-xs font-bold text-primary hover:underline"
          >
            Manage Photos
          </button>
        </div>

        {profile?.gallery?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {profile.gallery.map((url, i) => (
              <div
                key={i}
                onClick={() => setActiveGalleryImage(url)}
                className="aspect-square rounded-xl overflow-hidden bg-muted border border-border/70 cursor-pointer active:scale-95 transition-transform"
              >
                <img
                  src={getImageUrl(url)}
                  alt="gym visual"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-border rounded-xl">
            <Camera className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">No photos uploaded yet</p>
          </div>
        )}
      </div>

      {/* Image Lightbox Viewer on Tap */}
      {activeGalleryImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveGalleryImage(null)}
        >
          <button
            type="button"
            onClick={() => setActiveGalleryImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center font-bold"
          >
            ✕
          </button>
          <img
            src={getImageUrl(activeGalleryImage)}
            alt=""
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}

      {/* Mobile-Friendly Full Screen Edit Profile Panel */}
      <MobileFullFormPanel
        open={editPanelOpen}
        onClose={() => setEditPanelOpen(false)}
        title="Edit Gym Profile"
        subtitle="Manage brand, hours, amenities & location"
        submitLabel="Save Profile"
        onSubmit={handleSaveProfile}
        isSubmitting={saving}
      >
        <div className="space-y-4">
          {/* Scrollable Navigation Chips for Edit Sections */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            {[
              { key: "basic", label: "Basic Info" },
              { key: "hours", label: "Operating Hours" },
              { key: "location", label: "Gym Location" },
              { key: "amenities", label: "Services & Amenities" },
              { key: "gallery", label: "Photo Gallery" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 1. Basic Information */}
          {activeTab === "basic" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
                  {form.logo_url ? (
                    <img
                      src={getImageUrl(form.logo_url)}
                      alt="logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <Label htmlFor="gym-logo-upload" className="text-xs font-semibold">Gym Logo</Label>
                  <label className="cursor-pointer block mt-1">
                    <input type="file" id="gym-logo-upload" name="logo" accept="image/*" onChange={uploadLogo} className="hidden" />
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold">
                      <Camera className="w-3.5 h-3.5" />
                      Upload Logo
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="gym-profile-gym-name" className="text-xs font-semibold">Gym Name *</Label>
                <Input id="gym-profile-gym-name" name="name"
                  autoComplete="organization"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="mt-1 rounded-xl h-11 text-xs sm:text-sm"
                />
              </div>

              <div>
                <Label htmlFor="gym-profile-phone-number" className="text-xs font-semibold">Phone Number *</Label>
                <Input id="gym-profile-phone-number" name="phone"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="mt-1 rounded-xl h-11 text-xs sm:text-sm"
                />
              </div>

              <div>
                <Label htmlFor="gym-profile-email-address" className="text-xs font-semibold">Email Address *</Label>
                <Input id="gym-profile-email-address" name="email"
                  autoComplete="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="mt-1 rounded-xl h-11 text-xs sm:text-sm"
                />
              </div>

              <div>
                <Label htmlFor="gym-profile-about-description" className="text-xs font-semibold">About / Description</Label>
                <Textarea id="gym-profile-about-description" name="description"
                  autoComplete="off"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="mt-1 rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {/* 2. Operating Hours Manager */}
          {activeTab === "hours" && (
            <div className="space-y-3">
              <OperatingHoursManager
                value={form.weekly_schedule}
                onChange={(sched) => setForm((prev) => ({ ...prev, weekly_schedule: sched }))}
              />
            </div>
          )}

          {/* 3. Gym Location Manager */}
          {activeTab === "location" && (
            <div className="space-y-3">
              <GymLocationPicker
                address={form.address}
                city={form.city}
                latitude={form.latitude}
                longitude={form.longitude}
                onChange={(loc) => {
                  setForm((prev) => ({
                    ...prev,
                    address: loc.address,
                    city: loc.city,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                  }));
                }}
              />
            </div>
          )}

          {/* 4. Amenities & Services */}
          {activeTab === "amenities" && (
            <div className="space-y-4">
              {/* Category selector */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  Select Category:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAmenityEditCategory("services")}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      amenityEditCategory === "services"
                        ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                        : "bg-card border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Service Amenities</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-normal mt-0.5">
                      Coaching, classes, diet & wellness
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAmenityEditCategory("facilities")}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      amenityEditCategory === "facilities"
                        ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                        : "bg-card border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <Check className="w-3.5 h-3.5" />
                      <span>Facility Amenities</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-normal mt-0.5">
                      Infrastructure, equipment & floor
                    </p>
                  </button>
                </div>
              </div>

              {/* Quick toggle chips based on selected category */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  Tap to toggle {amenityEditCategory === "services" ? "service" : "facility"} amenities:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(amenityEditCategory === "services" ? SERVICE_AMENITIES : FACILITY_AMENITIES).map(
                    (item) => {
                      const isSelected = form.amenities.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleToggleAmenity(item)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                              : "bg-card text-muted-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {item}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Add Custom Amenity or Service */}
              <div className="pt-2 border-t border-border">
                <Label htmlFor="gym-profile-add-custom-amenity-or-service" className="text-xs font-semibold">Add Custom Amenity or Service</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="gym-profile-add-custom-amenity-or-service" name="amenityInput"
                    autoComplete="off"
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    placeholder="e.g. Olympic Lifting Zone or Cryotherapy"
                    className="rounded-xl h-11 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomAmenity();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomAmenity}
                    className="bg-primary text-white rounded-xl px-4 text-xs font-bold h-11"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Selected Amenities List */}
              {form.amenities.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold text-foreground">
                      Selected Amenities ({form.amenities.length}):
                    </p>
                    <span className="text-[11px] text-muted-foreground">
                      {form.amenities.filter(isServiceAmenity).length} Services ·{" "}
                      {form.amenities.filter((a) => !isServiceAmenity(a)).length} Facilities
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {form.amenities.map((a) => {
                      const isService = isServiceAmenity(a);
                      return (
                        <span
                          key={a}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                            isService
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "bg-accent text-accent-foreground border-primary/20"
                          }`}
                        >
                          {isService && <Sparkles className="w-3 h-3 text-primary mr-0.5" />}
                          {a}
                          <button
                            type="button"
                            onClick={() => handleToggleAmenity(a)}
                            className="text-muted-foreground hover:text-red-600 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. Photo Gallery */}
          {activeTab === "gallery" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="gym-gallery-upload" className="text-xs font-semibold">Upload Gym Photos</Label>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {form.gallery.length} photos in gallery
                </span>
              </div>
              <label className={`block ${uploadingGallery ? "pointer-events-none opacity-70" : "cursor-pointer"}`}>
                <input
                  type="file"
                  id="gym-gallery-upload"
                  name="gallery"
                  accept="image/*"
                  multiple
                  disabled={uploadingGallery}
                  onChange={uploadGalleryImage}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:bg-muted/40 transition-colors">
                  {uploadingGallery ? (
                    <div className="flex flex-col items-center justify-center py-1">
                      <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-2" />
                      <p className="text-xs font-bold text-foreground">Uploading photos...</p>
                      <p className="text-[10px] text-muted-foreground">Adding selected images to gallery</p>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-primary mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-foreground">Tap to select photos</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Select multiple gym images at once (JPEG, PNG, WebP)
                      </p>
                    </>
                  )}
                </div>
              </label>

              {form.gallery.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                  {form.gallery.map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-xl overflow-hidden border border-border shadow-xs"
                    >
                      <img
                        src={getImageUrl(url)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            gallery: form.gallery.filter((_, idx) => idx !== i),
                          })
                        }
                        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </MobileFullFormPanel>
    </div>
  );
}
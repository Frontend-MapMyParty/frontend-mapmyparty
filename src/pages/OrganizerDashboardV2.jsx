import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { clearSessionData, resetSessionCache } from "@/utils/auth";
import { buildUrl, apiFetch } from "@/config/api";
import {
  Calendar,
  X,
  MapPin,
  User,
  Mail,
  Phone,
  Edit2,
  Save,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Menu,
  Home,
  Users,
  Download,
  ChevronDown,
  LogOut,
  Radio,
  Shield,
  BadgeCheck,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  ExternalLink,
  Building2,
  CheckCircle2,
  Globe,
} from "lucide-react";
import FinancialReporting from "./FinancialReporting";
import OrganizerDash from "./OrganizerDash";
import AudienceAnalytics from "./AudienceAnalytics";
import MyEvents from "./MyEvents";
import LiveEvents from "./LiveEvents";
import Reception from "./Reception";

// Profile Content Component
const OrganizerProfileContent = ({ user }) => {
  const buildInitialData = (payload = {}) => ({
    id: payload.id || "organizer-uuid",
    name: payload.name || "Awesome Events",
    description: payload.description || "We organize the best events in town!",
    logo: payload.logo || "",
    state: payload.state || "California",
    address: payload.address || "123 Main St, Los Angeles, CA",
    isVerified: payload.isVerified ?? true,
    ownerId: payload.ownerId || "user-uuid",
    createdAt: payload.createdAt || "2024-01-01T00:00:00.000Z",
    updatedAt: payload.updatedAt || "2024-01-01T00:00:00.000Z",
    contact: payload.contact || "+1234567890",
    email: payload.email || "contact@awesomeevents.com",
    instagram: payload.instagram || "https://instagram.com/awesomeevents",
    linkedin: payload.linkedin || "https://linkedin.com/company/awesome-events",
    facebook: payload.facebook || "https://facebook.com/awesomeevents",
    reddit: payload.reddit || "u/awesomeevents",
    x: payload.x || "https://twitter.com/awesomeevents",
    snapchat: payload.snapchat || "awesomeevents",
    counts: {
      events: payload?._count?.events ?? 25,
      images: payload?._count?.images ?? 50,
      payouts: payload?._count?.payouts ?? 15,
      tours: payload?._count?.tours ?? 3,
      reviews: payload?._count?.reviews ?? 100,
    },
    bankDetails: {
      accountHolder: payload?.bankDetails?.accountHolder || "Awesome Events",
      accountNumber: payload?.bankDetails?.accountNumber || "****1234",
      ifscCode: payload?.bankDetails?.ifscCode || "SBIN0001234",
      bankName: payload?.bankDetails?.bankName || "State Bank of India",
      providerName: payload?.bankDetails?.providerName || "Razorpay",
      verificationStatus: payload?.bankDetails?.verificationStatus || "VERIFIED",
      verificationTxnId: payload?.bankDetails?.verificationTxnId || "txn-uuid",
      createdAt: payload?.bankDetails?.createdAt || "2024-01-01T00:00:00.000Z",
      updatedAt: payload?.bankDetails?.updatedAt || "2024-01-01T00:00:00.000Z",
    },
  });

  const [profileData, setProfileData] = useState(() => buildInitialData(user));
  const [editData, setEditData] = useState(() => buildInitialData(user));
  const [bankDraft, setBankDraft] = useState(() => buildInitialData(user).bankDetails);
  const [isEditing, setIsEditing] = useState(false);
  const [isBankPanelOpen, setIsBankPanelOpen] = useState(false);
  const [isBankEditing, setIsBankEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBankSaving, setIsBankSaving] = useState(false);
  const [isBankLoading, setIsBankLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fresh = buildInitialData(user);
    setProfileData(fresh);
    setEditData(fresh);
    setBankDraft(fresh.bankDetails);
  }, [user]);

  const fetchOrganizerProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await apiFetch("organizer/me/profile", { method: "GET" });
      const data = res?.data || res || {};
      const normalized = buildInitialData(data);
      setProfileData(normalized);
      setEditData(normalized);
      setBankDraft(normalized.bankDetails);
    } catch (error) {
      console.error("Failed to load organizer profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizerProfile();
  }, [fetchOrganizerProfile]);

  const formatDate = (value) => {
    try {
      return new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return value || "—";
    }
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = {
        name: editData.name,
        description: editData.description,
        instagram: editData.instagram,
        linkedin: editData.linkedin,
        facebook: editData.facebook,
        reddit: editData.reddit,
        x: editData.x,
        snapchat: editData.snapchat,
        contact: editData.contact,
        email: editData.email,
      };
      const res = await apiFetch("organizer/me/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      const data = res?.data || res || {};
      const normalized = buildInitialData(data);
      setProfileData(normalized);
      setEditData(normalized);
      setBankDraft(normalized.bankDetails);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save organizer profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profileData);
  };

  const handleOpenBankPanel = async () => {
    setIsBankLoading(true);
    try {
      const res = await apiFetch("organizer/me/bank-details", { method: "GET" });
      const data = res?.data || res || {};
      setBankDraft((prev) => ({ ...prev, ...data }));
      setProfileData((prev) => ({ ...prev, bankDetails: { ...prev.bankDetails, ...data } }));
      setEditData((prev) => ({ ...prev, bankDetails: { ...prev.bankDetails, ...data } }));
    } catch (error) {
      console.error("Failed to load bank details:", error);
      setBankDraft(editData.bankDetails);
    } finally {
      setIsBankEditing(false);
      setIsBankPanelOpen(true);
      setIsBankLoading(false);
    }
  };

  const handleBankFieldChange = (field, value) => {
    setBankDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveBank = async () => {
    if (isBankSaving) return;
    setIsBankSaving(true);
    try {
      const payload = {
        accountHolder: bankDraft.accountHolder,
        accountNumber: bankDraft.accountNumber,
        ifscCode: bankDraft.ifscCode,
        bankName: bankDraft.bankName,
      };
      const res = await apiFetch("organizer/me/bank-details", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      const data = res?.data || res || {};
      setBankDraft((prev) => ({ ...prev, ...data }));
      setProfileData((prev) => ({ ...prev, bankDetails: { ...prev.bankDetails, ...data } }));
      setEditData((prev) => ({ ...prev, bankDetails: { ...prev.bankDetails, ...data } }));
      setIsBankEditing(false);
      setIsBankPanelOpen(false);
    } catch (error) {
      console.error("Failed to save bank details:", error);
    } finally {
      setIsBankSaving(false);
    }
  };

  const handleCancelBank = () => {
    setBankDraft(profileData.bankDetails);
    setIsBankEditing(false);
    setIsBankPanelOpen(false);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">Organizer Profile</p>
          <h2 className="text-3xl font-extrabold">Profile &amp; Payouts</h2>
          <p className="text-sm text-white/60">Keep organizer contact, socials, and payouts current.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenBankPanel}
            disabled={isBankLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-4 h-4" />
            {isBankLoading ? "Loading..." : "Bank Details"}
          </button>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/15 transition"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white/5 rounded-2xl border border-white/10 shadow-lg shadow-black/30 overflow-hidden backdrop-blur">
        {/* Profile Header Section */}
        <div className="relative bg-gradient-to-r from-[#f43f5e] via-[#ec4899] to-[#6366f1] px-8 py-10 border-b border-white/10 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_35%)]" />
          <div className="relative flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-4xl shadow-lg border border-white/30 overflow-hidden">
                {editData.logo ? (
                  <img src={editData.logo} alt={editData.name} className="w-full h-full object-cover" />
                ) : (
                  (editData.name || "U").charAt(0).toUpperCase()
                )}
              </div>
              <div className="text-white space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-3xl font-bold">{editData.name}</h2>
                  {editData.isVerified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-50 text-xs font-semibold border border-emerald-300/40">
                      <BadgeCheck className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                </div>
                {/* <p className="text-white/80 text-sm">{editData.description}</p> */}
                <div className="flex items-center gap-3 text-white/70 text-xs flex-wrap">
                  <Mail className="w-4 h-4" />
                  <span>{editData.email}</span>
                  <span className="h-1 w-1 rounded-full bg-white/40" />
                  <Phone className="w-4 h-4" />
                  <span>{editData.contact}</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end gap-3 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{editData.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(editData.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-8 space-y-6 bg-[#0b1220]/80">
          {loadingProfile ? (
            <div className="text-white/70 text-sm">Loading organizer profile…</div>
          ) : !isEditing ? (
            // View Mode
            <div className="space-y-6">
              {/* Snapshot */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: "Events", value: editData.counts.events, color: "from-sky-500/50 to-blue-600/50" },
                  { label: "Images", value: editData.counts.images, color: "from-purple-500/50 to-pink-500/50" },
                  { label: "Payouts", value: editData.counts.payouts, color: "from-emerald-500/50 to-teal-500/50" },
                  { label: "Tours", value: editData.counts.tours, color: "from-amber-500/50 to-orange-500/50" },
                  { label: "Reviews", value: editData.counts.reviews, color: "from-indigo-500/50 to-violet-500/50" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`rounded-xl border border-white/10 bg-gradient-to-br ${stat.color} p-3 shadow-lg shadow-black/30`}
                  >
                    <p className="text-xs uppercase tracking-wide text-white/70">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Contact & Location */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Contact &amp; Reach</h3>
                  {/* <span className="text-xs text-white/50">Owner: {editData.ownerId}</span> */}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0 border border-rose-500/30">
                      <Mail className="w-5 h-5 text-rose-100" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">Email Address</p>
                      <p className="text-base font-semibold text-white mt-1">{editData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                      <Phone className="w-5 h-5 text-emerald-100" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">Contact</p>
                      <p className="text-base font-semibold text-white mt-1">{editData.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                      <MapPin className="w-5 h-5 text-blue-100" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">State</p>
                      <p className="text-base font-semibold text-white mt-1">{editData.state}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
                      <Globe className="w-5 h-5 text-indigo-100" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">Address</p>
                      <p className="text-base font-semibold text-white mt-1">{editData.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">About Organizer</h3>
                  <span className="text-xs text-white/50">Updated {formatDate(editData.updatedAt)}</span>
                </div>
                <p className="text-white/80 leading-relaxed bg-white/5 border border-white/10 p-4 rounded-xl">
                  {editData.description}
                </p>
              </div>

              {/* Socials */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Social Handles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { label: "Instagram", value: editData.instagram, icon: <Instagram className="w-4 h-4" /> },
                    { label: "LinkedIn", value: editData.linkedin, icon: <Linkedin className="w-4 h-4" /> },
                    { label: "Facebook", value: editData.facebook, icon: <Facebook className="w-4 h-4" /> },
                    { label: "X (Twitter)", value: editData.x, icon: <Twitter className="w-4 h-4" /> },
                    { label: "Reddit", value: editData.reddit, icon: <Users className="w-4 h-4" /> },
                    { label: "Snapchat", value: editData.snapchat, icon: <User className="w-4 h-4" /> },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.value || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition"
                    >
                      <span className="flex items-center gap-2">
                        {social.icon}
                        {social.label}
                      </span>
                      <ExternalLink className="w-4 h-4 text-white/50" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Bank Summary */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-400/40">
                    <CreditCard className="w-5 h-5 text-emerald-100" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/50">Payout Provider</p>
                    <p className="text-base font-semibold text-white">
                      {editData.bankDetails.providerName} • {editData.bankDetails.verificationStatus}
                    </p>
                    <p className="text-xs text-white/60">Txn ID: {editData.bankDetails.verificationTxnId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60 hidden md:inline">Manage payouts</span>
                  <button
                    onClick={handleOpenBankPanel}
                    className="px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-md"
                  >
                    View Bank
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">Organizer Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-rose-500/60 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">Email Address</label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-rose-500/60 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">Contact</label>
                  <input
                    type="text"
                    value={editData.contact}
                    onChange={(e) => handleInputChange("contact", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-rose-500/60 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">State</label>
                  <input
                    type="text"
                    value={editData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-rose-500/60 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-white/80">Address</label>
                  <input
                    type="text"
                    value={editData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-rose-500/60 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-white/80">Description</label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-rose-500/60 focus:outline-none min-h-[120px]"
                  />
                </div>
              </div>

              {/* Socials edit */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Social Handles</h3>
                  <span className="text-xs text-white/50">Share reachable links</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "instagram", label: "Instagram URL" },
                    { key: "linkedin", label: "LinkedIn URL" },
                    { key: "facebook", label: "Facebook URL" },
                    { key: "x", label: "X (Twitter) URL" },
                    { key: "reddit", label: "Reddit handle or URL" },
                    { key: "snapchat", label: "Snapchat handle" },
                  ].map((social) => (
                    <div className="space-y-2" key={social.key}>
                      <label className="block text-sm font-medium text-white/80">{social.label}</label>
                      <input
                        type="text"
                        value={editData[social.key]}
                        onChange={(e) => handleInputChange(social.key, e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-rose-500/60 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-500 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bank detail slide-over */}
      {isBankPanelOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCancelBank} />
          <div className="relative ml-auto h-full w-full max-w-lg bg-[#0d1324] border-l border-white/10 shadow-2xl shadow-black/40 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Payouts</p>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-200" />
                  Bank Details
                </h2>
              </div>
              <button onClick={handleCancelBank} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wide text-white/50">Provider</p>
                  <p className="text-lg font-semibold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-200" />
                    {bankDraft.providerName}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wide text-white/50">Status</p>
                  <p className="text-lg font-semibold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    {bankDraft.verificationStatus}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">Account</h4>
                  <span className="text-xs text-white/60">Txn: {bankDraft.verificationTxnId}</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { key: "accountHolder", label: "Account Holder" },
                    { key: "bankName", label: "Bank Name" },
                    { key: "accountNumber", label: "Account Number" },
                    { key: "ifscCode", label: "IFSC Code" },
                  ].map((field) => (
                    <div key={field.key}>
                      <p className="text-xs uppercase tracking-wide text-white/50">{field.label}</p>
                      {isBankEditing ? (
                        <input
                          type="text"
                          value={bankDraft[field.key]}
                          onChange={(e) => handleBankFieldChange(field.key, e.target.value)}
                          className="mt-1 w-full px-4 py-2 rounded-lg bg-[#0b1220] border border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                        />
                      ) : (
                        <p className="text-base font-semibold text-white mt-1">{bankDraft[field.key]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wide text-white/50">Created</p>
                  <p className="text-base font-semibold text-white">{formatDate(bankDraft.createdAt)}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wide text-white/50">Updated</p>
                  <p className="text-base font-semibold text-white">{formatDate(bankDraft.updatedAt)}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-white/5 flex items-center gap-3">
              {isBankEditing ? (
                <>
                  <button
                    onClick={handleSaveBank}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition"
                  >
                    <Save className="w-4 h-4" />
                    Save Bank Details
                  </button>
                  <button
                    onClick={handleCancelBank}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsBankEditing(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/15 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Bank Details
                  </button>
                  <button
                    onClick={handleCancelBank}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrganizerDashboardV2 = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [footerMenuOpen, setFooterMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Note: Authentication is handled by ProtectedRoute wrapper
  // No need for redundant auth check here

  // Organizer profile from session - will be populated after ProtectedRoute validates
  const [user, setUser] = useState({ name: "Organizer", email: "" });
  useEffect(() => {
    // Fetch user data from validated session (ProtectedRoute ensures we're authenticated)
    const loadUserData = async () => {
      try {
        const { fetchSession } = await import("@/utils/auth");
        const session = await fetchSession();
        if (session?.user) {
          setUser({
            name: session.user.name || sessionStorage.getItem("userName") || "Organizer",
            email: session.user.email || sessionStorage.getItem("userEmail") || "",
          });
        } else {
          // Fallback to sessionStorage if session.user not available yet
          const profileRaw = sessionStorage.getItem("userProfile");
          const profile = profileRaw ? JSON.parse(profileRaw) : {};
          const name = sessionStorage.getItem("userName") || profile.name || "Organizer";
          const email = sessionStorage.getItem("userEmail") || profile.email || "";
          setUser({ name, email });
        }
      } catch (err) {
        console.warn("Failed to load user data:", err);
        // Fallback to sessionStorage
        try {
          const profileRaw = sessionStorage.getItem("userProfile");
          const profile = profileRaw ? JSON.parse(profileRaw) : {};
          const name = sessionStorage.getItem("userName") || profile.name || "Organizer";
          const email = sessionStorage.getItem("userEmail") || profile.email || "";
          setUser({ name, email });
        } catch {}
      }
    };
    loadUserData();
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    // Call logout API to clear cookies on backend (if available)
    try {
      await fetch(buildUrl("auth/logout"), {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      // Continue even if logout API fails
      console.warn("Logout API call failed:", err);
    }
    
    // Clear all session data using centralized function
    clearSessionData();
    resetSessionCache();
    
    // Redirect to home
    navigate("/");
    setIsLoggingOut(false);
  };


  // Navigation items with their corresponding tab values
  const navItems = [
    { id: "dashboard", name: "Dashboard", icon: <Home className="w-6 h-6 mr-3" /> },
    { id: "myevents", name: "My Events", icon: <Calendar className="w-6 h-6 mr-3" /> },
    { id: "analytics", name: "Audience Analytics", icon: <Users className="w-6 h-6 mr-3" /> },
    { id: "live", name: "Live Events", icon: <Radio className="w-6 h-6 mr-3" /> },
    { id: "reception", name: "Reception", icon: <Shield className="w-6 h-6 mr-3" /> },
    { id: "financial", name: "Financial Reporting", icon: <Download className="w-6 h-6 mr-3" /> },
  ];

  // Sync active tab from URL
  useEffect(() => {
    const path = location.pathname || "";
    if (path.startsWith("/organizer/myevents")) setActiveTab("myevents");
    else if (path.startsWith("/organizer/analytics")) setActiveTab("analytics");
    else if (path.startsWith("/organizer/live")) setActiveTab("live");
    else if (path.startsWith("/organizer/reception")) setActiveTab("reception");
    else if (path.startsWith("/organizer/financial")) setActiveTab("financial");
    else setActiveTab("dashboard");
  }, [location.pathname]);

  const handleNav = (id) => {
    setActiveTab(id);
    const base = id === "dashboard" ? "/organizer/dashboard" : `/organizer/${id}`;
    navigate(base);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0b1220] via-[#0b0f1a] to-[#0a0b10] text-white">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-24"} bg-[#0f1628] border-r border-white/10 flex flex-col transition-all duration-300`}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h1
            className={`text-2xl font-extrabold tracking-tight ${sidebarOpen ? "block" : "hidden"}`}
          >
            <span className="text-red-500">Map</span><span className="text-white">MyParty</span>
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/5 text-white/80"
          >
            {sidebarOpen ? <ChevronLeft className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex items-center w-full px-3 py-3 text-sm font-medium rounded-xl transition ${
                  activeTab === item.id
                    ? "text-white bg-white/10 border border-white/10 shadow-lg shadow-black/20"
                    : "text-white/70 hover:bg-white/5"
                }`}
              >
                <span className="mr-3 text-white/80">{item.icon}</span>
                {sidebarOpen && item.name}
              </button>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer with profile + logout */}
        <div className="mt-auto p-4 border-t border-white/10">
          <div
            className="relative bg-gradient-to-br from-white/5 via-white/0 to-blue-500/5 border border-white/10 rounded-xl p-3 shadow-lg shadow-black/20"
            onMouseEnter={() => setFooterMenuOpen(true)}
            onMouseLeave={() => setFooterMenuOpen(false)}
          >
            <button
              onClick={() => setFooterMenuOpen((v) => !v)}
              className="flex items-center gap-3 w-full text-left hover:bg-white/5 transition rounded-lg px-2 py-1"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/30 via-blue-500/30 to-red-500/30 flex items-center justify-center text-red-100 font-semibold border border-white/10">
                {(user.name || "U").charAt(0).toUpperCase()}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name || "Organizer"}</p>
                </div>
              )}
              {sidebarOpen && (
                <ChevronDown
                  className={`w-4 h-4 text-white/70 transition-transform ${
                    footerMenuOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            {footerMenuOpen && (
              <div className="absolute bottom-[calc(100%+10px)] left-0 right-0 z-20">
                <div className="rounded-xl border border-white/10 bg-[#0f1628]/95 backdrop-blur-md shadow-xl shadow-black/30 p-2 space-y-2">
                  <button
                    onClick={() => {
                      setActiveTab("profile");
                      setFooterMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
                  >
                    <User className="w-4 h-4" />
                    {sidebarOpen && <span>My Profile</span>}
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-200 hover:bg-red-500/20 transition disabled:opacity-60"
                  >
                    {isLoggingOut ? (
                      <span className="h-4 w-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    {sidebarOpen && <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {/* Tab Content */}
          <div className="p-4 lg:p-5 space-y-5">
            {activeTab === "dashboard" && (
              <OrganizerDash
                user={user}
                handleLogout={handleLogout}
                setActiveTab={setActiveTab}
                activeTab={activeTab}
              />
            )}

            {activeTab === "myevents" && <MyEvents />}
            {activeTab === "analytics" && <AudienceAnalytics />}
            {activeTab === "live" && <LiveEvents />}
            {activeTab === "reception" && <Reception />}
            {activeTab === "financial" && <FinancialReporting />}
            {activeTab === "profile" && <OrganizerProfileContent user={user} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default OrganizerDashboardV2;

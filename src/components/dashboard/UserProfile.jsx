import { useMemo, useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar as CalendarIcon,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  PencilLine,
  User,
  Lock,
  Edit2,
  Check,
  X,
  Camera,
  Ticket,
  TrendingUp,
  Heart,
  Star
} from "lucide-react";
import { isAuthenticated } from "@/utils/auth";
import { apiFetch } from "@/config/api";
import { toast } from "sonner";

const roleLabelMap = {
  organizer: "Organizer",
  promoter: "Promoter",
  user: "Attendee",
};

const avatarOptions = [
  {
    id: "avatar-1",
    label: "Acoustic Dreamer",
    url: "https://api.dicebear.com/7.x/adventurer/png?seed=FestivalDreamer&backgroundColor=ffdfbf",
  },
  {
    id: "avatar-2",
    label: "Festival Vibes",
    url: "https://api.dicebear.com/7.x/bottts/png?seed=PartyLover&backgroundColor=f0f4ff",
  },
  {
    id: "avatar-3",
    label: "City Explorer",
    url: "https://api.dicebear.com/7.x/croodles/png?seed=CityExplorer&backgroundColor=d1f7ff",
  },
  {
    id: "avatar-4",
    label: "Night Groove",
    url: "https://api.dicebear.com/7.x/micah/png?seed=NightGroove&backgroundColor=ffe0f0",
  },
];

const sampleProfile = {
  name: "Rachel Derek",
  role: "user",
  location: "Sylhet, Bangladesh",
  email: "rachel@calme.io",
  phone: "+1 (231) 342-3245",
  passwordMasked: "********",
  dateOfBirth: "1995-06-15",
  memberSince: "2023-06-12T00:00:00Z",
  avatarUrl: "https://api.dicebear.com/7.x/adventurer-neutral/png?seed=MapMyParty&backgroundColor=fff1d6",
};

const normalizeRole = (value) => {
  if (!value) return "user";
  const lower = String(value).toLowerCase();
  if (lower.includes("organizer")) return "organizer";
  if (lower.includes("promoter")) return "promoter";
  return "user";
};

const getStoredProfile = () => {
  const fallback = {
    name: sessionStorage.getItem("userName") || "",
    email: sessionStorage.getItem("userEmail") || "",
    phone: sessionStorage.getItem("userPhone") || "",
    role: sessionStorage.getItem("role") || sessionStorage.getItem("userType") || "USER",
  };

  const storedRaw = sessionStorage.getItem("userProfile");
  if (!storedRaw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(storedRaw);
    return {
      ...fallback,
      ...parsed,
    };
  } catch (error) {
    console.warn("⚠️ Failed to parse stored user profile", error);
    return fallback;
  }
};

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

const getInitials = (name, email) => {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "U";
};

export default function UserProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [passwordValues, setPasswordValues] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const storedProfile = useMemo(() => getStoredProfile(), []);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch("/api/user/profile", {
        method: "GET",
      });

      if (response?.success && response?.data) {
        setProfileData(response.data);

        sessionStorage.setItem("userName", response.data.name || "");
        sessionStorage.setItem("userEmail", response.data.email || "");
        sessionStorage.setItem("userPhone", response.data.phone || "");

        if (response.data.user_roles && response.data.user_roles.length > 0) {
          const roleName = response.data.user_roles[0]?.roles?.name || "USER";
          sessionStorage.setItem("role", roleName);
          sessionStorage.setItem("userType", roleName);
        }
      }
    } catch (err) {
      console.error("❌ Error fetching profile:", err);
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const profile = useMemo(() => {
    if (profileData) {
      const apiRole = profileData.user_roles?.[0]?.roles?.name || 'USER';
      return {
        ...sampleProfile,
        name: profileData.name || sampleProfile.name,
        email: profileData.email || sampleProfile.email,
        phone: profileData.phone || sampleProfile.phone,
        role: apiRole,
        memberSince: profileData.createdAt,
        isVerified: profileData.isVerified,
      };
    }
    
    return {
      ...sampleProfile,
      ...storedProfile,
      name: storedProfile.name || sampleProfile.name,
      email: storedProfile.email || sampleProfile.email,
      phone: storedProfile.phone || sampleProfile.phone,
      role: storedProfile.role || sampleProfile.role,
    };
  }, [profileData, storedProfile]);

  const role = normalizeRole(profile.role);
  const memberSince = formatDate(profile.memberSince) || "March 2024";

  const handleEditClick = useCallback((field) => {
    setEditField(field);
    if (field === "name") {
      setEditValue(profile.name || "");
      setPasswordValues({ current: "", new: "", confirm: "" });
    } else if (field === "email") {
      setEditValue(profile.email || "");
      setPasswordValues({ current: "", new: "", confirm: "" });
    } else if (field === "phone") {
      setEditValue(profile.phone || "");
      setPasswordValues({ current: "", new: "", confirm: "" });
    } else if (field === "dateOfBirth") {
      setEditValue(profile.dateOfBirth || "");
      setPasswordValues({ current: "", new: "", confirm: "" });
    } else {
      setEditValue("");
      setPasswordValues({ current: "", new: "", confirm: "" });
    }
  }, [profile.name, profile.email, profile.phone, profile.dateOfBirth]);

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!editField) {
      return;
    }

    setIsSaving(true);

    let payload = {};
    let endpoint = "/api/user/profile";
    if (editField === "name") {
      const trimmedValue = editValue.trim();
      if (!trimmedValue) {
        toast.error("Please enter a valid name.");
        setIsSaving(false);
        return;
      }

      payload = {
        name: trimmedValue,
      };
    } else if (editField === "dateOfBirth") {
      const trimmedValue = editValue.trim();
      if (!trimmedValue) {
        toast.error("Please select a date of birth.");
        setIsSaving(false);
        return;
      }

      payload = {
        dateOfBirth: trimmedValue,
      };
    } else if (editField === "email") {
      const trimmedValue = editValue.trim();
      if (!trimmedValue) {
        toast.error("Please enter a value before saving.");
        setIsSaving(false);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
        toast.error("Please enter a valid email address.");
        setIsSaving(false);
        return;
      }

      payload = {
        email: trimmedValue,
      };
    } else if (editField === "phone") {
      const trimmedValue = editValue.trim();
      if (!trimmedValue) {
        toast.error("Please enter a value before saving.");
        setIsSaving(false);
        return;
      }

      const sanitizedPhone = trimmedValue.replace(/[^0-9+]/g, "");
      payload = {
        phone: sanitizedPhone,
      };
    } else if (editField === "password") {
      const currentPassword = passwordValues.current.trim();
      const newPassword = passwordValues.new.trim();
      const confirmPassword = passwordValues.confirm.trim();

      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error("Please fill in all password fields.");
        setIsSaving(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match.");
        setIsSaving(false);
        return;
      }

      payload = {
        currentPassword,
        newPassword,
      };
      endpoint = "/api/user/change-password";
    }

    try {
      const response = await apiFetch(endpoint, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const isSuccess = response?.status === "success" || response?.success === true;
      if (!isSuccess) {
        throw new Error(response?.message || response?.error || "Failed to update profile");
      }

      if (editField === "password") {
        toast.success(response?.message || "Password updated successfully");
        setEditField(null);
        setEditValue("");
        setPasswordValues({ current: "", new: "", confirm: "" });
        return;
      }

      const optimisticData = {
        ...(profileData || {}),
        name: payload.name ?? profile.name,
        email: payload.email ?? profile.email,
        phone: payload.phone ?? profile.phone,
        dateOfBirth: payload.dateOfBirth ?? profile.dateOfBirth,
      };
      setProfileData(optimisticData);

      if (payload.name !== undefined) {
        sessionStorage.setItem("userName", payload.name || "");
      }
      if (payload.email !== undefined) {
        sessionStorage.setItem("userEmail", payload.email || "");
      }
      if (payload.phone !== undefined) {
        sessionStorage.setItem("userPhone", payload.phone || "");
      }

      toast.success(response?.message || "Profile updated successfully");
      setEditField(null);

      fetchProfile();
    } catch (saveError) {
      console.error("Failed to update profile", saveError);
      toast.error(saveError.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateOfBirth = (dob) => {
    if (!dob) return "Not set";
    try {
      const date = new Date(dob);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Not set";
    }
  };

  const detailRows = useMemo(
    () => [
      {
        label: "Full Name",
        value: profile.name,
        actions: [
          {
            label: "Edit name",
            type: "icon",
            onClick: () => handleEditClick("name"),
          },
        ],
      },
      {
        label: "Date of Birth",
        value: formatDateOfBirth(profile.dateOfBirth),
        actions: [
          {
            label: "Edit date of birth",
            type: "icon",
            onClick: () => handleEditClick("dateOfBirth"),
          },
        ],
      },
      {
        label: "Email",
        value: profile.email,
        actions: [
          {
            label: "Edit email",
            type: "icon",
            onClick: () => handleEditClick("email"),
          },
        ],
      },
      {
        label: "Phone",
        value: profile.phone,
        actions: [
          {
            label: "Edit phone",
            type: "icon",
            onClick: () => handleEditClick("phone"),
          },
        ],
      },
      {
        label: "Password",
        value: profile.passwordMasked,
        actions: [
          {
            label: "Edit password",
            type: "icon",
            onClick: () => handleEditClick("password"),
          },
        ],
      },
    ],
    [handleEditClick, profile]
  );

  if (loading) {
    return (
      <div className="w-full h-full p-4 md:p-6 lg:p-8 flex items-center justify-center bg-[#000000] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full p-4 md:p-6 lg:p-8 flex items-center justify-center bg-[#000000] text-white">
        <Card className="max-w-md w-full bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.18)] text-white">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 md:py-10 text-white bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050510] min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="mb-8 mt-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3 mb-2">
            <User className="h-8 w-8 text-[#D60024]" />
            My Profile
          </h1>
          <p className="text-[rgba(255,255,255,0.65)] text-sm sm:text-base">Manage your account settings and preferences</p>
        </div>
        {/* Profile Header - Compact */}
        <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] via-[rgba(59,130,246,0.06)] to-[rgba(214,0,36,0.04)] rounded-xl shadow-[0_22px_60px_-25px_rgba(0,0,0,0.7)] hover:shadow-[0_30px_80px_-20px_rgba(100,180,255,0.3)] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex gap-6">
              {/* Left: Avatar Thumbnail */}
              <div className="flex-shrink-0">
                <div className="relative group">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" className="relative">
                        <Avatar className="h-24 w-24 border-3 border-[rgba(100,200,255,0.3)] bg-gradient-to-br from-[rgba(214,0,36,0.2)] to-[rgba(59,130,246,0.2)] shadow-lg transition-all hover:scale-105 hover:border-[rgba(100,200,255,0.5)]">
                          {profile.avatarUrl ? (
                            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                          ) : (
                            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-[rgba(214,0,36,0.3)] to-[rgba(59,130,246,0.3)] text-white">
                              {getInitials(profile.name, profile.email)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg bg-[#0a0a0a] border-2 border-[rgba(100,200,255,0.3)] text-white">
                      <DialogHeader>
                        <DialogTitle className="text-white">Choose Your Avatar</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        {avatarOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            className="group flex flex-col items-center gap-2 rounded-xl border-2 border-[rgba(100,200,255,0.2)] bg-[rgba(255,255,255,0.05)] p-4 transition-all hover:border-[#D60024] hover:bg-[rgba(214,0,36,0.1)] hover:scale-105"
                          >
                            <Avatar className="h-20 w-20 border-2 border-[rgba(100,200,255,0.3)] shadow-lg">
                              <AvatarImage src={option.url} alt={option.label} />
                              <AvatarFallback>{option.label.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-semibold text-white group-hover:text-[#D60024]">
                              {option.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Right: Profile Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className="bg-[#D60024]/20 text-[#D60024] border border-[#D60024]/30 px-2.5 py-0.5 text-xs font-semibold">
                    {roleLabelMap[role] || "Attendee"}
                  </Badge>
                  {profile.isVerified && (
                    <Badge className="bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 px-2.5 py-0.5 text-xs font-semibold">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">{profile.name}</h1>

                <div className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.65)] mb-4">
                  <CalendarIcon className="h-4 w-4 text-[#60a5fa]" />
                  <span>Member since {memberSince}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(100,200,255,0.15)]">
                    <Mail className="h-4 w-4 text-[#60a5fa] flex-shrink-0" />
                    <span className="text-sm text-white truncate">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(100,200,255,0.15)]">
                    <Phone className="h-4 w-4 text-[#60a5fa] flex-shrink-0" />
                    <span className="text-sm text-white">{profile.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Details */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl">
              <CardHeader className="border-b border-[rgba(100,200,255,0.15)]">
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="h-5 w-5 text-[#D60024]" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {detailRows.map((row) => (
                    <div key={row.label} className="p-4 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(100,200,255,0.15)] hover:border-[rgba(100,200,255,0.3)] transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(255,255,255,0.65)] mb-1">
                            {row.label}
                          </p>
                          <p className="text-base font-semibold text-white">{row.value}</p>
                        </div>
                        {row.actions
                          ?.filter((action) => action.type === "icon")
                          .map((action) => (
                            <Button
                              key={action.label}
                              variant="ghost"
                              size="sm"
                              onClick={action.onClick}
                              className="text-[#60a5fa] hover:text-white hover:bg-[rgba(59,130,246,0.2)]"
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(214,0,36,0.15)] to-[rgba(214,0,36,0.05)] rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Ticket className="h-5 w-5 text-[#D60024]" />
                  <TrendingUp className="h-4 w-4 text-[rgba(255,255,255,0.4)]" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">12</p>
                <p className="text-xs text-[rgba(255,255,255,0.65)] font-medium">Total Bookings</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(59,130,246,0.15)] to-[rgba(59,130,246,0.05)] rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Heart className="h-5 w-5 text-[#60a5fa]" />
                  <Star className="h-4 w-4 text-[rgba(255,255,255,0.4)]" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">8</p>
                <p className="text-xs text-[rgba(255,255,255,0.65)] font-medium">Favorite Events</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(34,197,94,0.15)] to-[rgba(34,197,94,0.05)] rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Star className="h-5 w-5 text-[#22c55e]" />
                  <TrendingUp className="h-4 w-4 text-[rgba(255,255,255,0.4)]" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">4.8</p>
                <p className="text-xs text-[rgba(255,255,255,0.65)] font-medium">Average Rating</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editField} onOpenChange={(open) => !open && !isSaving && setEditField(null)}>
        <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-2 border-[rgba(100,200,255,0.3)] text-white">
          <form onSubmit={handleEditSubmit} className="space-y-5 py-2">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-[#D60024]" />
                {editField === "name"
                  ? "Update Name"
                  : editField === "dateOfBirth"
                  ? "Update Date of Birth"
                  : editField === "email"
                  ? "Update Email"
                  : editField === "phone"
                  ? "Update Phone"
                  : "Update Password"}
              </DialogTitle>
            </DialogHeader>

            {editField === "password" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="profile-current-password" className="text-white">Current Password</Label>
                  <Input
                    id="profile-current-password"
                    type="password"
                    placeholder="Enter current password"
                    value={passwordValues.current}
                    onChange={(event) =>
                      setPasswordValues((prev) => ({ ...prev, current: event.target.value }))
                    }
                    required
                    autoComplete="current-password"
                    className="bg-[rgba(255,255,255,0.08)] border-[rgba(100,200,255,0.2)] text-white placeholder:text-[rgba(255,255,255,0.5)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-new-password" className="text-white">New Password</Label>
                  <Input
                    id="profile-new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={passwordValues.new}
                    onChange={(event) =>
                      setPasswordValues((prev) => ({ ...prev, new: event.target.value }))
                    }
                    required
                    autoComplete="new-password"
                    className="bg-[rgba(255,255,255,0.08)] border-[rgba(100,200,255,0.2)] text-white placeholder:text-[rgba(255,255,255,0.5)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-confirm-password" className="text-white">Confirm New Password</Label>
                  <Input
                    id="profile-confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordValues.confirm}
                    onChange={(event) =>
                      setPasswordValues((prev) => ({ ...prev, confirm: event.target.value }))
                    }
                    required
                    autoComplete="new-password"
                    className="bg-[rgba(255,255,255,0.08)] border-[rgba(100,200,255,0.2)] text-white placeholder:text-[rgba(255,255,255,0.5)]"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="profile-edit-input" className="text-white">
                  {editField === "name"
                    ? "Full Name"
                    : editField === "dateOfBirth"
                    ? "Date of Birth"
                    : editField === "email"
                    ? "Email"
                    : "Phone"}
                </Label>
                <Input
                  id="profile-edit-input"
                  type={editField === "name" ? "text" : editField === "dateOfBirth" ? "date" : editField === "email" ? "email" : "tel"}
                  placeholder={
                    editField === "name"
                      ? "Enter your full name"
                      : editField === "dateOfBirth"
                      ? "Select date of birth"
                      : editField === "email"
                      ? "Enter new email"
                      : "Enter new phone"
                  }
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  required
                  className="bg-[rgba(255,255,255,0.08)] border-[rgba(100,200,255,0.2)] text-white placeholder:text-[rgba(255,255,255,0.5)]"
                />
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-semibold hover:shadow-[0_10px_25px_-10px_rgba(214,0,36,0.4)]" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

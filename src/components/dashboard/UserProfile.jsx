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
    if (field === "email") {
      setEditValue(profile.email || "");
      setPasswordValues({ current: "", new: "", confirm: "" });
    } else if (field === "phone") {
      setEditValue(profile.phone || "");
      setPasswordValues({ current: "", new: "", confirm: "" });
    } else {
      setEditValue("");
      setPasswordValues({ current: "", new: "", confirm: "" });
    }
  }, [profile.email, profile.phone]);

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!editField) {
      return;
    }

    setIsSaving(true);

    let payload = {};
    let endpoint = "/api/user/profile";
    if (editField === "email") {
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
        email: payload.email ?? profile.email,
        phone: payload.phone ?? profile.phone,
      };
      setProfileData(optimisticData);

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

  const detailRows = useMemo(
    () => [
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
    <div className="w-full h-full p-4 md:p-6 lg:p-8 overflow-y-auto bg-[#000000] text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="overflow-hidden border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-white shadow-[0_22px_60px_-25px_rgba(0,0,0,0.7)]">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-col sm:flex-row sm:items-start sm:gap-6">
                <div className="flex flex-col items-center gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" className="relative">
                        <Avatar className="h-24 w-24 border-4 border-[rgba(255,255,255,0.18)] bg-[#000000] shadow-lg transition-transform hover:scale-[1.02]">
                          {profile.avatarUrl ? (
                            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                          ) : (
                            <AvatarFallback className="text-xl font-semibold bg-[rgba(255,255,255,0.08)] text-white">
                              {getInitials(profile.name, profile.email)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#D60024] px-3 py-0.5 text-xs font-semibold text-white shadow">Change</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Select your vibe</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        {avatarOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            className="group flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-background/80 p-3 transition hover:border-primary hover:bg-primary/10"
                          >
                            <Avatar className="h-16 w-16 border-2 border-border/60 shadow">
                              <AvatarImage src={option.url} alt={option.label} />
                              <AvatarFallback>{option.label.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                              {option.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="mt-4 flex-1 space-y-3 sm:mt-0 text-center sm:text-left">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-[rgba(255,255,255,0.65)] justify-center sm:justify-start">
                    <MapPin className="h-4 w-4 text-[#D60024]" />
                    <span>Member since {memberSince}</span>
                    <Badge variant="secondary" className="uppercase tracking-wide bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.18)] text-white">
                      {roleLabelMap[role] || "Attendee"}
                    </Badge>
                    {profile.isVerified && (
                      <Badge variant="outline" className="gap-1 bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.18)] text-white">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl font-semibold tracking-tight">{profile.name}</h1>

                  <div className="flex flex-wrap gap-4 pt-2 text-sm text-[rgba(255,255,255,0.65)] justify-center sm:justify-start">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {profile.email}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {profile.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-white shadow-[0_22px_60px_-25px_rgba(0,0,0,0.7)]">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 text-sm md:grid-cols-2">
              {detailRows.map((row) => (
                <div key={row.label} className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(255,255,255,0.65)]">
                    {row.label}:
                  </p>
                  <div className="flex items-center gap-2 text-base font-semibold text-white">
                    <span>{row.value}</span>
                    {row.actions
                      ?.filter((action) => action.type === "icon")
                      .map((action) => (
                        <button
                          key={action.label}
                          type="button"
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.65)] transition hover:bg-[#D60024] hover:text-white"
                          aria-label={action.label}
                          onClick={action.onClick}
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editField} onOpenChange={(open) => !open && !isSaving && setEditField(null)}>
        <DialogContent className="sm:max-w-md bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.18)] text-white">
          <form onSubmit={handleEditSubmit} className="space-y-5 py-2">
            <DialogHeader>
              <DialogTitle>
                {editField === "email"
                  ? "Update Email"
                  : editField === "phone"
                  ? "Update Phone"
                  : "Update Password"}
              </DialogTitle>
            </DialogHeader>

            {editField === "password" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="profile-current-password">Current Password</Label>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-new-password">New Password</Label>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-confirm-password">Confirm New Password</Label>
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
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="profile-edit-input">{editField === "email" ? "Email" : "Phone"}</Label>
                <Input
                  id="profile-edit-input"
                  type={editField === "email" ? "email" : "tel"}
                  placeholder={editField === "email" ? "Enter new email" : "Enter new phone"}
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

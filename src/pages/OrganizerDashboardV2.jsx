import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { clearSessionData, resetSessionCache } from "@/utils/auth";
import { buildUrl } from "@/config/api";
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
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Menu,
  Home,
  Users,
  BarChart2,
  Download,
  ChevronDown,
  LogOut,
} from "lucide-react";
import FinancialReporting from "./FinancialReporting";
import TicketsAndReservations from "./TicketsAndReservations";
import OrganizerDash from "./OrganizerDash";
import AudienceAnalytics from "./AudienceAnalytics";
import MyEvents from "./MyEvents";

// Profile Content Component
const OrganizerProfileContent = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentEditData, setPaymentEditData] = useState(null);
  const [editData, setEditData] = useState({
    name: user.name || "Organizer",
    email: user.email || "",
    phone: "+91 9876543210",
    location: "Mumbai, India",
    joinDate: "January 2024",
    bio: "Professional event organizer with 5+ years of experience",
    paymentDetails: {
      bankAccountHolder: "John Doe",
      bankName: "HDFC Bank",
      accountNumber: "****1234",
      ifscCode: "HDFC0001234",
      upiId: "organizer@upi",
      totalTicketSales: "₹5,24,000",
      pendingPayment: "₹45,000",
      lastPaymentDate: "28 Nov 2024",
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditPayment = () => {
    setPaymentEditData({ ...editData.paymentDetails });
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = () => {
    setEditData((prev) => ({
      ...prev,
      paymentDetails: paymentEditData,
    }));
    setIsPaymentModalOpen(false);
    setPaymentEditData(null);
  };

  const handleCancelPayment = () => {
    setIsPaymentModalOpen(false);
    setPaymentEditData(null);
  };

  const handlePaymentInputChange = (field, value) => {
    setPaymentEditData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">Organizer Profile</p>
          <h2 className="text-3xl font-extrabold">Profile & Payouts</h2>
          <p className="text-sm text-white/60">Keep your contact and payment details current.</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-blue-500 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white/5 rounded-2xl border border-white/10 shadow-lg shadow-black/30 overflow-hidden backdrop-blur">
        {/* Profile Header Section */}
        <div className="bg-gradient-to-r from-red-600 via-rose-500 to-blue-600 px-8 py-10 border-b border-white/10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-4xl shadow-lg border border-white/20">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="text-white">
              <h2 className="text-3xl font-bold">{user.name || "Organizer"}</h2>
              <p className="text-white/80 mt-1">Event Organizer</p>
              <p className="text-xs text-white/60 mt-1">{user.email || "organizer@example.com"}</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-8 space-y-6 bg-[#0b1220]/80">
          {!isEditing ? (
            // View Mode
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0 border border-red-500/30">
                      <Mail className="w-5 h-5 text-red-200" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">Email Address</p>
                      <p className="text-base font-semibold text-white mt-1">
                        {user.email || "organizer@example.com"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0 border border-red-500/30">
                      <Phone className="w-5 h-5 text-red-200" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">Phone Number</p>
                      <p className="text-base font-semibold text-white mt-1">{editData.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location & Date */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                      <MapPin className="w-5 h-5 text-blue-200" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">Location</p>
                      <p className="text-base font-semibold text-white mt-1">{editData.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                      <Calendar className="w-5 h-5 text-emerald-200" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">Member Since</p>
                      <p className="text-base font-semibold text-white mt-1">{editData.joinDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Bio</h3>
                <p className="text-white/80 leading-relaxed bg-white/5 border border-white/10 p-4 rounded-xl">
                  {editData.bio}
                </p>
              </div>

              {/* Statistics */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-600/60 to-indigo-600/60 p-4 rounded-xl border border-white/15 shadow-lg shadow-black/30">
                    <p className="text-xs uppercase tracking-wide text-white/70">Total Events</p>
                    <p className="text-3xl font-bold text-white mt-2">12</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500/60 to-teal-500/60 p-4 rounded-xl border border-white/15 shadow-lg shadow-black/30">
                    <p className="text-xs uppercase tracking-wide text-white/70">Total Attendees</p>
                    <p className="text-3xl font-bold text-white mt-2">2.5K</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/60 to-pink-500/60 p-4 rounded-xl border border-white/15 shadow-lg shadow-black/30">
                    <p className="text-xs uppercase tracking-wide text-white/70">Total Revenue</p>
                    <p className="text-3xl font-bold text-white mt-2">₹5.2L</p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Payment Details</h3>
                </div>

                {/* Payment Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-emerald-200" />
                      <p className="text-sm text-white/70">Total Ticket Sales</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{editData.paymentDetails.totalTicketSales}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-amber-200" />
                      <p className="text-sm text-white/70">Pending Payment</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{editData.paymentDetails.pendingPayment}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-200" />
                      <p className="text-sm text-white/70">Last Payment</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{editData.paymentDetails.lastPaymentDate}</p>
                  </div>
                </div>

                {/* Payment Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2">
                    <h4 className="text-sm font-semibold text-white">Bank Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-white/80">
                      <span className="font-medium text-white/70">Account Holder</span>
                      <span>{editData.paymentDetails.bankAccountHolder}</span>
                      <span className="font-medium text-white/70">Bank Name</span>
                      <span>{editData.paymentDetails.bankName}</span>
                      <span className="font-medium text-white/70">Account Number</span>
                      <span>{editData.paymentDetails.accountNumber}</span>
                      <span className="font-medium text-white/70">IFSC Code</span>
                      <span>{editData.paymentDetails.ifscCode}</span>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2">
                    <h4 className="text-sm font-semibold text-white">UPI & Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-white/80">
                      <span className="font-medium text-white/70">UPI ID</span>
                      <span>{editData.paymentDetails.upiId}</span>
                      <span className="font-medium text-white/70">Total Ticket Sales</span>
                      <span>{editData.paymentDetails.totalTicketSales}</span>
                      <span className="font-medium text-white/70">Pending Payment</span>
                      <span>{editData.paymentDetails.pendingPayment}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">Full Name</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-red-500/60 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">Email Address</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-red-500/60 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">Phone Number</label>
                    <input
                      type="text"
                      value={editData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-red-500/60 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">Location</label>
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-red-500/60 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">Member Since</label>
                  <input
                    type="text"
                    value={editData.joinDate}
                    onChange={(e) => handleInputChange("joinDate", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-red-500/60 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">Bio</label>
                  <textarea
                    value={editData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-red-500/60 focus:outline-none min-h-[100px]"
                  />
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Payment Details</h3>
                  <button
                    onClick={handleEditPayment}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Bank Details
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">Account Holder</label>
                    <input
                      type="text"
                      value={editData.paymentDetails.bankAccountHolder}
                      onChange={(e) => handlePaymentInputChange("bankAccountHolder", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-red-500/60 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">Bank Name</label>
                    <input
                      type="text"
                      value={editData.paymentDetails.bankName}
                      onChange={(e) => handlePaymentInputChange("bankName", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-red-500/60 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">Account Number</label>
                    <input
                      type="text"
                      value={editData.paymentDetails.accountNumber}
                      onChange={(e) => handlePaymentInputChange("accountNumber", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-red-500/60 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">IFSC Code</label>
                    <input
                      type="text"
                      value={editData.paymentDetails.ifscCode}
                      onChange={(e) => handlePaymentInputChange("ifscCode", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-red-500/60 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">UPI ID</label>
                    <input
                      type="text"
                      value={editData.paymentDetails.upiId}
                      onChange={(e) => handlePaymentInputChange("upiId", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-red-500/60 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-blue-500 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
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

      {isPaymentModalOpen && paymentEditData && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-[#0d1324] rounded-2xl shadow-2xl border border-white/10 max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-300" />
                Edit Bank Details
              </h2>
              <button
                onClick={handleCancelPayment}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={paymentEditData.bankAccountHolder || ""}
                  onChange={(e) => handlePaymentInputChange("bankAccountHolder", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-red-500/60 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={paymentEditData.bankName || ""}
                  onChange={(e) => handlePaymentInputChange("bankName", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-red-500/60 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Account Number</label>
                <input
                  type="text"
                  value={paymentEditData.accountNumber || ""}
                  onChange={(e) => handlePaymentInputChange("accountNumber", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-red-500/60 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">IFSC Code</label>
                <input
                  type="text"
                  value={paymentEditData.ifscCode || ""}
                  onChange={(e) => handlePaymentInputChange("ifscCode", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-red-500/60 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">UPI ID</label>
                <input
                  type="text"
                  value={paymentEditData.upiId || ""}
                  onChange={(e) => handlePaymentInputChange("upiId", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-red-500/60 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-white/10 bg-white/5">
              <button
                onClick={handleSavePayment}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-blue-500 text-white shadow-md shadow-red-500/20 hover:shadow-red-500/30 transition"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancelPayment}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
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
    { id: "ticketing", name: "Tickets and Reservation", icon: <BarChart2 className="w-6 h-6 mr-3" /> },
    { id: "financial", name: "Financial Reporting", icon: <Download className="w-6 h-6 mr-3" /> },
  ];

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
                onClick={() => setActiveTab(item.id)}
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
            {activeTab === "ticketing" && <TicketsAndReservations />}
            {activeTab === "financial" && <FinancialReporting />}
            {activeTab === "profile" && <OrganizerProfileContent user={user} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default OrganizerDashboardV2;

import { useState, useEffect } from "react";
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Organizer Profile</h2>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-12">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-red-600 font-bold text-4xl shadow-lg">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="text-white">
              <h2 className="text-3xl font-bold">{user.name || "Organizer"}</h2>
              <p className="text-red-100 mt-1">Event Organizer</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-8">
          {!isEditing ? (
            // View Mode
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="text-base font-medium text-gray-900 mt-1">
                        {user.email || "organizer@example.com"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-base font-medium text-gray-900 mt-1">{editData.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location & Date */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-base font-medium text-gray-900 mt-1">{editData.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="text-base font-medium text-gray-900 mt-1">{editData.joinDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bio</h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {editData.bio}
                </p>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Events</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">12</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Attendees</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">2.5K</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">₹5.2L</p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
                
                {/* Payment Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-gray-600">Total Ticket Sales</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{editData.paymentDetails.totalTicketSales}</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm text-gray-600">Pending Payment</p>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{editData.paymentDetails.pendingPayment}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <p className="text-sm text-gray-600">Last Payment</p>
                    </div>
                    <p className="text-sm font-bold text-blue-600">{editData.paymentDetails.lastPaymentDate}</p>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-red-600" />
                      Bank Account Details
                    </h4>
                    <button
                      onClick={handleEditPayment}
                      className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">Account Holder Name</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{editData.paymentDetails.bankAccountHolder}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">Bank Name</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{editData.paymentDetails.bankName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">Account Number</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{editData.paymentDetails.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">IFSC Code</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{editData.paymentDetails.ifscCode}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500 uppercase font-medium">UPI ID</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{editData.paymentDetails.upiId}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={editData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={editData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Payment Details Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-red-600" />
                  Payment Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                    <input
                      type="text"
                      value={editData.paymentDetails?.bankAccountHolder || ""}
                      onChange={(e) => setEditData((prev) => ({
                        ...prev,
                        paymentDetails: { ...prev.paymentDetails, bankAccountHolder: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                    <input
                      type="text"
                      value={editData.paymentDetails?.bankName || ""}
                      onChange={(e) => setEditData((prev) => ({
                        ...prev,
                        paymentDetails: { ...prev.paymentDetails, bankName: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                    <input
                      type="text"
                      value={editData.paymentDetails?.accountNumber || ""}
                      onChange={(e) => setEditData((prev) => ({
                        ...prev,
                        paymentDetails: { ...prev.paymentDetails, accountNumber: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                    <input
                      type="text"
                      value={editData.paymentDetails?.ifscCode || ""}
                      onChange={(e) => setEditData((prev) => ({
                        ...prev,
                        paymentDetails: { ...prev.paymentDetails, ifscCode: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                    <input
                      type="text"
                      value={editData.paymentDetails?.upiId || ""}
                      onChange={(e) => setEditData((prev) => ({
                        ...prev,
                        paymentDetails: { ...prev.paymentDetails, upiId: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Edit Mode Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Details Modal */}
      {isPaymentModalOpen && paymentEditData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-600" />
                Edit Bank Details
              </h2>
              <button
                onClick={handleCancelPayment}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={paymentEditData.bankAccountHolder || ""}
                  onChange={(e) => handlePaymentInputChange("bankAccountHolder", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={paymentEditData.bankName || ""}
                  onChange={(e) => handlePaymentInputChange("bankName", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  value={paymentEditData.accountNumber || ""}
                  onChange={(e) => handlePaymentInputChange("accountNumber", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                <input
                  type="text"
                  value={paymentEditData.ifscCode || ""}
                  onChange={(e) => handlePaymentInputChange("ifscCode", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                <input
                  type="text"
                  value={paymentEditData.upiId || ""}
                  onChange={(e) => handlePaymentInputChange("upiId", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleSavePayment}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancelPayment}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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
  };


  // Navigation items with their corresponding tab values
  const navItems = [
    { id: "dashboard", name: "Dashboard", icon: <Home className="w-6 h-6 mr-3" /> },
    { id: "myevents", name: "My Events", icon: <Calendar className="w-6 h-6 mr-3" /> },
    { id: "analytics", name: "Audience Analytics", icon: <Users className="w-6 h-6 mr-3" /> },
    { id: "ticketing", name: "Tickets and Reservation", icon: <BarChart2 className="w-6 h-6 mr-3" /> },
    { id: "financial", name: "Financial Reporting", icon: <Download className="w-6 h-6 mr-3" /> },
    { id: "profile", name: "My Profile", icon: <User className="w-6 h-6 mr-3" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-24"} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h1
            className={`text-2xl font-extrabold tracking-tight ${sidebarOpen ? "block" : "hidden"}`}
          >
            <span className="text-red-600">Map</span>MyParty
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <ChevronLeft className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg ${
                  activeTab === item.id
                    ? "text-white bg-gray-900"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                {sidebarOpen && item.name}
              </button>
            ))}
          </div>
        </nav>

        <div className="mt-auto p-4 border-t border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className="flex items-center gap-3 w-full hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold flex-shrink-0">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1 text-left">
                <div className="text-sm font-medium truncate">{user.name || "Organizer"}</div>
                <div className="text-xs text-gray-500 truncate">{user.email || "organizer@example.com"}</div>
              </div>
            )}
            {sidebarOpen && (
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {/* Tab Content */}
          <div className="p-6 space-y-6">
            {activeTab === "dashboard" && (
              <OrganizerDash user={user} handleLogout={handleLogout} setActiveTab={setActiveTab} activeTab={activeTab} />
            )}

            {activeTab === "myevents" && (
              <MyEvents />
            )}

            {activeTab === "analytics" && (
              <AudienceAnalytics />
            )}
            
            {activeTab === 'ticketing' && (
              <TicketsAndReservations />
            )}
            
            {activeTab === 'financial' && (
              <FinancialReporting />
            )}

            {activeTab === 'profile' && (
              <OrganizerProfileContent user={user} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrganizerDashboardV2;

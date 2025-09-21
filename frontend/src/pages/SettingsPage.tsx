import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  HelpCircle,
  LogOut,
  Camera,
  Mail,
  Phone,
  MapPin,
  Save,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeSection, setActiveSection] = useState("profile");

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "John",
    lastName: user?.lastName || "Doe",
    email: user?.email || "john.doe@example.com",
    phone: "+260 97 123 4567",
    location: "Lusaka, Zambia",
    bio: "Tech enthusiast and local business supporter",
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    dealUpdates: true,
    newMessages: true,
    orderStatus: true,
    promotions: false,
    systemUpdates: true,
    emailNotifications: true,
    pushNotifications: true,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showLocation: true,
    showPhone: false,
    allowMessages: true,
    dataSharing: false,
  });

  // Theme preferences
  const [theme, setTheme] = useState({
    mode: "dark",
    accentColor: "amber",
    fontSize: "medium",
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSaveProfile = () => {
    console.log("Saving profile:", profileData);
    // In a real app, this would save to backend
  };

  const handleSaveNotifications = () => {
    console.log("Saving notifications:", notifications);
    // In a real app, this would save to backend
  };

  const handleSavePrivacy = () => {
    console.log("Saving privacy:", privacy);
    // In a real app, this would save to backend
  };

  const handleSaveTheme = () => {
    console.log("Saving theme:", theme);
    // In a real app, this would save to backend
  };

  const settingsSections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "language", label: "Language", icon: Globe },
    { id: "help", label: "Help & Support", icon: HelpCircle },
  ];

  const renderProfileSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Profile Picture */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={
              user?.avatar ||
              "https://ui-avatars.com/api/?name=John+Doe&background=random"
            }
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />
          <button className="absolute -bottom-1 -right-1 p-1.5 bg-amber-golden text-white rounded-full hover:bg-amber-600 transition-colors duration-200">
            <Camera className="h-3 w-3" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-100">
            Profile Picture
          </h3>
          <p className="text-sm text-slate-400">
            Click to change your profile picture
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            First Name
          </label>
          <input
            type="text"
            value={profileData.firstName}
            onChange={(e) =>
              setProfileData({ ...profileData, firstName: e.target.value })
            }
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={profileData.lastName}
            onChange={(e) =>
              setProfileData({ ...profileData, lastName: e.target.value })
            }
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              value={profileData.email}
              onChange={(e) =>
                setProfileData({ ...profileData, email: e.target.value })
              }
              className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Phone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) =>
                setProfileData({ ...profileData, phone: e.target.value })
              }
              className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={profileData.location}
              onChange={(e) =>
                setProfileData({ ...profileData, location: e.target.value })
              }
              className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Bio
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) =>
              setProfileData({ ...profileData, bio: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>

      <button
        onClick={handleSaveProfile}
        className="flex items-center space-x-2 px-6 py-3 bg-amber-golden hover:bg-amber-600 text-white rounded-lg font-medium transition-colors duration-200"
      >
        <Save className="h-4 w-4" />
        <span>Save Changes</span>
      </button>
    </motion.div>
  );

  const renderNotificationsSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-100">
          Notification Preferences
        </h3>

        {Object.entries(notifications).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700"
          >
            <div>
              <h4 className="font-medium text-slate-100 capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </h4>
              <p className="text-sm text-slate-400">
                {key === "dealUpdates" &&
                  "Get notified about deal updates and negotiations"}
                {key === "newMessages" &&
                  "Receive notifications for new messages"}
                {key === "orderStatus" && "Get updates on order status changes"}
                {key === "promotions" &&
                  "Receive promotional offers and discounts"}
                {key === "systemUpdates" &&
                  "Important system updates and announcements"}
                {key === "emailNotifications" &&
                  "Receive notifications via email"}
                {key === "pushNotifications" &&
                  "Receive push notifications on your device"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    [key]: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-golden/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-golden"></div>
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={handleSaveNotifications}
        className="flex items-center space-x-2 px-6 py-3 bg-amber-golden hover:bg-amber-600 text-white rounded-lg font-medium transition-colors duration-200"
      >
        <Save className="h-4 w-4" />
        <span>Save Preferences</span>
      </button>
    </motion.div>
  );

  const renderPrivacySection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-100">
          Privacy Settings
        </h3>

        <div className="space-y-4">
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <h4 className="font-medium text-slate-100 mb-2">
              Profile Visibility
            </h4>
            <p className="text-sm text-slate-400 mb-3">
              Control who can see your profile information
            </p>
            <select
              value={privacy.profileVisibility}
              onChange={(e) =>
                setPrivacy({ ...privacy, profileVisibility: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent"
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          {Object.entries(privacy)
            .filter(([key]) => key !== "profileVisibility")
            .map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700"
              >
                <div>
                  <h4 className="font-medium text-slate-100 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </h4>
                  <p className="text-sm text-slate-400">
                    {key === "showLocation" &&
                      "Display your location on your profile"}
                    {key === "showPhone" &&
                      "Show your phone number to other users"}
                    {key === "allowMessages" &&
                      "Allow other users to send you messages"}
                    {key === "dataSharing" &&
                      "Share data with third-party services"}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value as boolean}
                    onChange={(e) =>
                      setPrivacy({ ...privacy, [key]: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-golden/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-golden"></div>
                </label>
              </div>
            ))}
        </div>
      </div>

      <button
        onClick={handleSavePrivacy}
        className="flex items-center space-x-2 px-6 py-3 bg-amber-golden hover:bg-amber-600 text-white rounded-lg font-medium transition-colors duration-200"
      >
        <Save className="h-4 w-4" />
        <span>Save Privacy Settings</span>
      </button>
    </motion.div>
  );

  const renderAppearanceSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-100">
          Appearance Settings
        </h3>

        <div className="space-y-4">
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <h4 className="font-medium text-slate-100 mb-2">Theme Mode</h4>
            <p className="text-sm text-slate-400 mb-3">
              Choose your preferred theme
            </p>
            <div className="flex space-x-2">
              {["light", "dark", "auto"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTheme({ ...theme, mode })}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    theme.mode === mode
                      ? "bg-amber-golden text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <h4 className="font-medium text-slate-100 mb-2">Accent Color</h4>
            <p className="text-sm text-slate-400 mb-3">
              Choose your accent color
            </p>
            <div className="flex space-x-2">
              {["amber", "blue", "green", "purple", "red"].map((color) => (
                <button
                  key={color}
                  onClick={() => setTheme({ ...theme, accentColor: color })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    theme.accentColor === color
                      ? "border-white"
                      : "border-slate-600"
                  }`}
                  style={{ backgroundColor: getColorValue(color) }}
                />
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <h4 className="font-medium text-slate-100 mb-2">Font Size</h4>
            <p className="text-sm text-slate-400 mb-3">
              Adjust text size for better readability
            </p>
            <select
              value={theme.fontSize}
              onChange={(e) => setTheme({ ...theme, fontSize: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveTheme}
        className="flex items-center space-x-2 px-6 py-3 bg-amber-golden hover:bg-amber-600 text-white rounded-lg font-medium transition-colors duration-200"
      >
        <Save className="h-4 w-4" />
        <span>Save Appearance</span>
      </button>
    </motion.div>
  );

  const renderLanguageSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-100">
          Language & Region
        </h3>

        <div className="space-y-4">
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <h4 className="font-medium text-slate-100 mb-2">Language</h4>
            <p className="text-sm text-slate-400 mb-3">
              Choose your preferred language
            </p>
            <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent">
              <option value="en">English</option>
              <option value="bem">Bemba</option>
              <option value="nyj">Nyanja</option>
              <option value="toi">Tonga</option>
            </select>
          </div>

          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <h4 className="font-medium text-slate-100 mb-2">Region</h4>
            <p className="text-sm text-slate-400 mb-3">
              Select your region for localized content
            </p>
            <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent">
              <option value="lusaka">Lusaka</option>
              <option value="copperbelt">Copperbelt</option>
              <option value="southern">Southern Province</option>
              <option value="eastern">Eastern Province</option>
              <option value="western">Western Province</option>
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderHelpSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-100">Help & Support</h3>

        <div className="space-y-3">
          {[
            { title: "FAQ", description: "Frequently asked questions" },
            {
              title: "Contact Support",
              description: "Get help from our support team",
            },
            { title: "Report a Bug", description: "Report issues or bugs" },
            { title: "Feature Request", description: "Suggest new features" },
            {
              title: "Terms of Service",
              description: "Read our terms and conditions",
            },
            {
              title: "Privacy Policy",
              description: "Learn about our privacy practices",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700/50 transition-colors duration-200 cursor-pointer"
            >
              <h4 className="font-medium text-slate-100">{item.title}</h4>
              <p className="text-sm text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const getColorValue = (color: string) => {
    const colors: { [key: string]: string } = {
      amber: "#f97316",
      blue: "#3b82f6",
      green: "#10b981",
      purple: "#8b5cf6",
      red: "#ef4444",
    };
    return colors[color] || colors.amber;
  };

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return renderProfileSection();
      case "notifications":
        return renderNotificationsSection();
      case "privacy":
        return renderPrivacySection();
      case "appearance":
        return renderAppearanceSection();
      case "language":
        return renderLanguageSection();
      case "help":
        return renderHelpSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-dark">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-1 sm:space-x-2 text-slate-400 hover:text-slate-300 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-100">
              Settings
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 sm:space-x-2 text-red-400 hover:text-red-300 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <nav className="space-y-2">
                  {settingsSections.map((section) => {
                    const IconComponent = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                          activeSection === section.id
                            ? "bg-amber-golden text-white"
                            : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {section.label}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 sm:p-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;

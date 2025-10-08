import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ShopNav from "../../components/ShopNav";
import { Settings, MapPin, Phone, Mail, Save, LogOut, Edit2, X } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

function ShopSettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const [shopData, setShopData] = useState({
    name: "Tech Hub Electronics",
    description:
      "Your one-stop shop for all electronics, gadgets, and tech accessories.",
    location: "Soweto Market",
    phone: "+260 97 123 4567",
    email: "malozdev@gmail.com",
    hours: {
      monday: "8:00 AM - 8:00 PM",
      tuesday: "8:00 AM - 8:00 PM",
      wednesday: "8:00 AM - 8:00 PM",
      thursday: "8:00 AM - 8:00 PM",
      friday: "8:00 AM - 9:00 PM",
      saturday: "9:00 AM - 9:00 PM",
      sunday: "10:00 AM - 6:00 PM",
    },
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <ShopNav />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-100 flex items-center">
            <Settings className="h-5 w-5 mr-2" /> Shop Settings
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg text-sm"
            >
              Back
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 space-y-6">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Shop Name</label>
            <input
              type="text"
              value={shopData.name}
              onChange={(e) => setShopData((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            {!isEditingDescription ? (
              <div className="bg-slate-700 border border-slate-600 rounded-lg p-3 text-slate-200">
                <div className="flex items-start justify-between">
                  <p className="text-sm leading-relaxed pr-3">{shopData.description}</p>
                  <button
                    onClick={() => setIsEditingDescription(true)}
                    className="p-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded-lg transition-colors duration-200"
                    title="Edit description"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <textarea
                  rows={3}
                  value={shopData.description}
                  onChange={(e) => setShopData((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="mt-2 flex items-center space-x-2">
                  <button
                    onClick={() => setIsEditingDescription(false)}
                    className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingDescription(false)}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm flex items-center space-x-1"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={shopData.location}
                  onChange={(e) => setShopData((p) => ({ ...p, location: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={shopData.phone}
                  onChange={(e) => setShopData((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={shopData.email}
                onChange={(e) => setShopData((p) => ({ ...p, email: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-3">Working Hours</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={shopData.hours.monday}
                onChange={(e) =>
                  setShopData((p) => ({
                    ...p,
                    hours: {
                      ...p.hours,
                      monday: e.target.value,
                      tuesday: e.target.value,
                      wednesday: e.target.value,
                      thursday: e.target.value,
                    },
                  }))
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Mon-Thu"
              />
              <input
                type="text"
                value={shopData.hours.friday}
                onChange={(e) => setShopData((p) => ({ ...p, hours: { ...p.hours, friday: e.target.value } }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Friday"
              />
              <input
                type="text"
                value={shopData.hours.saturday}
                onChange={(e) => setShopData((p) => ({ ...p, hours: { ...p.hours, saturday: e.target.value } }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Saturday"
              />
              <input
                type="text"
                value={shopData.hours.sunday}
                onChange={(e) => setShopData((p) => ({ ...p, hours: { ...p.hours, sunday: e.target.value } }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Sunday"
              />
            </div>
          </div>

          <button
            onClick={() => console.log("Shop data saved:", shopData)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShopSettingsPage;


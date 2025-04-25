import React, { useEffect, useState } from "react";
import {
  LockIcon,
  BellIcon,
  Globe2,
  EyeIcon,
  ActivityIcon,
  MailIcon,
  Save,
  ShieldCheck,
  Languages,
  Info,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SettingsScreen = ({ darkMode }) => {
  const [settings, setSettings] = useState({
    enable2FA: false,
    notificationEmail: true,
    notificationSMS: false,
    language: "en",
    marketingEmails: true,
    shareWithDVLA: true,
    highContrast: false,
    fontSize: "medium",
    showAIExplanation: true,
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("userSettings")) || {};
    setSettings((prev) => ({ ...prev, ...saved }));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    switch (settings.fontSize) {
      case "small":
        root.style.fontSize = "14px";
        break;
      case "medium":
        root.style.fontSize = "16px";
        break;
      case "large":
        root.style.fontSize = "18px";
        break;
      default:
        root.style.fontSize = "16px";
    }
  }, [settings.fontSize]);

  useEffect(() => {
    const body = document.body;
    if (settings.highContrast) {
      body.classList.add("high-contrast");
    } else {
      body.classList.remove("high-contrast");
    }
  }, [settings.highContrast]);

  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem("userSettings", JSON.stringify(updated));
      return updated;
    });
  };

  const saveSettings = () => {
    localStorage.setItem("userSettings", JSON.stringify(settings));
    toast.success("Settings saved successfully ✅");
  };

  return (
    <div
      className={`min-h-screen p-8 transition duration-300 ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 text-slate-900"
      }`}
    >
      <div className="max-w-4xl mx-auto rounded-2xl shadow-xl border p-8 border-gray-300 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Settings & Preferences</h2>
        </div>

        {/* Theme & Accessibility */}
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Accessibility</h3>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3">
              <EyeIcon size={18} /> High Contrast Mode
              
              <input
  type="checkbox"
  checked={settings.highContrast}
  onChange={() => updateSetting("highContrast", !settings.highContrast)}
/>
            </label>
            <label>
              Font Size
              <select
                value={settings.fontSize}
                onChange={(e) => updateSetting("fontSize", e.target.value)}
                className="ml-3 p-1 rounded border dark:bg-gray-700"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </label>
          </div>
        </section>

        

        {/* Communication & Notifications */}
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Notifications</h3>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3">
              <BellIcon size={18} /> In-App Notifications via Email
              <input type="checkbox" checked={settings.notificationEmail} onChange={() => updateSetting("notificationEmail", !settings.notificationEmail)} />
            </label>
            <label className="flex items-center gap-3">
              <BellIcon size={18} /> In-App Notifications via SMS
              <input type="checkbox" checked={settings.notificationSMS} onChange={() => updateSetting("notificationSMS", !settings.notificationSMS)} />
            </label>
            <label className="flex items-center gap-3">
              <MailIcon size={18} /> Allow Marketing Emails
              <input type="checkbox" checked={settings.marketingEmails} onChange={() => updateSetting("marketingEmails", !settings.marketingEmails)} />
            </label>
          </div>
        </section>

        {/* Interoperability */}
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Data Sharing & Integrations</h3>
          <label className="flex items-center gap-3">
            <ActivityIcon size={18} /> Share my records with DVLA / Law Authorities
            <input type="checkbox" checked={settings.shareWithDVLA} onChange={() => updateSetting("shareWithDVLA", settings.shareWithDVLA)} />
          </label>
        </section>

        

        <div className="text-right mt-6">
          <button
            onClick={saveSettings}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Save className="w-5 h-5" /> Save Settings
          </button>
        </div>
      </div>
      <ToastContainer position="bottom-center" autoClose={2000} />
    </div>
  );
};

export default SettingsScreen;

"use client";

import { Save, Key, Clock, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Settings saved successfully!");
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Platform Settings</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* API Configurations */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Key className="text-slate-500" size={20} />
            <h2 className="text-xl font-semibold text-slate-900">API Configurations</h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* WebBeds */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">WebBeds API</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">API Key</label>
                  <input type="password" defaultValue="************************" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Endpoint URL</label>
                  <input type="text" defaultValue="https://api.webbeds.com/v1" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Booking.com */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">Booking.com API</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">API Key</label>
                  <input type="password" defaultValue="************************" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Affiliate ID</label>
                  <input type="text" defaultValue="WG-AFF-2026" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* TBO */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">TBO API</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Client ID</label>
                  <input type="text" defaultValue="tbo_client_99212" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Client Secret</label>
                  <input type="password" defaultValue="************************" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:outline-none" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Sync Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Clock className="text-slate-500" size={20} />
            <h2 className="text-xl font-semibold text-slate-900">Synchronization Settings</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 flex gap-3 text-sm">
              <AlertCircle className="flex-shrink-0" size={20} />
              <p>Warning: Changing the synchronization frequency may impact your API limits and incur additional costs from providers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-slate-900 mb-1">Live Pricing Cache (TTL)</label>
                <p className="text-sm text-slate-500 mb-2">How long to cache live prices before fetching again.</p>
                <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:outline-none">
                  <option>15 Minutes</option>
                  <option>30 Minutes</option>
                  <option>1 Hour</option>
                  <option>Do not cache (Real-time)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-900 mb-1">Metadata Sync Cron</label>
                <p className="text-sm text-slate-500 mb-2">Frequency for updating hotel descriptions and images.</p>
                <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:outline-none">
                  <option>Daily at Midnight (00:00 UTC)</option>
                  <option>Weekly on Sunday</option>
                  <option>Monthly</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2">
            <Save size={20} />
            Save All Settings
          </button>
        </div>

      </form>
    </div>
  );
}

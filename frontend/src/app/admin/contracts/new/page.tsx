"use client";

import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewContractPage() {
  const router = useRouter();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate saving the contract
    alert("Contract saved successfully!");
    router.push("/admin/contracts");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/contracts" className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 hover:text-slate-900">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Create Local Contract</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSave} className="p-8 space-y-8">
          
          <div className="space-y-4 border-b border-slate-100 pb-8">
            <h2 className="text-xl font-semibold text-slate-900">General Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Hotel Name / ID</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Atlantis The Royal" 
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Contract Title (Internal)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Summer Exclusive 2026" 
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Public Description</label>
              <textarea 
                rows={3}
                placeholder="Details about the exclusive package..." 
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4 border-b border-slate-100 pb-8">
            <h2 className="text-xl font-semibold text-slate-900">Pricing & Validity</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Price Per Night (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="850" 
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Valid From</label>
                <input 
                  type="date" 
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Valid To</label>
                <input 
                  type="date" 
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Status</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 border-slate-300" defaultChecked />
              <span className="text-slate-700 font-medium">Activate immediately</span>
            </label>
          </div>

          <div className="pt-6 flex justify-end gap-4">
            <Link href="/admin/contracts" className="px-6 py-2 rounded-lg border border-slate-300 font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Cancel
            </Link>
            <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2">
              <Save size={18} />
              Save Contract
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

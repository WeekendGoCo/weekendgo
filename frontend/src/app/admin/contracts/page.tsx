import { Plus, Search, MoreVertical } from "lucide-react";
import Link from "next/link";

export default function ContractsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Local Contracts</h1>
        <Link href="/admin/contracts/new" className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Plus size={20} />
          New Contract
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search contracts..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="flex gap-2">
            <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
              <option>All Status</option>
              <option>Active</option>
              <option>Draft</option>
              <option>Expired</option>
            </select>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-sm">
              <th className="p-4 font-medium">Hotel Name</th>
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Valid Dates</th>
              <th className="p-4 font-medium">Price/Night</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <ContractRow 
              hotel="The Ritz-Carlton, Dubai" 
              title="Summer Special 2026" 
              dates="Jun 1 - Aug 31" 
              price="$350" 
              status="Active" 
            />
            <ContractRow 
              hotel="Burj Al Arab Jumeirah" 
              title="Weekend Getaway" 
              dates="Sep 1 - Dec 15" 
              price="$1,200" 
              status="Draft" 
            />
            <ContractRow 
              hotel="Atlantis The Palm" 
              title="Family Package" 
              dates="Jan 1 - Apr 30" 
              price="$450" 
              status="Expired" 
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContractRow({ hotel, title, dates, price, status }: { hotel: string, title: string, dates: string, price: string, status: string }) {
  const getStatusColor = (s: string) => {
    switch(s) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Draft': return 'bg-slate-100 text-slate-700';
      case 'Expired': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="p-4 font-medium text-slate-900">{hotel}</td>
      <td className="p-4 text-slate-600">{title}</td>
      <td className="p-4 text-slate-600">{dates}</td>
      <td className="p-4 font-medium text-slate-900">{price}</td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      </td>
      <td className="p-4 text-right">
        <button className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200 transition-colors">
          <MoreVertical size={18} />
        </button>
      </td>
    </tr>
  );
}

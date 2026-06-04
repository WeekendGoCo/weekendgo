import { Search, Filter, AlertTriangle, Link2, CheckCircle2 } from "lucide-react";

export default function HotelsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Mapped Hotels</h1>
        <button className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          Run Sync
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center bg-slate-50">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by hotel name or GIATA ID..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg flex items-center gap-2 text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={18} />
            Filter
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-sm">
              <th className="p-4 font-medium">Canonical Hotel</th>
              <th className="p-4 font-medium">GIATA ID</th>
              <th className="p-4 font-medium">WebBeds ID</th>
              <th className="p-4 font-medium">Booking ID</th>
              <th className="p-4 font-medium">TBO ID</th>
              <th className="p-4 font-medium text-right">Mapping Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <HotelRow 
              name="Atlantis The Royal" 
              giata="G-123456" 
              webbeds="W-9921" 
              booking="B-88321" 
              tbo="T-5512" 
              status="Complete" 
            />
            <HotelRow 
              name="Burj Al Arab Jumeirah" 
              giata="G-987654" 
              webbeds="W-1022" 
              booking="B-77211" 
              tbo="-" 
              status="Partial" 
            />
            <HotelRow 
              name="Jumeirah Beach Hotel" 
              giata="G-456123" 
              webbeds="-" 
              booking="-" 
              tbo="T-9921" 
              status="Warning" 
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HotelRow({ name, giata, webbeds, booking, tbo, status }: { name: string, giata: string, webbeds: string, booking: string, tbo: string, status: string }) {
  const renderStatus = (s: string) => {
    switch(s) {
      case 'Complete': 
        return <span className="flex items-center justify-end gap-1 text-green-600"><CheckCircle2 size={16} /> Complete</span>;
      case 'Partial': 
        return <span className="flex items-center justify-end gap-1 text-amber-500"><Link2 size={16} /> Partial</span>;
      case 'Warning': 
        return <span className="flex items-center justify-end gap-1 text-red-500"><AlertTriangle size={16} /> Needs Action</span>;
      default: 
        return <span>Unknown</span>;
    }
  };

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="p-4 font-medium text-slate-900">{name}</td>
      <td className="p-4 text-slate-500 font-mono text-xs">{giata}</td>
      <td className="p-4 text-slate-600">{webbeds}</td>
      <td className="p-4 text-slate-600">{booking}</td>
      <td className="p-4 text-slate-600">{tbo}</td>
      <td className="p-4 text-right">
        {renderStatus(status)}
      </td>
    </tr>
  );
}
